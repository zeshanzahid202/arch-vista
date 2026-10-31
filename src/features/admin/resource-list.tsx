"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { api, useApi } from "./use-api";
import { MediaUpload } from "./upload";
import { Dialog } from "@/components/dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Content, PageResult, Resource } from "@/types/content";
type Row = Content & {
  email?: string;
  notificationStatus?: string;
  url?: string;
  alt?: string;
  folder?: string;
};
export const resourceLabels: Record<string, string> = {
  projects: "Projects",
  services: "Services",
  articles: "Journal",
  inquiries: "Inquiries",
  consultations: "Consultations",
  media: "Media library",
  testimonials: "Testimonials",
  team: "Team",
  homepage: "Homepage CMS",
  seo: "SEO",
  settings: "Settings",
};
export function ResourceList({ resource }: { resource: Resource }) {
  const [q, setQ] = useState("");
  const search = useDebouncedValue(q);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [projectType, setProjectType] = useState("");
  const { data, error, loading, reload } = useApi<PageResult<Row>>(
    `/api/admin/${resource}?${new URLSearchParams({ q: search, status, page: String(page), projectType })}`,
  );
  const submission = ["inquiries", "consultations"].includes(resource);
  const kv = ["homepage", "settings", "seo"].includes(resource);
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/api/admin/${resource}/${deleting}`, { method: "DELETE" });
      setDeleting(null);
      setNotice("Deleted successfully.");
      await reload();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">STUDIO CONTENT</span>
          <h1>{resourceLabels[resource]}</h1>
          <p>
            {submission
              ? "Manage conversations and follow up on project briefs."
              : "Create, curate, and publish your studio’s perspective."}
          </p>
        </div>
        {!submission && resource !== "media" && (
          <Link className="button" href={`/admin/${resource}/new`}>
            Create {kv ? "content" : "new"} +
          </Link>
        )}
      </div>
      {resource === "media" && <MediaUpload onUploaded={() => reload()} />}
      <div className="admin-filters">
        <label>
          <span className="sr-only">Search</span>
          <input
            type="search"
            placeholder="Search…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {!kv && resource !== "media" && (
          <label>
            <span className="sr-only">Filter status</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {(submission
                ? ["new", "contacted", "closed"]
                : ["draft", "published"]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        {resource === "consultations" && (
          <label>
            <span className="sr-only">Project type</span>
            <select
              value={projectType}
              onChange={(e) => {
                setProjectType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All project types</option>
              {[
                "Residential",
                "Commercial",
                "Interior",
                "Hospitality",
                "Renovation",
                "Spatial planning",
                "Other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <span>{data?.total ?? 0} records</span>
      </div>
      {notice && (
        <p className="form-status" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="form-status error">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading…</p>
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{submission ? "Client" : kv ? "Content key" : "Title"}</th>
                <th>
                  {submission
                    ? "Contact"
                    : resource === "media"
                      ? "Folder"
                      : "Status"}
                </th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="table-title">
                      {(item.cover?.url || item.url) && (
                        <Image
                          src={item.cover?.url || item.url!}
                          alt={item.cover?.alt || item.alt || ""}
                          width={64}
                          height={48}
                          style={{ objectFit: "cover" }}
                        />
                      )}
                      <span>
                        {submission ? item.name : kv ? item.key : item.title}
                        {item.demo && <small>Fictional demonstration</small>}
                        {submission && item.notificationStatus === "failed" && (
                          <small className="field-error">
                            Email notification needs retry
                          </small>
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    {submission ? (
                      item.email
                    ) : resource === "media" ? (
                      item.folder
                    ) : (
                      <span className={`status-pill ${item.status}`}>
                        {item.status || "Saved"}
                      </span>
                    )}
                  </td>
                  <td>
                    {new Date(
                      item.updatedAt || item.createdAt,
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/admin/${resource}/${item._id}`}>
                        {submission ? "View" : "Edit"}
                      </Link>
                      <button
                        className="delete-text"
                        onClick={() => setDeleting(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && (
            <div className="admin-empty">
              {q || status
                ? "No matching records."
                : "No records yet. Your content will appear here."}
            </div>
          )}
        </div>
      )}
      <div className="form-actions">
        <button
          className="button secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, data?.pages || 1)}
        </span>
        <button
          className="button secondary"
          disabled={!data || page >= data.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
      {deleting && (
        <Dialog
          label="Delete this record?"
          alert
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <h2 id="delete-title">Delete this record?</h2>
          <p>
            This permanently removes the record. Media in use cannot be deleted.
          </p>
          <div className="form-actions">
            <button
              autoFocus
              className="button secondary"
              onClick={() => setDeleting(null)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="button danger" disabled={busy} onClick={remove}>
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
