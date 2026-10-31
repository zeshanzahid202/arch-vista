"use client";
import { useEffect, useState, useCallback } from "react";
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) {
    const fields = body.fields
      ? Object.entries(body.fields)
          .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
          .join("; ")
      : "";
    throw new Error(fields || body.error || "Request failed");
  }
  return body;
}
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api<T>(url));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api<T>(url);
        if (active) setData(result);
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load data");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [url]);
  return { data, error, loading, reload };
}
