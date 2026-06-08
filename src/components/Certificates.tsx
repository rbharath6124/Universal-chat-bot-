import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { certificates } from "../data";
import SectionHeading from "./SectionHeading";
import { useTheme } from "../ThemeContext";

export default function Certificates() {
  const { theme } = useTheme();
  return (
    <section id="certificates" className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Validation"
          title="Industry Recognized Certification"
          subtitle="Our certifications are not just PDFs. They are validations of your skill, recognized by top hiring partners."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
              className="cinematic-card p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: theme.accentGradient,
                    boxShadow: `0 8px 24px -4px ${theme.accentGlow}`,
                  }}
                >
                  <Award className="h-7 w-7 text-white" />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: theme.accent }}
                >
                  Certified Program
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight" style={{ color: theme.text }}>
                  {c.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed" style={{ color: theme.textMuted }}>
                  {c.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
