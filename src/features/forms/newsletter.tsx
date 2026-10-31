"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
export function Newsletter() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        const data = new FormData(form);
        try {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.get("email"), consent: true }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error);
          setMessage(body.message);
          form.reset();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not subscribe. Please try again.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="newsletter-input">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Your email address"
          required
          maxLength={200}
        />
        <button disabled={busy} aria-label="Subscribe to journal updates">
          <ArrowRight size={20} />
        </button>
      </div>
      <label className="checkbox-label">
        <input type="checkbox" required />I agree to the{" "}
        <a href="/privacy">privacy policy</a>.
      </label>
      <p role="status">{message}</p>
    </form>
  );
}
