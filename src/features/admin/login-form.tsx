"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          const result = await signIn("credentials", {
            email: data.get("email"),
            password: data.get("password"),
            redirect: false,
          });
          if (result?.error)
            setError("Sign-in failed. Check your details or try again later.");
          else {
            router.replace("/admin");
            router.refresh();
          }
        } catch {
          setError("Sign-in is temporarily unavailable. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={200}
        />
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </div>
      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button"
        disabled={busy}
        style={{ marginTop: 30, width: "100%" }}
      >
        {busy ? "Signing in…" : "Sign in to the studio ↗"}
      </button>
    </form>
  );
}
