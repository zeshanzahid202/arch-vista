"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check } from "lucide-react";
import { contactSchema } from "@/lib/validation";
export function ContactForm() {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<
    z.input<typeof contactSchema>,
    unknown,
    z.output<typeof contactSchema>
  >({ resolver: zodResolver(contactSchema) });
  if (done)
    return (
      <div className="center-state">
        <Check size={35} strokeWidth={1} />
        <h2>
          Thank you for
          <br />
          starting the conversation.
        </h2>
        <p>{message}</p>
        <Link className="text-link" href="/projects">
          Explore the portfolio <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        setMessage("");
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const body = await res.json();
          if (!res.ok) {
            if (body.fields)
              for (const [key, values] of Object.entries(body.fields))
                setError(key as keyof typeof data, {
                  message: (values as string[])[0],
                });
            throw new Error(body.error);
          }
          setMessage(body.message);
          setDone(true);
        } catch (e) {
          setMessage(
            e instanceof Error
              ? e.message
              : "Could not send. Please try again.",
          );
        }
      })}
      noValidate
    >
      <div className="form-grid">
        {[
          ["name", "Your name", "text"],
          ["email", "Email address", "email"],
          ["phone", "Phone (optional)", "tel"],
        ].map(([key, label, type]) => (
          <div
            className={`field ${key === "phone" ? "full" : "full-mobile"}`}
            key={key}
          >
            <label htmlFor={`contact-${key}`}>{label}</label>
            <input
              id={`contact-${key}`}
              type={type}
              autoComplete={
                key === "name" ? "name" : key === "email" ? "email" : "tel"
              }
              {...register(key as "name" | "email" | "phone")}
              aria-invalid={Boolean(errors[key as keyof typeof errors])}
              aria-describedby={`contact-${key}-error`}
            />
            <span className="field-error" id={`contact-${key}-error`}>
              {errors[key as keyof typeof errors]?.message}
            </span>
          </div>
        ))}
        <div className="field full">
          <label htmlFor="contact-message">Tell us what you have in mind</label>
          <textarea
            id="contact-message"
            {...register("message")}
            aria-describedby="contact-message-error"
          />
          <span className="field-error" id="contact-message-error">
            {errors.message?.message}
          </span>
        </div>
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>
      <label className="checkbox-label">
        <input type="checkbox" {...register("consent")} />I agree to the{" "}
        <Link href="/privacy">privacy policy</Link> and consent to being
        contacted about my inquiry.
      </label>
      {errors.consent && (
        <p className="field-error">{errors.consent.message}</p>
      )}
      {message && (
        <p className="form-status error" role="alert">
          {message}
        </p>
      )}
      <div className="form-actions">
        <button disabled={isSubmitting} className="button">
          {isSubmitting ? "Sending your message…" : "Send your message"}
          <ArrowUpRight size={17} />
        </button>
      </div>
    </form>
  );
}
