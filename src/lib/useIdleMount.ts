import { useEffect, useState } from "react";

/** Returns true once the browser has gone idle after first paint. */
export function useIdleMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);
  return ready;
}
