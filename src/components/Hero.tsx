import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import TextReveal from "./TextReveal";
import MagneticHover from "./MagneticHover";

export default function Hero() {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "15%"]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100vh] flex-col justify-center overflow-hidden"
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: bgY }}
      >
        <div
          className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, #6D28D9 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #C4B5FD 0%, transparent 70%)" }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4, ease: [0.33, 1, 0.68, 1] }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="h-px w-8" style={{ background: theme.accent }} />
          <span
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: theme.accent }}
          >
            Empowering Careers
          </span>
        </motion.div>

        {/* Main Headline */}
        <div className="max-w-5xl">
          <TextReveal
            text="Elevate Your Career with Real Experience."
            className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            delay={2.6}
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2, ease: [0.33, 1, 0.68, 1] }}
          className="mt-8 max-w-xl text-lg font-light leading-relaxed md:text-xl"
          style={{ color: theme.textMuted }}
        >
          Stop guessing and start doing. We bridge the gap between theoretical
          knowledge and corporate reality through live projects and expert mentorship.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.5, ease: [0.33, 1, 0.68, 1] }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <MagneticHover>
            <button
              onClick={() => navigate("programs")}
              className="glow-btn group flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </MagneticHover>

          <MagneticHover>
            <button
              onClick={() => navigate("home")}
              className="group flex items-center gap-3 rounded-full border px-8 py-4 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white active:scale-95"
              style={{ borderColor: theme.border }}
            >
              <PlayCircle className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              How it works
            </button>
          </MagneticHover>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4 }}
          className="mt-20 flex flex-wrap gap-12 border-t border-white/5 pt-8"
        >
          {[
            { value: "25K+", label: "Learners" },
            { value: "120+", label: "Partners" },
            { value: "94%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold" style={{ color: theme.text }}>{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest" style={{ color: theme.textMuted }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-6 z-10 flex items-center gap-3 md:left-12"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border p-1.5" style={{ borderColor: theme.border }}>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full" style={{ background: theme.textMuted }}
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
