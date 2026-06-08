import { motion } from "framer-motion";
import { steps } from "../data";
import { useTheme } from "../ThemeContext";
import SectionHeading from "./SectionHeading";

export default function Journey() {
  const { theme } = useTheme();

  return (
    <section id="journey" className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="The Path"
          title="From Learner to Hired"
          subtitle="A strategic, connected journey. We don't just teach — we mentor you until you are fully placement-ready."
        />

        <div className="flex flex-col">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.33, 1, 0.68, 1] }}
              className="group flex flex-col gap-6 border-t py-10 md:flex-row md:items-center md:gap-12"
              style={{ borderColor: theme.border }}
            >
              <div className="flex-shrink-0 md:w-24">
                <span
                  className="text-5xl font-bold tracking-tight opacity-20 transition-opacity duration-500 group-hover:opacity-60 md:text-6xl"
                  style={{ color: theme.accent }}
                >
                  {s.n}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: theme.text }}>
                  {s.title}
                </h3>
              </div>

              <div className="md:w-1/3">
                <p className="text-base font-light leading-relaxed" style={{ color: theme.textMuted }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
