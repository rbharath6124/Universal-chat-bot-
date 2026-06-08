import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import type { JobListing } from "../placementsData";
import type { Program } from "../adminStore";
import { Category, getCategories } from "../adminStore";

type ListingType = "job" | "program";

interface Props {
  type: ListingType;
  existing?: JobListing | Program | null;
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
}


const jobFields = [
  { key: "company", label: "Company Name", required: true },
  { key: "companyInitials", label: "Initials (2 letters)", required: true },
  { key: "role", label: "Role Title", required: true },
  { key: "salaryPackage", label: "Salary Package", required: true },
  { key: "experienceRequired", label: "Experience Required", required: true },
  { key: "location", label: "Location", required: true },
  { key: "technologies", label: "Technologies (comma separated)", required: true },
  { key: "hiringType", label: "Hiring Type (Full-time/Contract/Part-time)", required: true },
  { key: "domain", label: "Domain", required: true },
  { key: "applicationLink", label: "Application Link", required: false, type: "url" },
  { key: "description", label: "Description", required: false, multiline: true },
];

const programFields = [
  { key: "title", label: "Program Title", required: true },
  { key: "categoryId", label: "Category (tech/finance/business)", required: true },
  { key: "iconName", label: "Icon Name (e.g. Code, TrendingUp)", required: true },
  { key: "price", label: "Price (₹)", required: true, type: "number" },
  { key: "oldPrice", label: "Old Price (₹)", required: false, type: "number" },
  { key: "duration", label: "Duration (e.g. 12 Weeks)", required: true },
  { key: "level", label: "Level (e.g. Beginner to Pro)", required: true },
  { key: "tags", label: "Tags (comma separated)", required: true },
  { key: "color", label: "Gradient Color (e.g. from-blue-500 to-cyan-600)", required: true },
  { key: "blurb", label: "Description/Blurb", required: true, multiline: true },
];

export default function AdminListingModal({ type, existing, onSave, onClose }: Props) {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  const fields = type === "job" ? jobFields : programFields;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
  }, []);

  const [form, setForm] = useState<Record<string, string>>(() => {
    if (!existing) return {};
    const obj: Record<string, string> = {};
    for (const f of fields) {
      const val = (existing as unknown as Record<string, unknown>)[f.key];
      obj[f.key] = Array.isArray(val) ? val.join(", ") : String(val ?? "");
    }
    return obj;
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave(form);
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
          className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl"
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

          <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{
                background: theme.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(8,24,18,0.95)",
                backdropFilter: "blur(8px)",
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
              >
                {existing ? "Edit" : "Add"} {type === "job" ? "Job" : "Program"}
              </h3>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-70"
                style={{ background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }}
              >
                <X className="h-4 w-4" style={{ color: theme.text }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {fields.map((f) => {
                if (f.key === "domain" && type !== "program") {
                  return (
                    <div key={f.key}>
                      <label style={labelStyle}>Domain / Category *</label>
                      <select
                        required
                        value={form.domain || ""}
                        onChange={(e) => set("domain", e.target.value)}
                        style={inputStyle}
                      >
                        <option value="" disabled style={{ background: theme.mode === 'light' ? '#fff' : '#000' }}>Select Domain</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} style={{ background: theme.mode === 'light' ? '#fff' : '#000' }}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={f.key}>
                    <label style={labelStyle}>
                      {f.label} {f.required && "*"}
                    </label>
                    {(f as { multiline?: boolean }).multiline ? (
                      <textarea
                        required={f.required}
                        value={form[f.key] || ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" as const }}
                        onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                        onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                      />
                    ) : (
                      <input
                        required={f.required}
                        type={(f as any).type || "text"}
                        value={form[f.key] || ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = `rgb(${theme.c1})`; e.target.style.boxShadow = `0 0 0 3px rgba(${theme.c1},0.15)`; }}
                        onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = "none"; }}
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                  style={{ background: grad, boxShadow: `0 8px 30px -10px ${theme.glow}` }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    existing ? "Update Listing" : "Add Listing"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
