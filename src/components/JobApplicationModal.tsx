import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle, Loader2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { submitJobApplication } from "../store";
import type { JobListing } from "../placementsData";

interface Props {
  job: JobListing;
  onClose: () => void;
}

export default function JobApplicationModal({ job, onClose }: Props) {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedinUrl: "",
    portfolioUrl: "",
    experience: "",
    whyHire: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let resumeData = "";
    let resumeFileName = "";
    if (resumeFile) {
      resumeFileName = resumeFile.name;
      const reader = new FileReader();
      resumeData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(resumeFile);
      });
    }

    await new Promise((r) => setTimeout(r, 800));

    await submitJobApplication({
      jobId: job.id,
      name: form.name,
      email: form.email,
      resumeFileName,
      resumeData,
      linkedinUrl: form.linkedinUrl,
      portfolioUrl: form.portfolioUrl,
      experience: form.experience,
      whyHire: form.whyHire,
    });

    setSubmitting(false);
    setSuccess(true);
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
    transition: "border-color 0.2s, box-shadow 0.2s",
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
          className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl"
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

          {/* Success State */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-10 text-center"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid rgb(${theme.c1})` }}
                    animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: grad, boxShadow: `0 0 40px -5px ${theme.glow}` }}
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                </div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
                >
                  Application Submitted!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-sm text-sm"
                  style={{ color: theme.textMuted }}
                >
                  Your application for <strong style={{ color: theme.text }}>{job.role}</strong> at{" "}
                  <strong style={{ color: theme.text }}>{job.company}</strong> has been received.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  style={{ background: grad }}
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{
                background: theme.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(8,24,18,0.95)",
                backdropFilter: "blur(8px)",
                borderBottom: `1px solid ${theme.border}`,
              }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}>
                    Apply — {job.role}
                  </h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{job.company} · {job.salaryPackage}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-70"
                  style={{ background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }}
                >
                  <X className="h-4 w-4" style={{ color: theme.text }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                      style={inputStyle} placeholder="John Doe"
                      onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                      onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      style={inputStyle} placeholder="john@example.com"
                      onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                      onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label style={labelStyle}>LinkedIn URL</label>
                    <input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)}
                      style={inputStyle} placeholder="https://linkedin.com/in/..."
                      onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                      onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Portfolio URL</label>
                    <input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)}
                      style={inputStyle} placeholder="https://portfolio.dev"
                      onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                      onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label style={labelStyle}>Resume (PDF/DOC) *</label>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-sm transition hover:border-emerald-500/50"
                    style={{ borderColor: theme.border, color: theme.textMuted }}
                  >
                    <Upload className="h-5 w-5 flex-shrink-0" style={{ color: `rgb(${theme.c1})` }} />
                    {resumeFile ? (
                      <span style={{ color: theme.text }}>{resumeFile.name}</span>
                    ) : (
                      <span>Click to upload your resume</span>
                    )}
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>Experience</label>
                  <input value={form.experience} onChange={(e) => set("experience", e.target.value)}
                    style={inputStyle} placeholder="e.g. 1 year at StartupX as Frontend Dev"
                    onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Why should we hire you?</label>
                  <textarea
                    value={form.whyHire}
                    onChange={(e) => set("whyHire", e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" as const }}
                    placeholder="Share what makes you a great fit for this role..."
                    onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !form.name || !form.email}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                    style={{ background: grad, boxShadow: `0 8px 30px -10px ${theme.glow}` }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border px-6 py-3 text-sm font-semibold backdrop-blur transition hover:opacity-80"
                    style={{
                      borderColor: theme.border,
                      background: theme.mode === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.05)",
                      color: theme.text,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
