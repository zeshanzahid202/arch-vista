import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="center-state" style={{ minHeight: "100vh" }}>
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>
        A little
        <br />
        <em>off the plan.</em>
      </h1>
      <p>
        The page you’re looking for may have moved, or is yet to take shape.
      </p>
      <Link className="button" href="/">
        Return to ArchVista ↗
      </Link>
    </main>
  );
}
