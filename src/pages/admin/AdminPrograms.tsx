import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, Users, Star, DollarSign, Calendar, Layers } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { canEditAdmin } from "../../adminStore";
import { getPrograms, addProgram, updateProgram, deleteProgram, Program, MainDomain, Subdomain, getMainDomains, getSubdomains } from "../../lib/programsApi";
import AdminProgramModal from "../../components/AdminProgramModal";

export default function AdminPrograms() {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [mainDomains, setMainDomains] = useState<MainDomain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  
  // Modal state
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const canEdit = canEditAdmin();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [fetchedPrograms, fetchedMains, fetchedSubs] = await Promise.all([
      getPrograms(),
      getMainDomains(),
      getSubdomains(),
    ]);
    setPrograms(fetchedPrograms);
    setMainDomains(fetchedMains);
    setSubdomains(fetchedSubs);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return programs.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [programs, search]);

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (confirm("Are you sure you want to delete this program?")) {
      await deleteProgram(id);
      await fetchData();
    }
  };

  const handleEdit = (prog: Program) => {
    if (!canEdit) return;
    setEditing(prog);
  };

  const toggleStatus = async (id: string, current: string) => {
    if (!canEdit) return;
    const nextStatus = current === "published" ? "draft" : "published";
    await updateProgram(id, { status: nextStatus as "published" | "draft" });
    await fetchData();
  };

  const handleSave = async (savedProg: Partial<Program>) => {
    if (!canEdit) return;
    try {
      if (editing) {
        await updateProgram(editing.id, savedProg);
      } else {
        await addProgram(savedProg as any);
      }
      await fetchData();
      setAdding(false);
      setEditing(null);
    } catch (e: any) {
      alert("Error saving program: " + e.message);
    }
  };

  const cardStyle = {
    background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
    backdropFilter: "blur(10px)",
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 24,
  };

  if (loading) {
    return <div className="p-8 text-center" style={{ color: theme.textMuted }}>Loading programs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            Programs Management
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {programs.length} total programs
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: grad, boxShadow: `0 4px 20px -8px ${theme.glow}` }}
          >
            <Plus className="h-4 w-4" />
            Create Program
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: theme.textMuted }} />
        <input
          type="text"
          placeholder="Search programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition"
          style={{
            background: theme.mode === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prog) => {
          return (
            <div key={prog.id} className="group relative overflow-hidden transition-all hover:-translate-y-1" style={cardStyle}>
              {/* Card Header Background */}
              <div
                className={`h-24 opacity-20 bg-gradient-to-br ${prog.color || "from-blue-500 to-cyan-600"}`}
              />

              <div className="p-5 -mt-12">
                <div className="mb-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: `rgb(${theme.c1})` }}>
                    {prog.subdomains?.name || "No Subdomain"}
                  </div>
                  <h3 className="text-lg font-bold leading-tight" style={{ color: theme.text }}>{prog.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: theme.text }}>
                      {prog.price === 0 ? "Free" : `₹${(prog.price || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{prog.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{(prog.enrollments || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{prog.rating || "5.0"}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(prog.tags || []).slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-md px-2 py-1 text-xs font-medium"
                      style={{
                        background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                        color: theme.text,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {(prog.tags || []).length > 3 && (
                    <span
                      className="rounded-md px-2 py-1 text-xs font-medium"
                      style={{
                        background: theme.mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                        color: theme.textMuted,
                      }}
                    >
                      +{(prog.tags || []).length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(prog.id, prog.status)}
                      disabled={!canEdit}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition hover:opacity-80 ${
                        prog.status === "published" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}
                      style={{ cursor: canEdit ? "pointer" : "not-allowed", opacity: canEdit ? 1 : 0.65 }}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${prog.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {prog.status === "published" ? "Published" : "Draft"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(prog)}
                      disabled={!canEdit}
                      className="rounded-lg p-2 transition hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: theme.textMuted, cursor: canEdit ? "pointer" : "not-allowed", opacity: canEdit ? 1 : 0.45 }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prog.id)}
                      disabled={!canEdit}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                      style={{ cursor: canEdit ? "pointer" : "not-allowed", opacity: canEdit ? 1 : 0.45 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center" style={{ color: theme.textMuted }}>
            <Layers className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No programs found.</p>
          </div>
        )}
      </div>

      {(adding || editing) && (
        <AdminProgramModal
          existing={editing}
          mainDomains={mainDomains}
          subdomains={subdomains}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
