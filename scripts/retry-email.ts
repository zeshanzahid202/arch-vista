import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Inquiry, Consultation } from "../src/models";
import { notifySubmission } from "../src/lib/email";
async function main() {
  await connectDB();
  let count = 0;
  for (const model of [Inquiry, Consultation]) {
    const records = await model
      .find({ notificationStatus: { $in: ["pending", "failed"] } })
      .limit(100);
    for (const r of records) {
      await notifySubmission(
        model === Consultation
          ? "consultation"
          : r.kind === "newsletter"
            ? "newsletter"
            : "contact",
        String(r._id),
      );
      count++;
    }
  }
  console.log(
    `Processed ${count} queued notification(s). Check each record’s notification status in the dashboard.`,
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
