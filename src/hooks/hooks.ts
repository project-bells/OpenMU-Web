import { useEffect, useRef, useState } from "react";

/** Scroll-reveal hook: adds .is-visible when in viewport */
export function useRevealRoot<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    // also observe root itself if it has reveal
    const targets: Element[] = [...Array.from(els)];
    if (root.classList.contains("reveal")) targets.push(root);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Global reveal observer for whole app */
export function useGlobalReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    els.forEach((el) => io.observe(el));
    // re-scan for dynamically added
    const mo = new MutationObserver(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => io.observe(el));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

export function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** Player count reported by the OpenMU server gateway. */
export function useLiveOnline(_fallback = 0) {
  const [online, setOnline] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const update = async () => {
      try {
        const response = await fetch("/api/server/status", { signal: controller.signal, headers: { Accept: "application/json" } });
        const status = response.ok ? await response.json() : null;
        const count = status?.totalOnline ?? status?.onlineCount ?? status?.players;
        setOnline(Number.isFinite(Number(count)) ? Number(count) : 0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setOnline(0);
      }
    };
    void update();
    const id = window.setInterval(update, 15_000);
    return () => { controller.abort(); window.clearInterval(id); };
  }, []);
  return online;
}

export function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetDate.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

/** Next Saturday 19:00 UTC castle siege */
export function getNextSiege(): Date {
  const d = new Date();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 19, 0, 0));
  let add = (6 - target.getUTCDay() + 7) % 7;
  target.setUTCDate(target.getUTCDate() + add);
  if (target.getTime() <= Date.now()) target.setUTCDate(target.getUTCDate() + 7);
  return target;
}
