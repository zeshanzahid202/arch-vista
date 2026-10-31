import Link from "next/link";
import { Newsletter } from "@/features/forms/newsletter";
export function Footer({ settings }: { settings: Record<string, unknown> }) {
  const text = (key: string, fallback = "") =>
    typeof settings[key] === "string" ? String(settings[key]) : fallback;
  const email = text("email");
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-statement">
          <span className="eyebrow">
            ARCHITECTURE. INTERIORS. POSSIBILITIES.
          </span>
          <h2>{text("footerText", "Places to live.\nSpaces to feel.")}</h2>
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <Link href="/contact">Begin a conversation ↗</Link>
          )}
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/projects">Selected work</Link>
          <Link href="/about">Our story</Link>
          <Link href="/services">Expertise</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>Find us</h3>
          <p>{text("address", "Studio details coming soon")}</p>
          {text("phone") && (
            <a href={`tel:${text("phone")}`}>{text("phone")}</a>
          )}
          {["instagram", "linkedin", "pinterest"].map((key) => {
            const url = text(key);
            return /^https:\/\//.test(url) ? (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                {key} ↗
              </a>
            ) : null;
          })}
        </div>
        <div className="footer-newsletter">
          <h3>Notes from the studio</h3>
          <p>Occasional thoughts on thoughtful spaces.</p>
          <Newsletter />
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        ARCHVISTA
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {text("name", "ArchVista")}
        </span>
        <span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/admin">Studio access</Link>
        </span>
        <span>Architecture Shaped by Vision.</span>
      </div>
    </footer>
  );
}
