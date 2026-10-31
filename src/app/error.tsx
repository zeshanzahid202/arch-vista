"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="center-state" role="alert">
      <span className="eyebrow">A MOMENT’S PAUSE</span>
      <h2>
        We couldn’t load
        <br />
        this perspective.
      </h2>
      <p>
        The service may be temporarily unavailable. Please try again shortly.
      </p>
      <button className="button" onClick={reset}>
        Try again ↗
      </button>
    </div>
  );
}
