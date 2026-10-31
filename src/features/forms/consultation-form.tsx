"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { consultationSchema } from "@/lib/validation";
type Input = z.input<typeof consultationSchema>;
const steps: FieldPath<Input>[][] = [
  ["name", "email", "phone"],
  ["projectType", "location", "area", "budget", "timeline"],
  ["message", "consent"],
];
export function ConsultationForm() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Input, unknown, z.output<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    shouldUnregister: false,
  });
  async function next() {
    if (await trigger(steps[step], { shouldFocus: true }))
      setStep((s) => s + 1);
  }
  function field(
    name: FieldPath<Input>,
    label: string,
    type = "text",
    options?: string[],
  ) {
    return (
      <div
        className={`field ${name === "location" ? "full" : "full-mobile"}`}
        key={name}
      >
        <label htmlFor={`consult-${name}`}>{label}</label>
        {options ? (
          <select
            id={`consult-${name}`}
            {...register(name)}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-error`}
          >
            <option value="">Please select</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            id={`consult-${name}`}
            type={type}
            {...register(name)}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-error`}
            autoComplete={
              name === "name"
                ? "name"
                : name === "email"
                  ? "email"
                  : name === "phone"
                    ? "tel"
                    : "off"
            }
          />
        )}
        <span id={`${name}-error`} className="field-error">
          {errors[name]?.message}
        </span>
      </div>
    );
  }
  if (done)
    return (
      <div className="center-state">
        <Check size={40} strokeWidth={1} />
        <h2>
          A new possibility.
          <br />A conversation to come.
        </h2>
        <p>{message}</p>
        <Link href="/" className="text-link">
          Back to the studio <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="consultation-wrap">
      <div className="step-progress" aria-label={`Step ${step + 1} of 3`}>
        {["About you", "Your project", "The bigger picture"].map((s, i) => (
          <div
            key={s}
            className={i <= step ? "current" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <span>0{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <form
        noValidate
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            step < 2 &&
            (event.target as HTMLElement).tagName !== "TEXTAREA"
          ) {
            event.preventDefault();
            void next();
          }
        }}
        onSubmit={handleSubmit(
          async (data) => {
            if (step < 2) {
              await next();
              return;
            }
            setMessage("");
            try {
              const res = await fetch("/api/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const body = await res.json();
              if (!res.ok) {
                if (body.fields)
                  for (const [key, v] of Object.entries(body.fields))
                    setError(key as FieldPath<Input>, {
                      message: (v as string[])[0],
                    });
                throw new Error(body.error);
              }
              setMessage(body.message);
              setDone(true);
            } catch (e) {
              setMessage(
                e instanceof Error
                  ? e.message
                  : "Could not submit. Please try again.",
              );
            }
          },
          (validationErrors) => {
            const firstStep = steps.findIndex((fields) =>
              fields.some((field) => validationErrors[field]),
            );
            if (firstStep >= 0) setStep(firstStep);
          },
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="step-heading">
              {
                [
                  "First, a little about you.",
                  "Tell us about your project.",
                  "What do you imagine?",
                ][step]
              }
            </h2>
            <div className="form-grid">
              {step === 0 && (
                <>
                  {field("name", "Your name")}
                  {field("email", "Email address", "email")}
                  {field("phone", "Phone number", "tel")}
                </>
              )}
              {step === 1 && (
                <>
                  {field("projectType", "Project type", "text", [
                    "Residential",
                    "Commercial",
                    "Interior",
                    "Hospitality",
                    "Renovation",
                    "Spatial planning",
                    "Other",
                  ])}
                  {field("area", "Estimated area (include unit)")}
                  {field("location", "Project location")}
                  {field("budget", "Budget range", "text", [
                    "Under $100k",
                    "$100k–$300k",
                    "$300k–$750k",
                    "$750k–$1.5m",
                    "$1.5m+",
                    "To be discussed",
                  ])}
                  {field("timeline", "When would you like to begin?", "text", [
                    "Within 3 months",
                    "3–6 months",
                    "6–12 months",
                    "Exploring possibilities",
                  ])}
                </>
              )}
              {step === 2 && (
                <>
                  <div className="field full">
                    <label htmlFor="consult-message">
                      Your vision, requirements, and anything else we should
                      know
                    </label>
                    <textarea
                      id="consult-message"
                      {...register("message")}
                      aria-describedby="message-error"
                    />
                    <span id="message-error" className="field-error">
                      {errors.message?.message}
                    </span>
                  </div>
                  <div className="full field">
                    <label className="checkbox-label">
                      <input type="checkbox" {...register("consent")} />I agree
                      to the <Link href="/privacy">privacy policy</Link> and
                      consent to being contacted about this project.
                    </label>
                    <span className="field-error">
                      {errors.consent?.message}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="sr-only" aria-hidden="true">
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-label="Website"
            {...register("website")}
          />
        </div>
        {message && (
          <p className="form-status error" role="alert">
            {message}
          </p>
        )}
        <div className="form-actions">
          {step > 0 ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="button" className="button" onClick={next}>
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button className="button" disabled={isSubmitting}>
              {isSubmitting ? "Sending your brief…" : "Send project brief"}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 10, marginTop: 25 }}>
          Your details are used only to respond to your project inquiry.
        </p>
      </form>
    </div>
  );
}
