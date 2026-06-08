import { useEffect, useState } from "react";
import { motion, useSpring, useScroll } from "framer-motion";
import { useTheme } from "../ThemeContext";

export default function ScrollProgress() {
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setPct(Math.round(v * 100));
    });
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <>
      {/* Vertical progress bar */}
      <div className="pointer-events-none fixed right-0 top-0 z-[100] h-screen w-[3px]">
        <motion.div
          className="absolute right-0 top-0 w-full origin-top"
          style={{
            scaleY,
            height: "100%",
            background: `rgb(${theme.c1})`,
            boxShadow: `0 0 12px 2px rgba(${theme.c1},0.5)`,
          }}
        />
      </div>

      {/* Percentage badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="pointer-events-none fixed right-4 top-1/2 z-[100] hidden -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur md:flex"
        style={{
          borderColor: theme.border,
          background: theme.glass,
          color: theme.text,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: `rgb(${theme.c1})`,
            boxShadow: `0 0 8px rgba(${theme.c1},0.6)`,
          }}
        />
        {pct}%
      </motion.div>
    </>
  );
}
