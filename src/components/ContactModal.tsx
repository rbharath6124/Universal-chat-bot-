import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail } from "lucide-react";
import { useTheme } from "../ThemeContext";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border p-8 shadow-2xl text-center"
            style={{ borderColor: theme.border, background: theme.glass, color: theme.text }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `rgba(${theme.c1}, 0.15)`, color: `rgb(${theme.c1})` }}
            >
              <Phone className="h-8 w-8" />
            </div>

            <h3 className="mb-2 text-2xl font-bold">Contact Us to Enroll</h3>
            <p className="mb-8 text-sm" style={{ color: theme.textMuted }}>
              Reach out to our team to get started with your learning journey.
            </p>

            <div className="space-y-4 text-left">
              <a
                href="tel:9998566635"
                className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-white/5"
                style={{ borderColor: theme.border }}
              >
                <Phone className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                <div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Call Us
                  </div>
                  <div className="font-semibold text-lg">9998566635</div>
                </div>
              </a>

              <a
                href="mailto:support@asscendro.com"
                className="flex items-center gap-4 rounded-xl border p-4 transition hover:bg-white/5"
                style={{ borderColor: theme.border }}
              >
                <Mail className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                <div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Email Us
                  </div>
                  <div className="font-semibold text-base">support@asscendro.com</div>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
