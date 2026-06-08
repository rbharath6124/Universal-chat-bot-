import { useTheme } from "../ThemeContext";

export default function Background() {
  const { theme } = useTheme();
  return (
    <div 
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      style={{ transition: "background-color 350ms ease" }}
    >
      <div
        className="absolute inset-0"
        style={{ 
          background: theme.bg,
          transition: "background-color 350ms ease"
        }}
      />

      {/* Very subtle noise texture overlay for high-end feel */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle bottom fade to merge with content */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 60%, ${theme.bg})`,
        }}
      />
    </div>
  );
}
