import { type RefObject, useEffect, useState } from "react";

/** True while the container is on-screen and the tab is visible; used to pause R3F frameloops. */
export function useCanvasActive(ref: RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);
  const [tabActive, setTabActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    const onVisibility = () => setTabActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);

  return visible && tabActive;
}
