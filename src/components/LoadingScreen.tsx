import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#050505" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Logo Mark */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="h-[2px] rounded-full"
              style={{ background: "linear-gradient(90deg, #8B5CF6, #6D28D9)" }}
            />

            {/* Brand Name */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-white/60"
            >
              Asscendro
            </motion.span>

            {/* Loading Bar */}
            <div className="mt-4 h-px w-48 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  delay: 0.6,
                  ease: [0.33, 1, 0.68, 1],
                }}
                className="h-full w-full rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, #8B5CF6, transparent)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
