import { useState } from "react";
import { ArrowRight, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";
import ContactModal from "./ContactModal";
import MagneticHover from "./MagneticHover";

export default function CTA() {
  const { theme } = useTheme();
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <section id="cta" className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="relative overflow-hidden rounded-3xl border p-12 text-center sm:p-20"
          style={{
            borderColor: "rgba(139,92,246,0.15)",
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, rgba(5,5,5,0.5) 70%)",
          }}
        >
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[400px] -translate-x-1/2 rounded-full opacity-30 blur-[100px]"
            style={{ background: theme.accent }}
          />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ color: theme.text }}>
              Ready to launch your{" "}
              <span className="gradient-text">
                Professional Career?
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed md:text-lg" style={{ color: theme.textMuted }}>
              Connect with our career advisors to identify the right path for your goals.
              We provide the mentorship, training, and corporate exposure you need.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticHover>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="glow-btn group flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white"
                >
                  Enroll Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </MagneticHover>

              <MagneticHover>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="flex items-center gap-2 rounded-full border px-8 py-4 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white active:scale-95"
                  style={{ borderColor: theme.border }}
                >
                  <PhoneCall className="h-4 w-4" />
                  Consult an Expert
                </button>
              </MagneticHover>
            </div>
          </div>
        </motion.div>
      </div>

      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </section>
  );
}
