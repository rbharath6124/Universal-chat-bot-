import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search, MapPin, Wallet, Briefcase, ArrowRight, Filter,
  ChevronDown, Building2, Code2, Clock, Users,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { getJobs } from "../store";
import { getSubdomains, Subdomain } from "../lib/programsApi";
import JobApplicationModal from "../components/JobApplicationModal";
import type { JobListing } from "../placementsData";

const hiringTypes = ["All", "Full-time", "Contract", "Part-time"];

// Animated counter (reuses pattern from Stats.tsx)
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
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
      className="text-3xl font-extrabold tracking-tight sm:text-4xl"
    >
      {display}{suffix}
    </div>
  );
}

export default function PlacementsPage() {
  const { theme } = useTheme();
  const grad = theme.accentGradient;

  const [jobs, setJobs] = useState<JobListing[]>([]);
  
  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);
  
  const [categories, setCategories] = useState<Subdomain[]>([]);
  useEffect(() => {
    async function fetchCats() {
      const subdomains = await getSubdomains();
      setCategories(subdomains);
    }
    fetchCats();
  }, []);

  // Build dynamic domain list: "All" + category names
  const domains = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  // Build a lookup: category ID → title (for backward compat with legacy string domains)
  const catIdToTitle = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [hiringType, setHiringType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [applying, setApplying] = useState<JobListing | null>(null);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (domain !== "All") {
        const resolvedDomain = catIdToTitle[j.domain] || j.domain;
        if (resolvedDomain !== domain) return false;
      }
      if (hiringType !== "All" && j.hiringType !== hiringType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          j.role.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.technologies.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [jobs, search, domain, hiringType, catIdToTitle]);

  const scrollToListings = () => {
    document.getElementById("job-listings")?.scrollIntoView({ behavior: "smooth" });
  };

  const selectStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: 12,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    appearance: "none" as const,
    cursor: "pointer",
    minWidth: 130,
  };

  const optionStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "#ffffff" : "#04100c",
    color: theme.text,
  };

  return (
    <main className="relative min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden px-4 pt-28 pb-16">
        {/* Background */}
        <div
          className="blob pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: `rgb(${theme.c2})` }}
        />
        <div
          className="blob pointer-events-none absolute -left-32 bottom-10 h-[350px] w-[350px] rounded-full opacity-15 blur-3xl"
          style={{ background: `rgb(${theme.c1})`, animationDelay: "-8s" }}
        />
        <div className="grid-bg pointer-events-none absolute inset-0" />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: `rgba(${theme.c1},0.4)`,
              background: `rgba(${theme.c1},${theme.mode === "light" ? 0.08 : 0.12})`,
              color: `rgb(${theme.c1})`,
            }}
          >
            <Building2 className="h-4 w-4" />
            Placement Portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
          >
            Get placed with{" "}
            <span className={`bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>
              top hiring partners
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg"
            style={{ color: theme.textMuted }}
          >
            We connect skilled learners with real hiring opportunities.
            Your next career milestone starts here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={scrollToListings}
              className="group flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition hover:brightness-110"
              style={{ background: grad, boxShadow: `0 14px 40px -12px ${theme.glow}` }}
            >
              Browse Openings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              { value: 120, suffix: "+", label: "Hiring Partners", icon: Building2 },
              { value: 500, suffix: "+", label: "Placements", icon: Users },
              { value: 8, suffix: " LPA", label: "Avg Package", icon: Wallet },
              { value: 95, suffix: "%", label: "Success Rate", icon: Briefcase },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="rounded-2xl p-5 text-center"
                style={{
                  background: theme.glass,
                  backdropFilter: "blur(14px)",
                  border: `1px solid ${theme.border}`,
                }}
              >
                <s.icon className="mx-auto mb-2 h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
                <Counter value={s.value} suffix={s.suffix} />
                <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ JOB LISTINGS ═══════ */}
      <section id="job-listings" className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 rounded-2xl p-4"
            style={{
              background: theme.glass,
              backdropFilter: "blur(14px)",
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1" style={{ minWidth: 200 }}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: theme.textMuted }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                  style={{
                    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                />
              </div>

              <button
                onClick={() => setShowFilters((f) => !f)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium lg:hidden"
                style={{
                  background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="relative">
                  <select value={domain} onChange={(e) => setDomain(e.target.value)} style={selectStyle}>
                    {domains.map((d) => <option key={d} value={d} style={optionStyle}>{d === "All" ? "All Domains" : d}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2" style={{ color: theme.textMuted }} />
                </div>
                <div className="relative">
                  <select value={hiringType} onChange={(e) => setHiringType(e.target.value)} style={selectStyle}>
                    {hiringTypes.map((h) => <option key={h} value={h} style={optionStyle}>{h === "All" ? "All Types" : h}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2" style={{ color: theme.textMuted }} />
                </div>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 flex flex-wrap gap-3 overflow-hidden border-t pt-3 lg:hidden"
                style={{ borderColor: theme.border }}
              >
                <div className="relative flex-1" style={{ minWidth: 120 }}>
                  <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                    {domains.map((d) => <option key={d} value={d} style={optionStyle}>{d === "All" ? "All Domains" : d}</option>)}
                  </select>
                </div>
                <div className="relative flex-1" style={{ minWidth: 120 }}>
                  <select value={hiringType} onChange={(e) => setHiringType(e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                    {hiringTypes.map((h) => <option key={h} value={h} style={optionStyle}>{h === "All" ? "All Types" : h}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results count */}
          <p className="mb-6 text-sm" style={{ color: theme.textMuted }}>
            Showing <strong style={{ color: theme.text }}>{filtered.length}</strong> position{filtered.length !== 1 ? "s" : ""}
          </p>

          {/* Cards Grid */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `rgba(${theme.c1},0.12)` }}
              >
                <Briefcase className="h-10 w-10" style={{ color: `rgb(${theme.c1})` }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
                No positions found
              </h3>
              <p className="max-w-sm text-sm" style={{ color: theme.textMuted }}>
                Try adjusting your search or filters.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="cinematic-card group relative overflow-hidden p-6"
                  style={{
                    borderColor: theme.border,
                    background: theme.glass,
                    backdropFilter: "blur(14px)",
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: `rgb(${theme.c1})` }}
                  />

                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ background: grad, boxShadow: `0 4px 15px -5px ${theme.glow}` }}
                    >
                      {job.companyInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-base font-bold leading-tight"
                        style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
                      >
                        {job.role}
                      </h3>
                      <p className="mt-0.5 text-sm" style={{ color: theme.textMuted }}>{job.company}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                      <Wallet className="h-3.5 w-3.5 flex-shrink-0" /> {job.salaryPackage}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" /> {job.experienceRequired}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                      <Code2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `rgba(${theme.c1},${theme.mode === "light" ? 0.1 : 0.18})`,
                          color: `rgb(${theme.c1})`,
                        }}
                      >
                        {job.hiringType}
                      </span>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-medium"
                        style={{
                          background: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)",
                          color: theme.textMuted,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Apply button */}
                  {job.applicationLink ? (
                    <a
                      href={job.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                      style={{ background: grad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
                    >
                      Click to apply
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setApplying(job)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                      style={{ background: grad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
                    >
                      Apply Now
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {applying && (
        <JobApplicationModal job={applying} onClose={() => setApplying(null)} />
      )}
    </main>
  );
}
