"use client";
import { useEffect, useState } from "react";
export function useDebouncedValue<T>(value: T, delay = 250) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setResult(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return result;
}
