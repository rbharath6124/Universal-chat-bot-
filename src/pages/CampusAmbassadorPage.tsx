import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Award, Users, Building2, Sparkles, ChevronDown,
  ArrowRight, Send, CheckCircle2, Rocket, UserCheck,
  GraduationCap, Globe, Zap, BadgeCheck, Star, TrendingUp,
  Briefcase, BookOpen,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { supabase } from "../lib/supabase";

/* ───────────────────── Animated Counter ───────────────────── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="text-4xl font-extrabold tracking-tight sm:text-5xl"
    >
      {display.toLocaleString()}{suffix}
    </div>
  );
}

/* ───────────────────── FAQ Accordion Item ───────────────────── */
function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  const { theme } = useTheme();
  return (
    <div
      className="rounded-2xl border transition-all duration-300"
      style={{
        background: open
          ? theme.mode === "light" ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.06)"
          : theme.mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
        borderColor: open ? `rgba(${theme.c1}, 0.25)` : theme.border,
      }}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-semibold sm:text-base" style={{ color: theme.text }}>
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={{ color: `rgb(${theme.c1})` }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────── Main Page ───────────────────── */
export default function CampusAmbassadorPage() {
  const { theme } = useTheme();
  const grad = theme.accentGradient;

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    college: "",
    year_of_study: "",
    branch: "",
    linkedin_url: "",
    instagram_handle: "",
    motivation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.college.trim() || !form.year_of_study || !form.branch.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\s|-/g, ""))) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("campus_ambassador_applications").insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        year_of_study: form.year_of_study,
        branch: form.branch.trim(),
        linkedin_url: form.linkedin_url.trim() || null,
        instagram_handle: form.instagram_handle.trim() || null,
        motivation: form.motivation.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ────── Data ────── */
  const stats = [
    { value: 500, suffix: "+", label: "Active Ambassadors", icon: Users },
    { value: 100, suffix: "+", label: "Colleges Reached", icon: Building2 },
    { value: 50, suffix: "K+", label: "Rewards Distributed", prefix: "₹", icon: Award },
    { value: 10000, suffix: "+", label: "Students Community", icon: Globe },
  ];

  const benefits = [
    { title: "Exclusive Rewards", desc: "Earn cash incentives, merchandise, and exclusive perks for every milestone you achieve.", icon: Award },
    { title: "Official Certificate", desc: "Receive a verified Asscendro Campus Ambassador certificate to showcase your leadership.", icon: BadgeCheck },
    { title: "Leadership Experience", desc: "Develop invaluable leadership, communication, and event management skills.", icon: Star },
    { title: "Networking Opportunities", desc: "Connect with industry professionals, mentors, and a thriving ambassador community.", icon: Users },
    { title: "Internship Opportunities", desc: "Top ambassadors gain priority access to internship and full-time roles at Asscendro.", icon: Briefcase },
    { title: "Early Access to Programs", desc: "Be the first to experience and review upcoming courses and features.", icon: BookOpen },
    { title: "Resume Boost", desc: "Add a prestigious ambassador title from a leading edtech platform to your resume.", icon: TrendingUp },
    { title: "Placement Advantages", desc: "Stand out in campus placements with verified leadership and marketing experience.", icon: Zap },
  ];

  const steps = [
    { title: "Apply Online", desc: "Fill out the application form with your details and motivation.", icon: Send },
    { title: "Get Selected", desc: "Our team reviews your profile and selects passionate candidates.", icon: UserCheck },
    { title: "Attend Onboarding", desc: "Join an exclusive onboarding session to understand your role and tools.", icon: GraduationCap },
    { title: "Start Representing", desc: "Host events, share programs, and build a community at your campus.", icon: Rocket },
    { title: "Earn Rewards", desc: "Achieve milestones, earn rewards, and unlock exclusive opportunities.", icon: Sparkles },
  ];

  const faqs = [
    { q: "What does a Campus Ambassador do?", a: "As a Campus Ambassador, you represent Asscendro at your college. You help fellow students discover industry-ready programs, organize awareness events, and build a thriving learning community on campus." },
    { q: "Is this a paid opportunity?", a: "Yes! Ambassadors earn performance-based rewards including cash incentives, merchandise, exclusive swag, and bonus perks for achieving milestones. Top performers earn premium rewards every month." },
    { q: "Will I receive a certificate?", a: "Absolutely. Every ambassador receives an official Asscendro Campus Ambassador certificate upon successful completion of the program, which you can add to your resume and LinkedIn profile." },
    { q: "How are rewards calculated?", a: "Rewards are based on a transparent milestone system — referrals, event organization, social media engagement, and community building all contribute to your rewards score." },
    { q: "Who can apply?", a: "Any currently enrolled college or university student in India can apply. We welcome students from all branches, years, and backgrounds who are passionate about education and leadership." },
    { q: "Is prior experience required?", a: "No prior experience is required. We provide comprehensive onboarding, training materials, and ongoing mentorship to help you succeed in the role." },
  ];

  const glassCard: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.04)",
    backdropFilter: "blur(16px)",
    border: `1px solid ${theme.border}`,
  };

  const inputStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 14,
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const sectionHeadingStyle: React.CSSProperties = {
    color: theme.text,
    fontFamily: "Space Grotesk, sans-serif",
  };

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      {/* ━━━ Hero Background Glow ━━━ */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: `rgb(${theme.c1})` }}
        />
        <div
          className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: `rgb(${theme.c2})` }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-10 blur-[140px]"
          style={{ background: `rgb(${theme.c3})` }}
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-12 text-center sm:px-6 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: `rgba(${theme.c1}, 0.12)`,
              color: `rgb(${theme.c1})`,
              border: `1px solid rgba(${theme.c1}, 0.2)`,
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Campus Ambassador Program
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl" style={{ color: theme.text }}>
            Become an Asscendro
            <br />
            Campus Ambassador
          </h1>

          <p
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: theme.textMuted }}
          >
            Represent Asscendro at your college, help students discover industry-ready programs,
            develop leadership skills, and earn exciting rewards.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={scrollToForm}
              className="group flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white transition-all hover:brightness-110 hover:scale-[1.03]"
              style={{ background: grad, boxShadow: `0 10px 40px -10px ${theme.glow}` }}
            >
              Apply Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => document.getElementById("ca-benefits")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 rounded-2xl border px-8 py-4 text-sm font-bold transition-all hover:scale-[1.03]"
              style={{ borderColor: theme.border, color: theme.text, background: theme.glass }}
            >
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Animated grid dots */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                background: `rgba(${theme.c1}, ${0.08 + Math.random() * 0.12})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="cinematic-card group relative overflow-hidden rounded-3xl p-6 text-center transition-all hover:scale-[1.03] sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
                style={{ background: `rgb(${theme.c1})` }}
              />
              <s.icon className="mx-auto mb-3 h-6 w-6" style={{ color: `rgb(${theme.c1})` }} />
              <Counter value={s.value} suffix={s.suffix} />
              <p className="mt-2 text-xs font-medium uppercase tracking-wider sm:text-sm" style={{ color: theme.textMuted }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ BENEFITS ━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="ca-benefits" className="relative z-10 mx-auto max-w-6xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span
            className="mb-4 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: `rgb(${theme.c1})` }}
          >
            Why Join Us
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl" style={sectionHeadingStyle}>
            Benefits of Being an Ambassador
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="cinematic-card group relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02]"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                style={{ background: `rgb(${theme.c1})` }}
              />
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `rgba(${theme.c1}, 0.12)` }}
              >
                <b.icon className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
              </div>
              <h3 className="mb-2 text-sm font-bold" style={{ color: theme.text }}>
                {b.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span
            className="mb-4 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: `rgb(${theme.c1})` }}
          >
            The Process
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl" style={sectionHeadingStyle}>
            How It Works
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 hidden h-full w-px sm:block"
            style={{ background: `linear-gradient(to bottom, rgba(${theme.c1},0.4), rgba(${theme.c2},0.1))` }}
          />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex items-start gap-5 sm:pl-16"
              >
                {/* Step number circle */}
                <div
                  className="relative z-10 hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white sm:absolute sm:left-0"
                  style={{ background: grad, boxShadow: `0 4px 20px -5px ${theme.glow}` }}
                >
                  {i + 1}
                </div>
                {/* Mobile step number */}
                <div
                  className="flex sm:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: grad }}
                >
                  {i + 1}
                </div>

                <div
                  className="cinematic-card flex-1 rounded-2xl p-5 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                    <h3 className="text-base font-bold" style={{ color: theme.text }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ APPLICATION FORM ━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={formRef} id="ca-apply" className="relative z-10 mx-auto max-w-3xl px-4 pb-24 scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span
            className="mb-4 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: `rgb(${theme.c1})` }}
          >
            Join the Team
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl" style={sectionHeadingStyle}>
            Apply Now
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm" style={{ color: theme.textMuted }}>
            Fill out the form below and our team will review your application within 48 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cinematic-card rounded-3xl p-6 sm:p-10"
        >
          {submitted ? (
            <div className="py-10 text-center">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `rgba(${theme.c1}, 0.12)` }}
              >
                <CheckCircle2 className="h-10 w-10" style={{ color: `rgb(${theme.c1})` }} />
              </div>
              <h3 className="mb-3 text-2xl font-bold tracking-tight" style={{ color: theme.text }}>
                Application Submitted!
              </h3>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Your application has been submitted successfully. Our team will contact you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Full Name <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" required style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Email Address <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" required style={inputStyle} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Phone Number <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    College / University <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <input name="college" value={form.college} onChange={handleChange} placeholder="IIT Madras" required style={inputStyle} />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Year of Study <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <select name="year_of_study" value={form.year_of_study} onChange={handleChange} required style={inputStyle}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Branch / Department <span style={{ color: `rgb(${theme.c1})` }}>*</span>
                  </label>
                  <input name="branch" value={form.branch} onChange={handleChange} placeholder="Computer Science" required style={inputStyle} />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    LinkedIn Profile
                  </label>
                  <input name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Instagram Handle
                  </label>
                  <input name="instagram_handle" value={form.instagram_handle} onChange={handleChange} placeholder="@yourhandle" style={inputStyle} />
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  Why do you want to become a Campus Ambassador?
                </label>
                <textarea
                  name="motivation"
                  value={form.motivation}
                  onChange={handleChange}
                  placeholder="Tell us what excites you about this opportunity..."
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: grad, boxShadow: `0 10px 40px -10px ${theme.glow}` }}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ FAQ ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span
            className="mb-4 inline-block text-xs font-bold uppercase tracking-widest"
            style={{ color: `rgb(${theme.c1})` }}
          >
            Questions?
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl" style={sectionHeadingStyle}>
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <FAQItem
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
          style={{
            background: grad,
            boxShadow: `0 30px 80px -20px ${theme.glow}`,
          }}
        >
          {/* CTA glow effects */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start Your Leadership Journey Today
          </h2>
          <p className="relative mx-auto mb-8 max-w-lg text-sm text-white/80">
            Join a community of passionate student leaders, build your network, earn rewards, and make an impact at your campus.
          </p>
          <button
            onClick={scrollToForm}
            className="relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold transition-all hover:scale-105"
            style={{ color: `rgb(${theme.c1})` }}
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </section>
    </main>
  );
}
