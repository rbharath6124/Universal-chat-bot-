import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { Program, CourseModule, Mentor, MainDomain, Subdomain } from "../lib/programsApi";

interface Props {
  existing?: Program | null;
  mainDomains: MainDomain[];
  subdomains: Subdomain[];
  onSave: (data: Partial<Program>) => void;
  onClose: () => void;
}

export default function AdminProgramModal({ existing, mainDomains, subdomains, onSave, onClose }: Props) {
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "overview" | "curriculum" | "mentors" | "projects" | "other">("basic");
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  // Basic Fields
  const [title, setTitle] = useState(existing?.title || "");
  const [tagline, setTagline] = useState(existing?.tagline || "");
  const [price, setPrice] = useState(existing?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(existing?.old_price || "");
  const [savings, setSavings] = useState("");
  const [duration, setDuration] = useState(existing?.duration || "");
  const [level, setLevel] = useState(existing?.level || "");
  const [mainDomainId, setMainDomainId] = useState(existing?.main_domain_id || (mainDomains.length > 0 ? mainDomains[0].id : ""));
  const [subdomainId, setSubdomainId] = useState(existing?.subdomain_id || "");
  const [color, setColor] = useState(existing?.color || "#3b82f6,#06b6d4");
  const [tags, setTags] = useState(existing?.tags?.join(", ") || "");

  // Detail fields
  const [overview, setOverview] = useState(existing?.overview || "");
  const [whoShouldEnroll, setWhoShouldEnroll] = useState(existing?.who_should_enroll?.join("\n") || "");
  const [whatYouLearn, setWhatYouLearn] = useState(existing?.what_you_learn?.join("\n") || "");
  const [toolsCovered, setToolsCovered] = useState(existing?.tools_covered?.join(", ") || "");
  const [includes, setIncludes] = useState(existing?.includes?.join("\n") || "");
  const [certificate, setCertificate] = useState(existing?.certificate || "");

  // Arrays
  const [modules, setModules] = useState<CourseModule[]>(existing?.modules || []);
  const [projects, setProjects] = useState<{ title: string; description: string }[]>(existing?.projects || []);
  const [mentors, setMentors] = useState<Mentor[]>(existing?.mentors || []);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(existing?.faqs || []);

  useEffect(() => {
    // If we have a mainDomain selected, but no valid subdomain, pick the first one
    const validSubs = subdomains.filter(s => s.main_domain_id === mainDomainId);
    if (!validSubs.some(s => s.id === subdomainId)) {
      if (validSubs.length > 0) setSubdomainId(validSubs[0].id);
      else setSubdomainId("");
    }
  }, [mainDomainId, subdomains, subdomainId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await new Promise((r) => setTimeout(r, 400));

    const programData: Partial<Program> = {
      title,
      tagline,
      status: existing?.status || "draft",
      price: Number(price) || 0,
      old_price: Number(originalPrice) || undefined,
      duration,
      rating: existing?.rating || "5.0",
      main_domain_id: mainDomainId,
      subdomain_id: subdomainId,
      blurb: overview.slice(0, 100) + "...",
      level,
      color,
      tags: tags.split(",").map((s: string) => s.trim()).filter(Boolean),
      overview,
      who_should_enroll: whoShouldEnroll.split("\n").filter(Boolean),
      what_you_learn: whatYouLearn.split("\n").filter(Boolean),
      tools_covered: toolsCovered.split(",").map((s: string) => s.trim()).filter(Boolean),
      includes: includes.split("\n").filter(Boolean),
      certificate,
      modules,
      projects,
      mentors,
      faqs,
    };

    onSave(programData);
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "projects", label: "Projects" },
    { id: "mentors", label: "Mentors" },
    { id: "other", label: "Other" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl flex flex-col"
          style={{
            background: theme.mode === "light" ? "rgba(255,255,255,0.95)" : "rgba(8,24,18,0.97)",
            border: `1px solid ${theme.border}`,
            boxShadow: `0 30px 80px -20px rgba(0,0,0,0.6), 0 0 50px -15px ${theme.glow}`,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, rgb(${theme.c1}), transparent)` }}
          />

          {/* Header */}
          <div
            className="flex flex-col border-b"
            style={{
              background: theme.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(8,24,18,0.95)",
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}>
                {existing ? "Edit Program" : "Create New Program"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-70"
                style={{ background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }}
              >
                <X className="h-4 w-4" style={{ color: theme.text }} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex overflow-x-auto px-6 pb-2 gap-2 hide-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition"
                  style={{
                    background: activeTab === t.id ? `rgba(${theme.c1}, 0.15)` : "transparent",
                    color: activeTab === t.id ? `rgb(${theme.c1})` : theme.textMuted,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: "50vh" }}>
            <form id="programForm" onSubmit={handleSubmit} className="space-y-6">
              
              {/* BASIC INFO */}
              {activeTab === "basic" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Program Title *</label>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                  </div>
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Tagline</label>
                    <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Main Domain *</label>
                    <select
                      value={mainDomainId}
                      onChange={(e) => setMainDomainId(e.target.value)}
                      style={inputStyle}
                    >
                      {mainDomains.map((md) => (
                        <option key={md.id} value={md.id} style={{ background: theme.mode === 'light' ? '#fff' : '#000' }}>
                          {md.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Subdomain *</label>
                    <select
                      value={subdomainId}
                      onChange={(e) => setSubdomainId(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="" disabled style={{ background: theme.mode === 'light' ? '#fff' : '#000' }}>Select a Subdomain</option>
                      {subdomains.filter(s => s.main_domain_id === mainDomainId).map((s) => (
                        <option key={s.id} value={s.id} style={{ background: theme.mode === 'light' ? '#fff' : '#000' }}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Price (₹) *</label>
                    <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Original Price (e.g. ₹35,000)</label>
                    <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Savings (e.g. 45% OFF)</label>
                    <input value={savings} onChange={(e) => setSavings(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Duration (e.g. 12 Weeks) *</label>
                    <input required value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Level (e.g. Beginner) *</label>
                    <input required value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle} />
                  </div>
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Program Gradient Colors (Start & End) *</label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: theme.border, background: theme.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                        <input
                          type="color"
                          value={color.includes(',') ? color.split(',')[0] : (color.startsWith('#') ? color : '#3b82f6')}
                          onChange={(e) => {
                            const endColor = color.includes(',') ? color.split(',')[1] : '#06b6d4';
                            setColor(`${e.target.value},${endColor}`);
                          }}
                          className="h-10 w-20 cursor-pointer rounded bg-transparent border-0 p-0"
                        />
                        <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Start Color</span>
                      </div>
                      <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: theme.border, background: theme.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}>
                        <input
                          type="color"
                          value={color.includes(',') ? color.split(',')[1] : (color.startsWith('#') ? color : '#06b6d4')}
                          onChange={(e) => {
                            const startColor = color.includes(',') ? color.split(',')[0] : (color.startsWith('#') ? color : '#3b82f6');
                            setColor(`${startColor},${e.target.value}`);
                          }}
                          className="h-10 w-20 cursor-pointer rounded bg-transparent border-0 p-0"
                        />
                         <span className="text-sm font-medium" style={{ color: theme.textMuted }}>End Color</span>
                      </div>
                    </div>
                    {color.includes(',') && (
                       <div className="mt-3 h-4 w-full rounded-full" style={{ background: `linear-gradient(to right, ${color.split(',')[0]}, ${color.split(',')[1]})` }} />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Tags (Comma separated) *</label>
                    <input required value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              )}

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <label style={labelStyle}>Program Overview</label>
                    <textarea rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Who Should Enroll? (One per line)</label>
                    <textarea rows={4} value={whoShouldEnroll} onChange={(e) => setWhoShouldEnroll(e.target.value)} style={inputStyle} placeholder="College students&#10;Professionals" />
                  </div>
                  <div>
                    <label style={labelStyle}>What You Will Learn (One per line)</label>
                    <textarea rows={4} value={whatYouLearn} onChange={(e) => setWhatYouLearn(e.target.value)} style={inputStyle} placeholder="React fundamentals&#10;Backend with Node" />
                  </div>
                  <div>
                    <label style={labelStyle}>Tools & Technologies Covered (Comma separated)</label>
                    <input value={toolsCovered} onChange={(e) => setToolsCovered(e.target.value)} style={inputStyle} placeholder="React, Node.js, MongoDB" />
                  </div>
                </div>
              )}

              {/* CURRICULUM */}
              {activeTab === "curriculum" && (
                <div className="space-y-4">
                  {modules.map((mod, idx) => (
                    <div key={idx} className="rounded-2xl border p-4" style={{ borderColor: theme.border, background: `rgba(0,0,0,0.02)` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold">Module {idx + 1}</div>
                        <button type="button" onClick={() => setModules(modules.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 mb-3">
                        <div>
                          <label style={labelStyle}>Module Title</label>
                          <input value={mod.title} onChange={(e) => { const m = [...modules]; m[idx].title = e.target.value; setModules(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Duration</label>
                          <input value={mod.duration} onChange={(e) => { const m = [...modules]; m[idx].duration = e.target.value; setModules(m); }} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Topics (One per line)</label>
                        <textarea rows={3} value={mod.topics.join("\n")} onChange={(e) => { const m = [...modules]; m[idx].topics = e.target.value.split("\n"); setModules(m); }} style={inputStyle} />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setModules([...modules, { title: "", duration: "", topics: [] }])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: theme.border, color: theme.text }}>
                    <Plus className="h-4 w-4" /> Add Module
                  </button>
                </div>
              )}

              {/* PROJECTS */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="rounded-2xl border p-4" style={{ borderColor: theme.border }}>
                       <div className="flex items-center justify-between mb-3">
                        <div className="font-bold">Project {idx + 1}</div>
                        <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="mb-3">
                        <label style={labelStyle}>Project Title</label>
                        <input value={proj.title} onChange={(e) => { const p = [...projects]; p[idx].title = e.target.value; setProjects(p); }} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Description</label>
                        <textarea rows={2} value={proj.description} onChange={(e) => { const p = [...projects]; p[idx].description = e.target.value; setProjects(p); }} style={inputStyle} />
                      </div>
                    </div>
                  ))}
                   <button type="button" onClick={() => setProjects([...projects, { title: "", description: "" }])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: theme.border, color: theme.text }}>
                    <Plus className="h-4 w-4" /> Add Capstone Project
                  </button>
                </div>
              )}

              {/* MENTORS */}
              {activeTab === "mentors" && (
                <div className="space-y-4">
                  {mentors.map((mentor, idx) => (
                    <div key={idx} className="rounded-2xl border p-4" style={{ borderColor: theme.border }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold">Mentor {idx + 1}</div>
                        <button type="button" onClick={() => setMentors(mentors.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label style={labelStyle}>Name</label>
                          <input value={mentor.name} onChange={(e) => { const m = [...mentors]; m[idx].name = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Initials (e.g. RS)</label>
                          <input value={mentor.initials} onChange={(e) => { const m = [...mentors]; m[idx].initials = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Role</label>
                          <input value={mentor.role} onChange={(e) => { const m = [...mentors]; m[idx].role = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Company</label>
                          <input value={mentor.company} onChange={(e) => { const m = [...mentors]; m[idx].company = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Experience (e.g. 10+ years)</label>
                          <input value={mentor.experience} onChange={(e) => { const m = [...mentors]; m[idx].experience = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Gradient Color</label>
                          <input value={mentor.color} onChange={(e) => { const m = [...mentors]; m[idx].color = e.target.value; setMentors(m); }} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setMentors([...mentors, { name: "", initials: "", role: "", company: "", experience: "", color: "from-blue-500 to-indigo-600" }])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: theme.border, color: theme.text }}>
                    <Plus className="h-4 w-4" /> Add Mentor
                  </button>
                </div>
              )}

              {/* OTHER */}
              {activeTab === "other" && (
                <div className="space-y-6">
                  <div>
                    <label style={labelStyle}>What the program includes (One per line)</label>
                    <textarea rows={4} value={includes} onChange={(e) => setIncludes(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Certificate Description</label>
                    <textarea rows={2} value={certificate} onChange={(e) => setCertificate(e.target.value)} style={inputStyle} />
                  </div>
                  
                  <div className="pt-4 border-t" style={{ borderColor: theme.border }}>
                    <h4 className="font-bold mb-3">Frequently Asked Questions</h4>
                    <div className="space-y-3">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="rounded-xl border p-3" style={{ borderColor: theme.border }}>
                          <div className="flex justify-between mb-2">
                            <label style={labelStyle}>Question {idx + 1}</label>
                            <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <input className="mb-2" value={faq.q} onChange={(e) => { const f = [...faqs]; f[idx].q = e.target.value; setFaqs(f); }} style={inputStyle} placeholder="Question" />
                          <textarea rows={2} value={faq.a} onChange={(e) => { const f = [...faqs]; f[idx].a = e.target.value; setFaqs(f); }} style={inputStyle} placeholder="Answer" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setFaqs([...faqs, { q: "", a: "" }])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: theme.border, color: theme.text }}>
                        <Plus className="h-4 w-4" /> Add FAQ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-3 border-t p-6"
            style={{
              background: theme.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(8,24,18,0.95)",
              borderColor: theme.border,
            }}
          >
            <button
              type="submit"
              form="programForm"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              style={{ background: grad, boxShadow: `0 8px 30px -10px ${theme.glow}` }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                existing ? "Update Program" : "Publish Program"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:opacity-80"
              style={{
                borderColor: theme.border,
                background: theme.mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.05)",
                color: theme.text,
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
