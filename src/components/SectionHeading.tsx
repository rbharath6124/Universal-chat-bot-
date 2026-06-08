import { useTheme } from "../ThemeContext";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ eyebrow, title, subtitle }: Props) {
  const { theme } = useTheme();
  return (
    <div className="mb-16 max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-6" style={{ background: theme.accent }} />
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: theme.accent }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl" style={{ color: theme.text }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg font-light leading-relaxed" style={{ color: theme.textMuted }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
