"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { api, useApi } from "./use-api";
export function SecurityPanel() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error } = useApi<
    {
      _id: string;
      actor?: { name: string };
      action: string;
      resource: string;
      createdAt: string;
    }[]
  >("/api/admin/security");
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">ACCESS & ACCOUNTABILITY</span>
          <h1>Studio security.</h1>
        </div>
      </div>
      <section className="admin-panel">
        <h2>Change your password</h2>
        <p>
          This signs out all sessions for your account. Use at least 14
          characters.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setMessage("");
            try {
              const result = await api<{ message: string }>(
                "/api/admin/security",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(form)),
                },
              );
              setMessage(result.message);
              await signOut({ callbackUrl: "/admin/login" });
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={14}
                maxLength={128}
                required
              />
            </div>
          </div>
          <button className="button" disabled={busy} style={{ marginTop: 25 }}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
        {message && (
          <p className="form-status" role="status">
            {message}
          </p>
        )}
      </section>
      <section className="admin-panel">
        <h2>Audit trail</h2>
        {error && <p>{error}</p>}
        {data?.map((log) => (
          <div className="activity-row" key={log._id}>
            <span>
              {log.action} · {log.resource}
              <small>{log.actor?.name || "System"}</small>
            </span>
            <time>{new Date(log.createdAt).toLocaleString()}</time>
          </div>
        ))}
      </section>
    </>
  );
}
