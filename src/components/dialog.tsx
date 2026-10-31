"use client";
import { useEffect, useRef } from "react";
export function Dialog({
  children,
  label,
  onClose,
  className = "",
  alert = false,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
  className?: string;
  alert?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ) || [],
      ).filter((e) => e.getClientRects().length > 0);
    focusable()[0]?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const all = focusable(),
        first = all[0],
        last = all[all.length - 1];
      if (!first) {
        event.preventDefault();
        ref.current?.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", listener);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <div
        ref={ref}
        tabIndex={-1}
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-label={label}
        className={`admin-modal ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
