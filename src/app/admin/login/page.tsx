import { LoginForm } from "@/features/admin/login-form";
import Link from "next/link";
export default function Login() {
  return (
    <main id="main" className="admin-login">
      <div>
        <Link href="/" className="wordmark">
          ARCHVISTA
          <span className="brand-dot" />
        </Link>
        <p className="eyebrow" style={{ marginTop: 50 }}>
          PRIVATE STUDIO ACCESS
        </p>
        <h1>
          Welcome
          <br />
          <em>to the studio.</em>
        </h1>
        <p>Sign in to manage your work, stories, and conversations.</p>
        <LoginForm />
        <Link href="/" className="text-link" style={{ marginTop: 35 }}>
          ← Back to website
        </Link>
      </div>
      <div className="login-art" aria-hidden="true">
        <span>
          Architecture
          <br />
          Shaped by Vision.
        </span>
      </div>
    </main>
  );
}
