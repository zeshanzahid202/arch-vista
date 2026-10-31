// Download only mongod.exe from the official archive using ZIP byte ranges.
// This avoids downloading hundreds of MB of unrelated Windows debug symbols.
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inflateRawSync } from "node:zlib";
const url =
  "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.24.zip";
async function range(value) {
  const r = await fetch(url, {
    headers: { Range: value },
    signal: AbortSignal.timeout(120000),
  });
  if (r.status !== 206)
    throw new Error(`Archive server must support ranges (${r.status})`);
  return {
    bytes: Buffer.from(await r.arrayBuffer()),
    contentRange: r.headers.get("content-range"),
  };
}
const tail = await range("bytes=-65557");
let end = -1;
for (let i = tail.bytes.length - 22; i >= 0; i--)
  if (tail.bytes.readUInt32LE(i) === 0x06054b50) {
    end = i;
    break;
  }
if (end < 0) throw new Error("ZIP directory not found");
const directorySize = tail.bytes.readUInt32LE(end + 12),
  directoryOffset = tail.bytes.readUInt32LE(end + 16);
const directory = (
  await range(`bytes=${directoryOffset}-${directoryOffset + directorySize - 1}`)
).bytes;
let entry;
for (let p = 0; p < directory.length;) {
  if (directory.readUInt32LE(p) !== 0x02014b50)
    throw new Error("Invalid ZIP directory");
  const nameLength = directory.readUInt16LE(p + 28),
    extraLength = directory.readUInt16LE(p + 30),
    commentLength = directory.readUInt16LE(p + 32);
  const name = directory.subarray(p + 46, p + 46 + nameLength).toString();
  if (name.endsWith("/bin/mongod.exe"))
    entry = {
      method: directory.readUInt16LE(p + 10),
      crc: directory.readUInt32LE(p + 16),
      compressed: directory.readUInt32LE(p + 20),
      size: directory.readUInt32LE(p + 24),
      offset: directory.readUInt32LE(p + 42),
    };
  p += 46 + nameLength + extraLength + commentLength;
}
if (
  !entry ||
  entry.size > 300 * 1024 * 1024 ||
  entry.compressed > 200 * 1024 * 1024
)
  throw new Error("Expected database binary not found");
console.log(
  `Downloading mongod.exe only (${Math.round(entry.compressed / 1024 / 1024)} MB compressed).`,
);
const header = (await range(`bytes=${entry.offset}-${entry.offset + 29}`))
  .bytes;
if (header.readUInt32LE(0) !== 0x04034b50) throw new Error("Invalid ZIP entry");
const start =
  entry.offset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
// Multiple modest ranges make slow connections retryable without starting over.
const chunks = [];
const step = 2 * 1024 * 1024;
for (let p = 0; p < entry.compressed; p += step) {
  const last = Math.min(entry.compressed, p + step);
  const part = await range(`bytes=${start + p}-${start + last - 1}`);
  if (part.bytes.length !== last - p)
    throw new Error("Incomplete binary range");
  chunks.push(part.bytes);
  console.log(`Received ${Math.round((last / entry.compressed) * 100)}%`);
}
const compressed = Buffer.concat(chunks);
const binary = entry.method === 8 ? inflateRawSync(compressed) : compressed;
let crc = 0xffffffff;
for (const b of binary) {
  crc ^= b;
  for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
}
crc = (crc ^ 0xffffffff) >>> 0;
if (
  binary.length !== entry.size ||
  crc !== entry.crc ||
  binary[0] !== 77 ||
  binary[1] !== 90
)
  throw new Error("Binary integrity check failed");
const directoryPath = resolve(".local/mongodb");
await mkdir(directoryPath, { recursive: true });
await writeFile(resolve(directoryPath, "mongod.exe"), binary);
console.log(
  "Verified archive CRC and wrote .local/mongodb/mongod.exe. Verify the vendor signature before use.",
);
