"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { safeUrl } from "@/lib/validation";
export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        "aria-label": "Rich text content",
        role: "textbox",
        "aria-multiline": "true",
        class: "rich-content tiptap-content",
      },
    },
  });
  if (!editor) return <p>Loading editor…</p>;
  return (
    <div className="rich-editor">
      <div
        className="editor-toolbar"
        role="toolbar"
        aria-label="Text formatting"
      >
        {[
          ["Bold", () => editor.chain().focus().toggleBold().run()],
          ["Italic", () => editor.chain().focus().toggleItalic().run()],
          [
            "Heading",
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          ],
          ["Bullets", () => editor.chain().focus().toggleBulletList().run()],
          ["Numbered", () => editor.chain().focus().toggleOrderedList().run()],
          ["Quote", () => editor.chain().focus().toggleBlockquote().run()],
          ["Undo", () => editor.chain().focus().undo().run()],
          ["Redo", () => editor.chain().focus().redo().run()],
        ].map(([label, action]) => (
          <button
            key={String(label)}
            type="button"
            onClick={action as () => void}
          >
            {String(label)}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
      <div className="inline-image-fields">
        <label>
          Inline image URL
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Paste a Cloudinary library URL"
          />
        </label>
        <label>
          Image description
          <input
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
          />
        </label>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            if (
              !safeUrl.safeParse(imageUrl).success ||
              imageAlt.trim().length < 3
            ) {
              setError(
                "Choose an allowed HTTPS image URL and add a description.",
              );
              return;
            }
            editor
              .chain()
              .focus()
              .setImage({ src: imageUrl, alt: imageAlt.trim() })
              .run();
            setImageUrl("");
            setImageAlt("");
            setError("");
          }}
        >
          Insert image
        </button>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
