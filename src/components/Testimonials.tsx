import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { testimonials } from "../data";
import SectionHeading from "./SectionHeading";
import { useTheme } from "../ThemeContext";

export default function Testimonials() {
  const { theme } = useTheme();

  return (
    <section id="reviews" className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Reviews"
          title="Learner Success Stories"
          subtitle="Real-world impact. Hear from the professionals who transformed their careers through our programs."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1, ease: [0.33, 1, 0.68, 1] }}
              className="cinematic-card relative p-8"
            >
              <Quote className="absolute right-8 top-8 h-8 w-8" style={{ color: theme.border }} />

              <div className="mb-5 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5"
                    style={{ fill: theme.accent, color: theme.accent }}
                  />
                ))}
              </div>

              <p className="text-base leading-relaxed" style={{ color: theme.textMuted }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-4 border-t pt-6" style={{ borderColor: theme.border }}>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: theme.accentGradient,
                    boxShadow: `0 4px 12px -2px ${theme.accentGlow}`,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: theme.text }}>{t.name}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
