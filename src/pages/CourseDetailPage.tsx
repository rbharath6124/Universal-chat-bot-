import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Signal,
  Users,
  Star,
  Check,
  Award,
  ChevronDown,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import { getPrograms, Program } from "../lib/programsApi";
import EnrollmentModal from "../components/EnrollmentModal";

export default function CourseDetailPage({ courseId }: { courseId: string }) {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Program | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Program[]>([]);
  
  const [activeModule, setActiveModule] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allPrograms = await getPrograms();
      const current = allPrograms.find(p => p.id === courseId || p.slug === courseId);
      if (current) {
        setCourse(current);
        
        let related = allPrograms.filter(c => c.id !== current.id && c.subdomain_id === current.subdomain_id).slice(0, 3);
        if (related.length === 0) {
          related = allPrograms.filter(c => c.id !== current.id).slice(0, 3);
        }
        setRelatedCourses(related);
      }
      setLoading(false);
    }
    load();
  }, [courseId]);

  const btnGrad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: theme.text }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `rgb(${theme.c1})`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ color: theme.text }}>
        <div className="text-xl font-bold">Program not found</div>
        <button onClick={() => navigate("programs")} className="mt-4 text-sm font-medium underline">Return to Programs</button>
      </div>
    );
  }

  const isHex = course.color && course.color.includes(',');
  const bgStyle = isHex ? { background: `linear-gradient(to bottom right, ${course.color.split(',')[0]}, ${course.color.split(',')[1]})` } : {};
  const bgClass = !isHex && course.color ? `bg-gradient-to-br ${course.color}` : (isHex ? "" : "bg-gradient-to-br from-blue-500 to-cyan-600");

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-20" style={{ color: theme.text }}>
      <div className="mx-auto max-w-6xl">
        {/* Back button + breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm" style={{ color: theme.textMuted }}>
          <button
            onClick={() => navigate("programs")}
            className="group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition hover:opacity-80"
            style={{ borderColor: theme.border, background: theme.glass, color: theme.text }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Programs
          </button>
          <ChevronDown className="hidden h-4 w-4 -rotate-90 md:block" />
          <span className="font-medium" style={{ color: theme.text }}>
            {course.title}
          </span>
        </div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="relative overflow-hidden rounded-3xl border p-8 backdrop-blur md:p-12"
          style={{ borderColor: theme.border, background: theme.glass }}
        >
          <div
            className={`absolute inset-0 ${bgClass} opacity-[0.08]`}
            style={bgStyle}
          />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(course.tools_covered || []).slice(0, 4).map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <h1
                className="text-4xl font-extrabold tracking-tight sm:text-5xl"
                style={{ color: theme.text }}
              >
                {course.title}
              </h1>
              <p className="mt-3 text-lg" style={{ color: theme.textMuted }}>
                {course.tagline}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor: theme.border }}
                >
                  <Clock className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
                      Duration
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>
                      {course.duration}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor: theme.border }}
                >
                  <Signal className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
                      Level
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>
                      {course.level}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor: theme.border }}
                >
                  <Users className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
                      Students
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>
                      {(course.enrollments || 0).toLocaleString()}+
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor: theme.border }}
                >
                  <Star className="h-5 w-5 fill-amber-400" style={{ color: "rgb(251,191,36)" }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
                      Rating
                    </div>
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>
                      {course.rating} / 5
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
                  style={{
                    background: btnGrad,
                    boxShadow: `0 8px 24px -8px ${theme.glow}`,
                  }}
                >
                  Pay Now — {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                </button>
                {course.old_price && (
                  <span className="text-sm" style={{ color: theme.textMuted }}>
                    <span className="line-through">₹{course.old_price.toLocaleString()}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Sidebar price card */}
            <div className="w-full md:w-72">
              <div
                className="overflow-hidden rounded-3xl border p-6"
                style={{
                  borderColor: theme.border,
                  background:
                    theme.mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="mb-4 flex items-baseline gap-2"
                >
                  <span
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: theme.text }}
                  >
                    {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                  </span>
                  {course.old_price && (
                    <span className="text-sm line-through" style={{ color: theme.textMuted }}>
                      ₹{course.old_price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mb-3 block w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  style={{ background: btnGrad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
                >
                  Pay Now
                </button>
                <div
                  className="mb-3 block w-full rounded-xl border py-3 text-center text-sm font-medium"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  Download Brochure
                </div>
                <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: theme.border }}>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    {course.duration} of expert-led training
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    {(course.projects || []).length}+ capstone projects
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    Lifetime access to recordings
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    Mentor & interview prep
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    3 industry-recognized certificates
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: theme.text }}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    Flexible EMI options available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Program Overview */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-12 grid gap-6 lg:grid-cols-[1fr_280px]"
        >
          <div>
            <h2
              className="mb-4 text-3xl font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              Program Overview
            </h2>
            <p className="text-base leading-relaxed" style={{ color: theme.textMuted }}>
              {course.overview}
            </p>

            <h3
              className="mt-10 mb-4 text-2xl font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              Who should enroll?
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(course.who_should_enroll || []).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{ borderColor: theme.border, background: theme.glass }}
                >
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                  <span className="text-sm font-medium" style={{ color: theme.text }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <h3
              className="mt-10 mb-4 text-2xl font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              What you'll learn
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {(course.what_you_learn || []).map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: theme.border }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                  <span className="text-sm font-medium" style={{ color: theme.text }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Tools */}
            <h3
              className="mt-10 mb-4 text-2xl font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              Tools & technologies covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {(course.tools_covered || []).map((tool) => (
                <span
                  key={tool}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor: theme.border,
                    background: `rgba(${theme.c1},${theme.mode === "light" ? 0.05 : 0.08})`,
                    color: theme.text,
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>

            {/* Curriculum */}
            <div id="curriculum" className="mt-12">
              <h3
                className="mb-6 text-3xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                Curriculum
              </h3>
              <div className="space-y-3">
                {(course.modules || []).map((module, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border"
                    style={{ borderColor: theme.border, background: theme.glass }}
                  >
                    <button
                      onClick={() => setActiveModule(activeModule === idx ? -1 : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                          style={{
                            background:
                              activeModule === idx
                                ? btnGrad
                                : `rgba(${theme.c1},${theme.mode === "light" ? 0.10 : 0.18})`,
                            color: activeModule === idx ? "white" : theme.text,
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="font-semibold" style={{ color: theme.text }}>
                            Module {idx + 1}: {module.title}
                          </div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            {module.duration} • {(module.topics || []).length} topics
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 transition-transform"
                        style={{
                          transform: `rotate(${activeModule === idx ? 180 : 0}deg)`,
                          color: theme.textMuted,
                        }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {activeModule === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className="border-t px-5 py-5"
                            style={{ borderColor: theme.border }}
                          >
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                              Topics covered
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {(module.topics || []).map((topic, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="flex items-start gap-2 text-sm"
                                  style={{ color: theme.text }}
                                >
                                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                                  {topic}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="mt-12">
              <h3
                className="mb-6 text-3xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                Capstone projects
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {(course.projects || []).map((project, idx) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1"
                    style={{ borderColor: theme.border, background: theme.glass }}
                  >
                    <div
                      className={`absolute inset-0 ${bgClass} opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.12]`}
                      style={bgStyle}
                    />
                    <div className="relative">
                      <div
                        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br"
                        style={{ background: btnGrad }}
                      >
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h4
                        className="text-lg font-bold tracking-tight"
                        style={{ color: theme.text }}
                      >
                        {project.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                        {project.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mentors */}
            <div id="mentors" className="mt-12">
              <h3
                className="mb-6 text-3xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                Your mentors
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(course.mentors || []).map((mentor, idx) => (
                  <motion.div
                    key={mentor.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl border p-6 text-center transition hover:-translate-y-1"
                    style={{ borderColor: theme.border, background: theme.glass }}
                  >
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${mentor.color || "from-blue-500 to-cyan-600"} text-xl font-bold text-white`}
                    >
                      {mentor.initials}
                    </div>
                    <h4
                      className="text-lg font-bold tracking-tight"
                      style={{ color: theme.text }}
                    >
                      {mentor.name}
                    </h4>
                    <div className="text-sm font-semibold" style={{ color: `rgb(${theme.c1})` }}>
                      {mentor.role}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                      {mentor.company} • {mentor.experience} experience
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certificate */}
            <div
              className="mt-12 overflow-hidden rounded-3xl border p-8 text-center"
              style={{
                borderColor: theme.border,
                background: `linear-gradient(135deg, rgba(${theme.c1},0.14), rgba(${theme.c2},0.10), rgba(${theme.c3},0.10))`,
              }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white"
                style={{ background: btnGrad, boxShadow: `0 0 40px -8px ${theme.glow}` }}
              >
                <Award className="h-7 w-7" />
              </div>
              <h3
                className="text-2xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                Earn industry-recognized certificates
              </h3>
              <p className="mx-auto mt-3 max-w-2xl" style={{ color: theme.textMuted }}>
                {course.certificate}
              </p>
            </div>

            {/* Includes */}
            <div id="fee" className="mt-12">
              <h3
                className="mb-6 text-3xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                What the program includes
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(course.includes || []).map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                    style={{ borderColor: theme.border }}
                  >
                    <Check className="h-5 w-5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    <span className="text-sm font-medium" style={{ color: theme.text }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12">
              <h3
                className="mb-6 text-3xl font-bold tracking-tight"
                style={{ color: theme.text }}
              >
                Frequently asked questions
              </h3>
              <div className="space-y-3">
                {(course.faqs || []).map((faq, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border"
                    style={{ borderColor: theme.border, background: theme.glass }}
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                    >
                      <span className="font-semibold" style={{ color: theme.text }}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 transition-transform"
                        style={{
                          transform: `rotate(${activeFaq === idx ? 180 : 0}deg)`,
                          color: theme.textMuted,
                        }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t px-5 py-4 text-sm" style={{ borderColor: theme.border, color: theme.textMuted }}>
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Related programs */}
            {relatedCourses.length > 0 && (
              <div className="mt-12">
                <h3
                  className="mb-6 text-3xl font-bold tracking-tight"
                  style={{ color: theme.text }}
                >
                  Explore other programs
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedCourses.map((rc) => {
                    const rcIsHex = rc.color && rc.color.includes(',');
                    const rcBgStyle = rcIsHex ? { background: `linear-gradient(to bottom right, ${rc.color.split(',')[0]}, ${rc.color.split(',')[1]})` } : {};
                    const rcBgClass = !rcIsHex && rc.color ? `bg-gradient-to-br ${rc.color}` : (rcIsHex ? "" : "bg-gradient-to-br from-blue-500 to-cyan-600");

                    return (
                      <button
                        key={rc.id}
                        onClick={() => {
                          window.location.hash = `course-${rc.slug || rc.id}`;
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-1"
                        style={{ borderColor: theme.border, background: theme.glass }}
                      >
                        <div
                          className={`absolute inset-0 ${rcBgClass} opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.10]`}
                          style={rcBgStyle}
                        />
                        <div className="relative">
                          <h4 className="font-bold" style={{ color: theme.text }}>
                            {rc.title}
                          </h4>
                          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                            {rc.duration} • {rc.level}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Bottom banner */}
      <div
        className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl border px-8 py-6 backdrop-blur sm:flex-row mx-auto max-w-6xl"
        style={{ borderColor: theme.border, background: theme.glass }}
      >
        <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: theme.text }}>
          <Sparkles className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
          Ready to start {course.title}?
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: btnGrad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
        >
          Enroll Now
        </button>
      </div>

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseTitle={course.title}
        courseId={course.id}
        price={course.price}
      />
    </div>
  );
}
