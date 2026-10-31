"use client";
import { useState } from "react";
import type { ImageAsset } from "@/types/content";
export function MediaUpload({
  onUploaded,
}: {
  onUploaded: (image: ImageAsset) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="upload-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = e.currentTarget;
        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: new FormData(form),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error);
          onUploaded({ url: body.url, alt: body.alt, publicId: body.publicId });
          form.reset();
          setError("Image uploaded to the media library.");
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Upload an image</h3>
      <p>
        JPEG, PNG, or WebP · maximum 4 MB. Provide a useful visual description.
      </p>
      <div className="upload-fields">
        <label>
          Image
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        <label>
          Alt text
          <input
            name="alt"
            minLength={3}
            maxLength={300}
            required
            placeholder="Describe what the image shows"
          />
        </label>
        <label>
          Folder
          <input
            name="folder"
            defaultValue="archvista"
            pattern="[a-zA-Z0-9/_-]+"
            required
          />
        </label>
        <button disabled={busy} className="button">
          {busy ? "Uploading…" : "Upload image ↑"}
        </button>
      </div>
      {error && (
        <p role="status" className="form-status">
          {error}
        </p>
      )}
    </form>
  );
}
