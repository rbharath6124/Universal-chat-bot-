import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "../data";
import { useTheme } from "../ThemeContext";

function Counter({ value }: { value: string }) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const match = value.match(/[\d.]+/);
    const suffix = value.replace(/[\d.]+/, "");
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(match[0]);
    const dur = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const current = target * eased;
      setDisplay(Math.round(current).toString() + suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="text-4xl font-bold tracking-tight sm:text-5xl"
      style={{ color: theme.accent }}
    >
      {display}
    </div>
  );
}

export default function Stats() {
  const { theme } = useTheme();
  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="cinematic-card p-8 text-center"
          >
            <Counter value={s.value} />
            <p
              className="mt-3 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: theme.textMuted }}
            >
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
