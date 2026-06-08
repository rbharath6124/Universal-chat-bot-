import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, GraduationCap } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import ModeToggle from "./ModeToggle";
import ContactModal from "./ContactModal";
import MagneticHover from "./MagneticHover";

const navItems = [
  { label: "Programs", route: "programs" },
  { label: "LMS Portal", route: "learn" },
  { label: "Journey", route: "home", anchor: "journey" },
  { label: "Certificates", route: "home", anchor: "certificates" },
  { label: "Reviews", route: "home", anchor: "reviews" },
  { label: "Job Portal", route: "job-portal" },
  { label: "Campus Ambassador", route: "campus-ambassador" },
];

export default function Navbar() {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > 80) {
      setScrolled(true);
      if (previous && latest > previous && latest - previous > 5) {
        setHidden(true);
      } else if (previous && previous - latest > 5) {
        setHidden(false);
      }
    } else {
      setScrolled(false);
      setHidden(false);
    }
  });

  const handleNav = (item: (typeof navItems)[0]) => {
    navigate(item.route);
    if (item.anchor) {
      setTimeout(() => {
        document.getElementById(item.anchor!)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setOpen(false);
  };

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 md:px-6"
        style={{ paddingTop: scrolled ? "8px" : "16px" }}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500"
          style={{
            background: scrolled
              ? theme.mode === 'dark' ? 'rgba(10, 10, 20, 0.7)' : 'rgba(255, 255, 255, 0.8)'
              : theme.mode === 'dark' ? 'rgba(10, 10, 20, 0.3)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'blur(12px)',
            border: `1px solid ${scrolled ? theme.border : 'rgba(255,255,255,0.04)'}`,
            boxShadow: scrolled ? '0 8px 32px -4px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: theme.accentGradient }}
            >
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: theme.text }}>
              Asscendro
            </span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <MagneticHover>
                  <button
                    onClick={() => handleNav(item)}
                    className="group relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
                    style={{ color: theme.textMuted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                  >
                    {item.label}
                    <span
                      className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                      style={{ background: theme.accent }}
                    />
                  </button>
                </MagneticHover>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <ModeToggle />
            <MagneticHover>
              <button
                onClick={() => setContactModalOpen(true)}
                className="glow-btn px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Enroll Now
              </button>
            </MagneticHover>
          </div>

          <button
            className="xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{ color: theme.text }}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="fixed inset-x-4 top-24 z-50 flex flex-col gap-2 rounded-2xl p-6"
              style={{
                background: theme.mode === 'dark' ? 'rgba(10, 10, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${theme.border}`,
              }}
            >
              {navItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => handleNav(item)}
                  className="rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors"
                  style={{ color: theme.textMuted }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <ModeToggle />
                <button
                  onClick={() => { setContactModalOpen(true); setOpen(false); }}
                  className="glow-btn px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
                >
                  Enroll Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </>
  );
}
