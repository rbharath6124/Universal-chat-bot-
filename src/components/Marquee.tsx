import { partners } from "../data";
import { useTheme } from "../ThemeContext";

export default function Marquee() {
  const { theme } = useTheme();
  const row = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-y py-10" style={{ borderColor: theme.border }}>
      <div className="marquee flex w-max items-center gap-16">
        {row.map((p, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-lg font-bold uppercase tracking-[0.15em] opacity-25 transition-opacity duration-300 hover:opacity-60"
            style={{ color: theme.text }}
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
