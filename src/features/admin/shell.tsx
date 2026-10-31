"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ArrowUpRight, Menu, X, LogOut } from "lucide-react";
const links = [
  ["", "Overview"],
  ["projects", "Projects"],
  ["services", "Services"],
  ["articles", "Journal"],
  ["inquiries", "Inquiries"],
  ["consultations", "Consultations"],
  ["media", "Media library"],
  ["testimonials", "Testimonials"],
  ["team", "Team"],
  ["homepage", "Homepage CMS"],
  ["seo", "SEO"],
  ["settings", "Settings"],
  ["security", "Security"],
];
export function AdminShell({
  children,
  name,
  role,
}: {
  children: React.ReactNode;
  name: string;
  role: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${open ? "show" : ""}`}>
        <Link href="/admin" className="wordmark">
          ARCHVISTA
          <span className="brand-dot" />
        </Link>
        <p className="eyebrow">THE STUDIO / CONTENT MANAGEMENT</p>
        <nav aria-label="Administration">
          {links
            .filter(
              ([key]) => role === "owner" || !["settings", "seo"].includes(key),
            )
            .map(([key, label]) => (
              <Link
                key={key}
                href={`/admin${key ? `/${key}` : ""}`}
                className={
                  path === `/admin${key ? `/${key}` : ""}` ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                {label}
                <span>↗</span>
              </Link>
            ))}
        </nav>
        <div className="admin-user">
          <span>{name}</span>
          <small>{role}</small>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle admin navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
          <span>Studio workspace</span>
          <Link href="/" target="_blank">
            View website <ArrowUpRight size={14} />
          </Link>
        </header>
        <main id="main" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
