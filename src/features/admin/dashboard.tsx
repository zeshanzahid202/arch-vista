"use client";
import Link from "next/link";
import { useApi } from "./use-api";
interface DashboardData {
  stats: Record<string, number>;
  recent: {
    _id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  }[];
  activity: {
    _id: string;
    action: string;
    resource: string;
    actor?: { name: string };
    createdAt: string;
  }[];
  monthly: { _id: string; count: number }[];
}
export function Dashboard() {
  const { data, error, loading, reload } = useApi<DashboardData>(
    "/api/admin/dashboard",
  );
  if (error)
    return (
      <div className="form-status error" role="alert">
        {error}
        <button onClick={reload}>Retry</button>
      </div>
    );
  if (loading || !data) return <p role="status">Loading studio activity…</p>;
  const labels: Record<string, string> = {
    projects: "Total projects",
    published: "Published projects",
    drafts: "Draft projects",
    inquiries: "Total inquiries",
    newInquiries: "New inquiries",
    consultations: "Consultation requests",
    articles: "Published articles",
  };
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR STUDIO AT A GLANCE</span>
          <h1>A clear perspective.</h1>
          <p>Live content and conversations from your database.</p>
        </div>
        <Link href="/admin/projects/new" className="button">
          Add a project ↗
        </Link>
      </div>
      <div className="stats-grid">
        {Object.entries(data.stats).map(([key, count]) => (
          <div key={key}>
            <span>{labels[key]}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Inquiries over the last six months</h2>
        {data.monthly.length ? (
          <div
            className="dashboard-chart"
            role="img"
            aria-label={data.monthly
              .map((m) => `${m._id}: ${m.count} inquiries`)
              .join(", ")}
          >
            {data.monthly.map((m) => (
              <div key={m._id}>
                <span>{m.count}</span>
                <div
                  style={{
                    height: `${Math.max(5, (m.count / Math.max(...data.monthly.map((x) => x.count))) * 130)}px`,
                  }}
                />
                <small>{m._id}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>
            No inquiry data yet. Your chart will appear as submissions arrive.
          </p>
        )}
      </section>
      <div className="admin-two-col">
        <section className="admin-panel">
          <h2>Recent conversations</h2>
          {data.recent.length ? (
            data.recent.map((r) => (
              <Link
                className="activity-row"
                key={r._id}
                href={`/admin/inquiries/${r._id}`}
              >
                <span>
                  {r.name}
                  <small>{r.email}</small>
                </span>
                <span className="status-pill">{r.status}</span>
              </Link>
            ))
          ) : (
            <p>No submissions yet.</p>
          )}
        </section>
        <section className="admin-panel">
          <h2>Recent studio activity</h2>
          {data.activity.length ? (
            data.activity.map((a) => (
              <div className="activity-row" key={a._id}>
                <span>
                  {a.action} · {a.resource}
                  <small>{a.actor?.name || "System"}</small>
                </span>
                <time>{new Date(a.createdAt).toLocaleDateString()}</time>
              </div>
            ))
          ) : (
            <p>No activity yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
