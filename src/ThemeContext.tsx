import { createContext, useContext, useState, useEffect } from "react";

export interface Theme {
  id: string;
  name: string;
  mode: "dark" | "light";
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  glass: string;
  accent: string;
  accentGlow: string;
  accentGradient: string;
  c1: string;
  c2: string;
  c3: string;
  from: string;
  to: string;
  gradientText: string;
  buttonGradient: string;
  glow: string;
}

const cinematicDark: Theme = {
  id: "cinematic-dark",
  name: "Cinematic",
  mode: "dark",
  bg: "#050505",
  surface: "rgba(255,255,255,0.04)",
  text: "#FFFFFF",
  textMuted: "#888888",
  border: "rgba(255,255,255,0.08)",
  glass: "rgba(10,10,20,0.6)",
  accent: "#8B5CF6",
  accentGlow: "rgba(139,92,246,0.4)",
  accentGradient: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  c1: "139,92,246",
  c2: "109,40,217",
  c3: "196,181,253",
  from: "violet-600",
  to: "purple-800",
  gradientText: "from-violet-300 via-purple-400 to-violet-600",
  buttonGradient: "from-violet-600 to-purple-700",
  glow: "rgba(139,92,246,0.15)",
};

const cinematicLight: Theme = {
  id: "cinematic-light",
  name: "Cinematic Light",
  mode: "light",
  bg: "#FAFAFA",
  surface: "rgba(0,0,0,0.03)",
  text: "#0A0A0A",
  textMuted: "#666666",
  border: "rgba(0,0,0,0.08)",
  glass: "rgba(255,255,255,0.8)",
  accent: "#7C3AED",
  accentGlow: "rgba(124,58,237,0.2)",
  accentGradient: "linear-gradient(135deg, #7C3AED, #5B21B6)",
  c1: "124,58,237",
  c2: "91,33,182",
  c3: "139,92,246",
  from: "violet-500",
  to: "purple-700",
  gradientText: "from-violet-600 via-purple-700 to-violet-800",
  buttonGradient: "from-violet-500 to-purple-600",
  glow: "rgba(124,58,237,0.1)",
};

interface Ctx {
  theme: Theme;
  mode: "dark" | "light";
  toggleMode: () => void;
}

export const ThemeContext = createContext<Ctx>({
  theme: cinematicDark,
  mode: "dark",
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const theme = mode === "dark" ? cinematicDark : cinematicLight;

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  const toggleMode = () =>
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      localStorage.setItem("theme-mode", next);
      return next;
    });

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
