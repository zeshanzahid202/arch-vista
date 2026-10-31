"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { api, useApi } from "./use-api";
import { resourceLabels } from "./resource-list";
import { RichEditor } from "./rich-editor";
import { MediaUpload } from "./upload";
import type {
  Content,
  ImageAsset,
  Resource,
  PageResult,
  Submission,
} from "@/types/content";
import { categories } from "@/config/site";
import { Dialog } from "@/components/dialog";
type Editable = Partial<Content> &
  Partial<Submission> & { url?: string; alt?: string; folder?: string };
const defaults: Editable = {
  title: "",
  slug: "",
  status: "draft",
  summary: "",
  body: "",
  category: "",
  gallery: [],
  featured: false,
  order: 0,
  benefits: [],
  stages: [],
  faqs: [],
  tags: [],
  seo: {},
  demo: false,
  approved: false,
};
export function ResourceEditor({
  resource,
  id,
}: {
  resource: Resource;
  id: string;
}) {
  const isNew = id === "new";
  const { data, error, loading } = useApi<Editable>(
    isNew ? `/api/admin/${resource}?limit=1` : `/api/admin/${resource}/${id}`,
  );
  if (loading) return <p role="status">Loading editor…</p>;
  if (error)
    return (
      <p role="alert" className="form-status error">
        {error}
      </p>
    );
  return (
    <EditorForm
      key={id}
      resource={resource}
      id={id}
      initial={isNew ? defaults : data || defaults}
    />
  );
}
function EditorForm({
  resource,
  id,
  initial,
}: {
  resource: Resource;
  id: string;
  initial: Editable;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Editable>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [library, setLibrary] = useState<"cover" | "gallery" | null>(null);
  const submission = resource === "inquiries" || resource === "consultations";
  const kv = ["homepage", "settings", "seo"].includes(resource);
  const media = resource === "media";
  const isNew = id === "new";
  const defaultKey =
    resource === "homepage"
      ? "home"
      : resource === "settings"
        ? "studio"
        : "default";
  const [value, setValue] = useState<Record<string, unknown>>(
    initial.value || {},
  );
  function update<K extends keyof Editable>(key: K, value: Editable[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function text(
    key: keyof Editable,
    label: string,
    multi = false,
    required = false,
  ) {
    return (
      <div className={`field ${multi ? "full" : ""}`} key={key}>
        <label htmlFor={`editor-${key}`}>{label}</label>
        {multi ? (
          <textarea
            id={`editor-${key}`}
            value={String(draft[key] || "")}
            onChange={(e) => update(key, e.target.value)}
            required={required}
          />
        ) : (
          <input
            id={`editor-${key}`}
            value={String(draft[key] ?? "")}
            onChange={(e) => {
              update(key, e.target.value);
              const previousSlug = (draft.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              if (
                key === "title" &&
                isNew &&
                (!draft.slug || draft.slug === previousSlug)
              )
                update(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                );
            }}
            required={required}
          />
        )}
      </div>
    );
  }
  function kvField(key: string, label: string, multi = false) {
    return (
      <div className={`field ${multi ? "full" : ""}`} key={key}>
        <label htmlFor={`value-${key}`}>{label}</label>
        {multi ? (
          <textarea
            id={`value-${key}`}
            value={String(value[key] ?? "")}
            onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.value }))}
          />
        ) : (
          <input
            id={`value-${key}`}
            value={String(value[key] ?? "")}
            onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.value }))}
          />
        )}
      </div>
    );
  }
  async function save(status?: "draft" | "published") {
    setBusy(true);
    setMessage("");
    try {
      const payload = submission
        ? { status: draft.status, notes: draft.notes || "" }
        : kv
          ? { key: draft.key || defaultKey, value }
          : media
            ? { title: draft.title, alt: draft.alt, folder: draft.folder }
            : {
                ...draft,
                ...(status ? { status } : {}),
                year: draft.year ? Number(draft.year) : undefined,
              };
      const result = await api<Editable>(
        `/api/admin/${resource}${isNew ? "" : `/${id}`}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      setDraft(result);
      setMessage(
        "Saved successfully. Public content reflects published changes.",
      );
      if (isNew) router.replace(`/admin/${resource}/${result._id}`);
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function addImage(image: ImageAsset) {
    if (library === "gallery")
      update("gallery", [...(draft.gallery || []), image]);
    else update("cover", image);
    setLibrary(null);
  }
  const fields =
    resource === "homepage"
      ? [
          ["heroTitle", "Hero title (line breaks welcome)", true],
          ["heroSubtitle", "Hero subtitle", true],
          ["heroImage", "Hero image URL"],
          ["heroAlt", "Hero image description"],
          ["introTitle", "Introduction title", true],
          ["introText", "Introduction text", true],
          ["philosophyTitle", "Philosophy title"],
          ["philosophyText", "Philosophy text", true],
          ["ctaTitle", "Consultation title", true],
          ["ctaText", "Consultation text", true],
        ]
      : resource === "settings"
        ? [
            ["name", "Studio name"],
            ["email", "Contact email"],
            ["phone", "Phone"],
            ["address", "Studio address", true],
            ["instagram", "Instagram URL"],
            ["linkedin", "LinkedIn URL"],
            ["pinterest", "Pinterest URL"],
            ["description", "Default SEO description", true],
            ["footerText", "Footer statement", true],
          ]
        : [
            ["title", "Default SEO title"],
            ["description", "Meta description", true],
            ["image", "Open Graph image URL"],
            ["canonical", "Canonical URL"],
          ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link href={`/admin/${resource}`} className="eyebrow">
            ← {resourceLabels[resource]}
          </Link>
          <h1>
            {submission
              ? "The conversation."
              : isNew
                ? "A new perspective."
                : "Refine the details."}
          </h1>
        </div>
        <div className="editor-actions">
          {!submission && !kv && !media && (
            <>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => save("draft")}
              >
                Save draft
              </button>
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={() => save("published")}
              >
                {busy ? "Saving…" : "Publish ↗"}
              </button>
            </>
          )}
          {(submission || kv || media) && (
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => save()}
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          )}
        </div>
      </div>
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}
      {submission ? (
        <>
          <section className="admin-panel">
            <h2>{draft.name}</h2>
            <dl className="brief-details">
              {Object.entries(draft)
                .filter(([key]) =>
                  [
                    "email",
                    "phone",
                    "projectType",
                    "location",
                    "area",
                    "budget",
                    "timeline",
                    "message",
                    "createdAt",
                    "consent",
                    "notificationStatus",
                    "kind",
                  ].includes(key),
                )
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k.replace(/([A-Z])/g, " $1")}</dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="admin-panel">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="request-status">Request status</label>
                <select
                  id="request-status"
                  value={draft.status}
                  onChange={(e) =>
                    update("status", e.target.value as Editable["status"])
                  }
                >
                  {["new", "contacted", "closed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              {text("notes", "Internal notes", true)}
            </div>
          </section>
        </>
      ) : kv ? (
        <section className="admin-panel">
          <h2>{resourceLabels[resource]}</h2>
          <p>
            Use the key “{defaultKey}” for this website’s active configuration.
          </p>
          <div className="form-grid">
            {text("key", "Content key")}
            {fields.map(([key, label, multi]) =>
              kvField(String(key), String(label), Boolean(multi)),
            )}
            {resource === "seo" && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!value.noIndex}
                  onChange={(e) =>
                    setValue((v) => ({ ...v, noIndex: e.target.checked }))
                  }
                />
                Hide the website from search engine indexing
              </label>
            )}
          </div>
          {resource === "homepage" && (
            <p className="editor-help">
              Featured projects, services, and testimonials come from their
              published collections. Use the featured checkbox on projects,
              display order on services, and approval on testimonials to curate
              the homepage.
            </p>
          )}
        </section>
      ) : media ? (
        <section className="admin-panel">
          {draft.url && (
            <Image
              src={draft.url}
              alt={draft.alt || ""}
              width={800}
              height={500}
              style={{ objectFit: "contain", maxHeight: 450, width: "100%" }}
            />
          )}
          <div className="form-grid">
            {text("title", "Title", false, true)}
            {text("alt", "Alt text", false, true)}
            {text("folder", "Library folder", false, true)}
          </div>
          <p className="editor-help">
            Folder changes organize the library record. The Cloudinary public ID
            remains stable.
          </p>
          <a
            href={draft.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Open original image ↗
          </a>
        </section>
      ) : (
        <div className="editor-layout">
          <div>
            <section className="admin-panel">
              <h2>The essentials</h2>
              <div className="form-grid">
                {text("title", "Title", false, true)}
                {text("slug", "URL slug", false, true)}
                {text("summary", "Short description", true)}
                {["team", "testimonials"].includes(resource) && (
                  <>
                    {text("name", "Name", false, true)}
                    {text("role", "Role or client description")}
                  </>
                )}
                {resource === "testimonials" &&
                  text("quote", "Testimonial quotation", true, true)}
                <div className="field">
                  <label htmlFor="content-category">Category</label>
                  {resource === "projects" ? (
                    <select
                      id="content-category"
                      value={draft.category}
                      onChange={(e) => update("category", e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="content-category"
                      value={draft.category || ""}
                      onChange={(e) => update("category", e.target.value)}
                    />
                  )}
                </div>
                <div className="field">
                  <label htmlFor="content-order">Display order</label>
                  <input
                    id="content-order"
                    type="number"
                    min={0}
                    max={10000}
                    value={draft.order || 0}
                    onChange={(e) => update("order", Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="editor-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={!!draft.featured}
                    onChange={(e) => update("featured", e.target.checked)}
                  />
                  Featured
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!draft.demo}
                    onChange={(e) => update("demo", e.target.checked)}
                  />
                  Fictional demonstration content
                </label>
                {resource === "testimonials" && (
                  <label>
                    <input
                      type="checkbox"
                      checked={!!draft.approved}
                      onChange={(e) => update("approved", e.target.checked)}
                    />
                    Approved for publication
                  </label>
                )}
              </div>
            </section>
            <section className="admin-panel">
              <h2>Content & story</h2>
              <RichEditor
                value={draft.body || ""}
                onChange={(v) => update("body", v)}
              />
            </section>
            {resource === "projects" && (
              <section className="admin-panel">
                <h2>Project details</h2>
                <div className="form-grid">
                  {text("location", "Project location")}
                  <div className="field">
                    <label htmlFor="project-year">Completion year</label>
                    <input
                      id="project-year"
                      type="number"
                      min={1900}
                      max={2200}
                      value={draft.year || ""}
                      onChange={(e) =>
                        update(
                          "year",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  {text("area", "Area (include unit)")}
                  {text("concept", "Design concept", true)}
                  {text("materials", "Materials", true)}
                  {text("challenges", "Design challenges", true)}
                  {text("solution", "Architectural solution", true)}
                </div>
              </section>
            )}
            {resource === "services" && (
              <section className="admin-panel">
                <h2>Benefits, process & FAQs</h2>
                <div className="form-grid">
                  {(["benefits", "stages"] as const).map((key) => (
                    <div className="field full" key={key}>
                      <label htmlFor={`service-${key}`}>
                        {key === "benefits" ? "Benefits" : "Project stages"}{" "}
                        (one per line)
                      </label>
                      <textarea
                        id={`service-${key}`}
                        value={draft[key]?.join("\n") || ""}
                        onChange={(e) =>
                          update(key, e.target.value.split("\n"))
                        }
                      />
                    </div>
                  ))}
                </div>
                <h3 style={{ margin: "25px 0" }}>Frequently asked questions</h3>
                {draft.faqs?.map((faq, i) => (
                  <div className="faq-editor" key={i}>
                    <input
                      aria-label={`Question ${i + 1}`}
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) =>
                        update(
                          "faqs",
                          draft.faqs!.map((f, j) =>
                            j === i ? { ...f, question: e.target.value } : f,
                          ),
                        )
                      }
                    />
                    <textarea
                      aria-label={`Answer ${i + 1}`}
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) =>
                        update(
                          "faqs",
                          draft.faqs!.map((f, j) =>
                            j === i ? { ...f, answer: e.target.value } : f,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "faqs",
                          draft.faqs!.filter((_, j) => j !== i),
                        )
                      }
                    >
                      Remove FAQ
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    update("faqs", [
                      ...(draft.faqs || []),
                      { question: "", answer: "" },
                    ])
                  }
                >
                  Add question +
                </button>
              </section>
            )}
            {resource === "articles" && (
              <section className="admin-panel">
                <h2>Article details</h2>
                <div className="form-grid">
                  {text("author", "Author")}
                  <div className="field">
                    <label htmlFor="article-tags">Tags (comma separated)</label>
                    <input
                      id="article-tags"
                      value={draft.tags?.join(", ") || ""}
                      onChange={(e) =>
                        update(
                          "tags",
                          e.target.value.split(",").map((v) => v.trim()),
                        )
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="publication-date">Publication date</label>
                    <input
                      id="publication-date"
                      type="datetime-local"
                      value={
                        draft.publishedAt ? draft.publishedAt.slice(0, 16) : ""
                      }
                      onChange={(e) =>
                        update(
                          "publishedAt",
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </section>
            )}
            <section className="admin-panel">
              <h2>Search & social</h2>
              <div className="form-grid">
                {[
                  ["title", "SEO title"],
                  ["description", "Meta description"],
                  ["image", "Open Graph image URL"],
                  ["canonical", "Canonical HTTPS URL"],
                ].map(([key, label]) => (
                  <div className="field" key={key}>
                    <label htmlFor={`seo-${key}`}>{label}</label>
                    <input
                      id={`seo-${key}`}
                      value={String(
                        draft.seo?.[key as keyof Content["seo"]] || "",
                      )}
                      onChange={(e) => {
                        const next = {
                          ...draft.seo,
                          [key]: e.target.value || undefined,
                        };
                        update("seo", next);
                      }}
                    />
                  </div>
                ))}
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!draft.seo?.noIndex}
                  onChange={(e) =>
                    update("seo", { ...draft.seo, noIndex: e.target.checked })
                  }
                />
                Hide this page from search engines
              </label>
            </section>
          </div>
          <aside>
            <section className="admin-panel">
              <h2>Publication</h2>
              <p>
                Current status:{" "}
                <span className="status-pill">{draft.status}</span>
              </p>
              <p className="editor-help">
                Publishing requires a summary, content, and a cover image.
                Drafts are visible only to signed-in administrators.
              </p>
              {!isNew &&
                draft.status === "published" &&
                ["projects", "services", "articles"].includes(resource) && (
                  <Link
                    className="text-link"
                    target="_blank"
                    href={`/${resource === "articles" ? "journal" : resource}/${draft.slug}`}
                  >
                    View published page ↗
                  </Link>
                )}
            </section>
            <section className="admin-panel">
              <h2>Cover image</h2>
              {draft.cover && (
                <>
                  <Image
                    src={draft.cover.url}
                    alt={draft.cover.alt}
                    width={400}
                    height={300}
                    style={{ objectFit: "cover", width: "100%" }}
                  />
                  <div className="field">
                    <label htmlFor="cover-alt">Image description</label>
                    <input
                      id="cover-alt"
                      value={draft.cover.alt}
                      onChange={(e) =>
                        update("cover", {
                          ...draft.cover!,
                          alt: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                className="button secondary"
                style={{ marginTop: 20 }}
                onClick={() => setLibrary("cover")}
              >
                {draft.cover ? "Replace image" : "Choose image"}
              </button>
            </section>
            <section className="admin-panel">
              <h2>Gallery</h2>
              {draft.gallery?.map((image, i) => (
                <div className="gallery-editor-item" key={`${image.url}-${i}`}>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={180}
                    height={110}
                    style={{ objectFit: "cover" }}
                  />
                  <input
                    aria-label={`Gallery image ${i + 1} alt text`}
                    value={image.alt}
                    onChange={(e) =>
                      update(
                        "gallery",
                        draft.gallery!.map((v, j) =>
                          i === j ? { ...v, alt: e.target.value } : v,
                        ),
                      )
                    }
                  />
                  <div>
                    <button
                      type="button"
                      aria-label="Move image up"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...draft.gallery!];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        update("gallery", next);
                      }}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move image down"
                      disabled={i === draft.gallery!.length - 1}
                      onClick={() => {
                        const next = [...draft.gallery!];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        update("gallery", next);
                      }}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove image from gallery"
                      onClick={() =>
                        update(
                          "gallery",
                          draft.gallery!.filter((_, j) => i !== j),
                        )
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="button secondary"
                onClick={() => setLibrary("gallery")}
              >
                Add gallery image +
              </button>
            </section>
          </aside>
        </div>
      )}
      {library && (
        <Dialog
          className="media-picker"
          label="Choose an image"
          onClose={() => setLibrary(null)}
        >
          <button
            autoFocus
            className="modal-close"
            onClick={() => setLibrary(null)}
            aria-label="Close image library"
          >
            <X />
          </button>
          <h2>Choose an image</h2>
          <MediaUpload onUploaded={addImage} />
          <ImageLibrary onSelect={addImage} />
        </Dialog>
      )}
    </>
  );
}
function ImageLibrary({ onSelect }: { onSelect: (image: ImageAsset) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading } = useApi<
    PageResult<{ _id: string; url: string; alt: string; publicId: string }>
  >(`/api/admin/media?q=${encodeURIComponent(query)}&page=${page}`);
  return (
    <>
      <label className="field">
        <span>Search library</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Loading images…</p>
      ) : (
        <div className="media-picker-grid">
          {data?.items.map((i) => (
            <button key={i._id} type="button" onClick={() => onSelect(i)}>
              <Image
                src={i.url}
                alt={i.alt}
                width={180}
                height={130}
                style={{ objectFit: "cover", width: "100%" }}
              />
              <span>{i.alt}</span>
            </button>
          ))}
        </div>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="button secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={!data || page >= data.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
