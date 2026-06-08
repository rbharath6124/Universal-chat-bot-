import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeContext";

export default function ModeToggle() {
  const { mode, toggleMode, theme } = useTheme();
  const isDark = mode === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleMode}
      className="relative flex h-9 w-[68px] shrink-0 items-center rounded-full border"
      style={{
        borderColor: isDark ? theme.border : "rgba(0,0,0,0.15)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        backdropFilter: "blur(14px)",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute h-7 w-7 rounded-full"
        style={{
          background: `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`,
          boxShadow: `0 2px 10px -2px rgba(${theme.c1},0.6)`,
        }}
        animate={{ x: isDark ? 4 : 36 }}
        transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
      />

      {/* Moon slot (left) */}
      <div className="z-10 flex h-9 w-[34px] items-center justify-center">
        <Moon
          className="h-3.5 w-3.5"
          style={{ color: isDark ? "white" : isDark ? "#94a3b8" : "#64748b" }}
        />
      </div>

      {/* Sun slot (right) */}
      <div className="z-10 flex h-9 w-[34px] items-center justify-center">
        <Sun
          className="h-3.5 w-3.5"
          style={{ color: isDark ? "#64748b" : "white" }}
        />
      </div>
    </motion.button>
  );
}
