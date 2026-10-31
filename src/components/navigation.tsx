"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function Navigation({ name = "ArchVista" }: { name?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const links = [
    ["/about", "About"],
    ["/projects", "Projects"],
    ["/services", "Services"],
    ["/studio", "Studio"],
    ["/journal", "Journal"],
  ];
  return (
    <header
      className={`navigation ${pathname === "/" && !scrolled ? "over-hero" : ""}`}
    >
      <Link href="/" className="wordmark" aria-label={`${name} home`}>
        {name.toUpperCase()}
        <span className="brand-dot" />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([href, label]) => (
          <Link
            className={pathname.startsWith(href) ? "active" : ""}
            key={href}
            href={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/consultation" className="nav-cta">
        Let’s talk <ArrowUpRight size={16} />
      </Link>
      <button
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {[
            ...links,
            ["/contact", "Contact"],
            ["/consultation", "Start a project"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
