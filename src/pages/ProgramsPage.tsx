import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Users,
  Signal,
  Check,
  MessageCircle,
  ChevronRight,
  Search,
  Zap,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import { getMainDomains, getSubdomains, getPrograms, MainDomain, Subdomain, Program } from "../lib/programsApi";

const advantageItems = [
  { icon: Sparkles, title: "Expert-led live cohorts + recorded sessions", desc: "Learn from industry practitioners." },
  { icon: Zap, title: "Real projects — portfolio proof", desc: "Build work you can actually show." },
  { icon: Check, title: "Strict rubrics + proper evaluation", desc: "Performance measured the right way." },
  { icon: MessageCircle, title: "Talk to a Career Expert", desc: "Personalized guidance for your goals." },
];

export default function ProgramsPage({ initialMainDomain, initialSubdomain }: { initialMainDomain?: string; initialSubdomain?: string }) {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [mainDomains, setMainDomains] = useState<MainDomain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [expandedMainDomain, setExpandedMainDomain] = useState<string | null>(initialMainDomain || null);
  const [activeSubdomain, setActiveSubdomain] = useState<string | null>(initialSubdomain || null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [fetchedMainDomains, fetchedSubdomains, fetchedPrograms] = await Promise.all([
        getMainDomains(),
        getSubdomains(),
        getPrograms(),
      ]);
      setMainDomains(fetchedMainDomains);
      setSubdomains(fetchedSubdomains);
      setPrograms(fetchedPrograms);

      // Default selection if none provided
      if (fetchedMainDomains.length > 0) {
        let targetMain = initialMainDomain;
        let targetSub = initialSubdomain;

        if (!targetMain) {
          targetMain = fetchedMainDomains[0].slug;
          setExpandedMainDomain(targetMain);
        }

        if (!targetSub) {
          const subs = fetchedSubdomains.filter(s => {
            const md = fetchedMainDomains.find(m => m.slug === targetMain);
            return md && s.main_domain_id === md.id;
          });
          if (subs.length > 0) {
            targetSub = subs[0].slug;
            setActiveSubdomain(targetSub);
            // Sync URL passively
            window.location.hash = `domains/${targetMain}/${targetSub}`;
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [initialMainDomain, initialSubdomain]);

  const currentMainDomainObj = useMemo(() => mainDomains.find(m => m.slug === expandedMainDomain) || mainDomains[0], [mainDomains, expandedMainDomain]);
  const currentSubdomainObj = useMemo(() => subdomains.find(s => s.slug === activeSubdomain), [subdomains, activeSubdomain]);

  const filteredPrograms = useMemo(() => {
    if (!currentSubdomainObj) return [];
    let filtered = programs.filter(p => p.subdomain_id === currentSubdomainObj.id && p.status === "published");
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))));
    }
    return filtered;
  }, [programs, currentSubdomainObj, search]);

  const totalPrograms = programs.length;
  const btnGrad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: theme.text }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: `rgb(${theme.c1})`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-20" style={{ color: theme.text }}>
      <div className="mx-auto max-w-7xl">
        {/* Back + Search */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("home")}
            className="group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition hover:opacity-80"
            style={{ borderColor: theme.border, background: theme.glass, color: theme.text }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </button>
          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 backdrop-blur"
            style={{ borderColor: theme.border, background: theme.glass, minWidth: "280px" }}
          >
            <Search className="h-4 w-4" style={{ color: theme.textMuted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span
            className="inline-block rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{
              borderColor: `rgba(${theme.c1},0.4)`,
              background: `rgba(${theme.c1},${theme.mode === "light" ? 0.08 : 0.12})`,
              color: `rgb(${theme.c1})`,
            }}
          >
            All Programs
          </span>
          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
            style={{ color: theme.text }}
          >
            {currentMainDomainObj ? `${currentMainDomainObj.name}` : "Programs"}
            {currentSubdomainObj && <span style={{ color: theme.textMuted }}> / {currentSubdomainObj.name}</span>}
          </h1>
          <p className="mt-2 text-lg" style={{ color: theme.textMuted }}>
            Expert-led • Real projects • Rubric evaluation
          </p>
        </div>

        {/* Main Layout: Desktop 3-col, Mobile stacked */}
        <div className="space-y-6 lg:grid lg:grid-cols-[260px_1fr_280px] lg:gap-6">
          {/* Sidebar */}
          <aside className="space-y-3">
            <div
              className="rounded-2xl border p-3 backdrop-blur"
              style={{ borderColor: theme.border, background: theme.glass }}
            >
              <div
                className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: theme.textMuted }}
              >
                Domains
              </div>
              <div className="space-y-2">
                {mainDomains.map((md) => {
                  const isMdExpanded = expandedMainDomain === md.slug;
                  const mdSubdomains = subdomains.filter(s => s.main_domain_id === md.id);

                  return (
                    <div key={md.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setExpandedMainDomain(isMdExpanded ? null : md.slug);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: isMdExpanded ? `rgb(${theme.c1})` : theme.text }}
                      >
                        {md.name}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isMdExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isMdExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-2"
                          >
                            {mdSubdomains.map((sub) => {
                              const isActive = activeSubdomain === sub.slug;
                              const subCount = programs.filter(p => p.subdomain_id === sub.id && p.status === "published").length;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => navigate(`domains/${md.slug}/${sub.slug}`)}
                                  className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
                                  style={{
                                    background: isActive
                                      ? `linear-gradient(135deg, rgba(${theme.c1},${theme.mode === "light" ? 0.15 : 0.20}), rgba(${theme.c2},${theme.mode === "light" ? 0.10 : 0.14}))`
                                      : "transparent",
                                    border: `1px solid ${isActive ? `rgba(${theme.c1},0.5)` : "transparent"}`,
                                    color: isActive ? theme.text : theme.textMuted,
                                    fontWeight: isActive ? 600 : 500,
                                  }}
                                >
                                  {sub.name}
                                  <span
                                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                    style={{
                                      background: isActive
                                        ? `rgba(${theme.c1},0.35)`
                                        : theme.mode === "light"
                                          ? "rgba(0,0,0,0.06)"
                                          : "rgba(255,255,255,0.08)",
                                      color: isActive ? "white" : theme.textMuted,
                                    }}
                                  >
                                    {subCount}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Programs */}
          <section>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubdomain}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], opacity: { duration: 0.2 } }}
                style={{ willChange: "transform, opacity" }}
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: theme.text }}
                  >
                    {currentSubdomainObj?.name || "Select a Domain"}
                  </h2>
                  <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
                    {filteredPrograms.length} {filteredPrograms.length === 1 ? "program" : "programs"}
                  </span>
                </div>

                {filteredPrograms.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center rounded-3xl border py-16 text-center backdrop-blur"
                    style={{ borderColor: theme.border, background: theme.glass }}
                  >
                    <Search className="mb-3 h-8 w-8" style={{ color: theme.textMuted }} />
                    <div className="text-lg font-semibold" style={{ color: theme.text }}>No programs found</div>
                    <div className="mt-1 text-sm" style={{ color: theme.textMuted }}>Check back later or try a different search.</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredPrograms.map((course, idx) => {
                      return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.04 }}
                        whileHover={{ y: -3 }}
                        className="cinematic-card group relative overflow-hidden p-6"
                      >
                        {/* Ambient glow */}
                        <div
                          className="absolute inset-0 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.10]"
                          style={{ background: theme.accentGradient }}
                        />
                        <div className="relative">
                          <div className="mb-4 flex items-start justify-between">
                            <h3
                              className="text-lg font-bold leading-snug tracking-tight"
                              style={{ color: theme.text }}
                            >
                              {course.title}
                            </h3>
                            <div className="text-right shrink-0 ml-4">
                              <div
                                className="text-xl font-bold tracking-tight"
                                style={{ color: theme.text }}
                              >
                                {course.price === 0 ? "Free" : `₹${(course.price || 0).toLocaleString()}`}
                              </div>
                              {course.old_price && (
                                <div className="text-xs line-through" style={{ color: theme.textMuted }}>
                                  ₹{(course.old_price || 0).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                            {course.blurb || course.tagline}
                          </p>

                          {course.tags && course.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {course.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                                  style={{
                                    borderColor: theme.border,
                                    background: `rgba(${theme.c1},${theme.mode === "light" ? 0.06 : 0.10})`,
                                    color: theme.text,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: theme.border }}>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
                              <Clock className="h-3.5 w-3.5" style={{ color: `rgb(${theme.c1})` }} />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
                              <Signal className="h-3.5 w-3.5" style={{ color: `rgb(${theme.c1})` }} />
                              {course.level}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
                              <Users className="h-3.5 w-3.5" style={{ color: `rgb(${theme.c1})` }} />
                              {course.enrollments || 0}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div
                              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-medium leading-tight"
                              style={{
                                borderColor: `rgba(${theme.c1},0.4)`,
                                background: `rgba(${theme.c1},${theme.mode === "light" ? 0.04 : 0.08})`,
                                color: theme.text,
                              }}
                            >
                              <Check className="h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                              <span className="whitespace-nowrap">Certification</span>
                            </div>
                            <div
                              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-medium leading-tight"
                              style={{
                                borderColor: `rgba(${theme.c1},0.4)`,
                                background: `rgba(${theme.c1},${theme.mode === "light" ? 0.04 : 0.08})`,
                                color: theme.text,
                              }}
                            >
                              <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                              <span className="whitespace-nowrap">Expert-led</span>
                            </div>
                            <div
                              className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-medium leading-tight"
                              style={{
                                borderColor: `rgba(${theme.c1},0.4)`,
                                background: `rgba(${theme.c1},${theme.mode === "light" ? 0.04 : 0.08})`,
                                color: theme.text,
                              }}
                            >
                              <BookOpen className="h-3.5 w-3.5 shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                              <span className="whitespace-nowrap">Projects</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`course-${course.slug || course.id}`)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110"
                            style={{
                              background: btnGrad,
                              boxShadow: `0 8px 24px -8px ${theme.glow}`,
                            }}
                          >
                            View Details
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </button>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Right panel (desktop) */}
          <aside className="hidden space-y-3 lg:block">
            <RightPanel theme={theme} btnGrad={btnGrad} totalPrograms={totalPrograms} />
          </aside>
        </div>

        {/* Right panel (mobile) */}
        <div className="space-y-3 lg:hidden">
          <RightPanel theme={theme} btnGrad={btnGrad} totalPrograms={totalPrograms} />
        </div>

        {/* Bottom banner */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border px-8 py-6 backdrop-blur sm:flex-row"
          style={{ borderColor: theme.border, background: theme.glass }}
        >
          <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: theme.text }}>
            <Sparkles className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
            Enroll Now. We handle training → experience → projects → evaluations →{" "}
            <span style={{ color: `rgb(${theme.c1})` }}>Placement Ready</span>
          </div>
          <button
            className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: btnGrad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
          >
            Talk to Career Expert
          </button>
        </div>
      </div>
    </div>
  );
}

function RightPanel({
  theme,
  btnGrad,
  totalPrograms,
}: {
  theme: ReturnType<typeof useTheme>["theme"];
  btnGrad: string;
  totalPrograms: number;
}) {
  return (
    <>
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{ borderColor: theme.border, background: theme.glass }}
      >
        <div
          className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: theme.textMuted }}
        >
          Asscendro Advantage
        </div>
        <div className="space-y-3">
          {advantageItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `rgba(${theme.c1},${theme.mode === "light" ? 0.10 : 0.18})`,
                    color: `rgb(${theme.c1})`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight" style={{ color: theme.text }}>
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug" style={{ color: theme.textMuted }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium" style={{ color: `rgb(${theme.c1})` }}>
          <span>+ More benefits</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition hover:brightness-110"
        style={{ background: btnGrad, boxShadow: `0 8px 30px -8px ${theme.glow}` }}
      >
        <MessageCircle className="h-4 w-4" />
        Talk to Career Expert
      </button>

      <div
        className="grid grid-cols-2 gap-3 rounded-2xl border p-4 backdrop-blur"
        style={{ borderColor: theme.border, background: theme.glass }}
      >
        <div
          className="rounded-xl px-3 py-3 text-center"
          style={{ background: `rgba(${theme.c1},${theme.mode === "light" ? 0.08 : 0.12})` }}
        >
          <div
            className={`text-2xl font-bold tracking-tight text-transparent`}
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: theme.accentGradient }}
          >
            {totalPrograms > 0 ? totalPrograms : '10'}+
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: theme.textMuted }}>
            Programs
          </div>
        </div>
        <div
          className="rounded-xl px-3 py-3 text-center"
          style={{ background: `rgba(${theme.c2},${theme.mode === "light" ? 0.08 : 0.12})` }}
        >
          <div
            className={`text-2xl font-bold tracking-tight text-transparent`}
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: theme.accentGradient }}
          >
            10,000+
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: theme.textMuted }}>
            Students
          </div>
        </div>
        <div
          className="col-span-2 rounded-xl px-3 py-3 text-center"
          style={{ background: `rgba(${theme.c3},${theme.mode === "light" ? 0.08 : 0.12})` }}
        >
          <div
            className={`text-2xl font-bold tracking-tight text-transparent`}
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: theme.accentGradient }}
          >
            50+
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: theme.textMuted }}>
            Hiring Partners
          </div>
        </div>
      </div>
    </>
  );
}
