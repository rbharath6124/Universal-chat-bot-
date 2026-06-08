import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter, Users, Clock, CheckCircle2, XCircle, CalendarCheck } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../lib/supabase";

interface AmbassadorApp {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  year_of_study: string;
  branch: string;
  linkedin_url: string | null;
  instagram_handle: string | null;
  motivation: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["pending", "approved", "rejected", "interview_scheduled"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  interview_scheduled: "Interview Scheduled",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "rgba(234,179,8,0.1)", text: "#eab308", border: "rgba(234,179,8,0.3)" },
  approved: { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.3)" },
  rejected: { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  interview_scheduled: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  interview_scheduled: CalendarCheck,
};

export default function AdminAmbassadors() {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  const [apps, setApps] = useState<AmbassadorApp[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  // Detail modal
  const [selectedApp, setSelectedApp] = useState<AmbassadorApp | null>(null);

  const fetchApps = async () => {
    try {
      const { data } = await supabase
        .from("campus_ambassador_applications")
        .select("*")
        .order("created_at", { ascending: false });
      setApps(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchSearch =
        a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.college.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [apps, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("campus_ambassador_applications").update({ status: newStatus }).eq("id", id);
    await fetchApps();
    if (selectedApp?.id === id) {
      setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Name", "Email", "Phone", "College", "Year", "Branch", "LinkedIn", "Instagram", "Motivation", "Status", "Applied"];
    const rows = filtered.map((a) => [
      a.full_name, a.email, a.phone, a.college, a.year_of_study, a.branch,
      a.linkedin_url || "", a.instagram_handle || "", (a.motivation || "").replace(/\n/g, " "),
      STATUS_LABELS[a.status] || a.status,
      new Date(a.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campus-ambassadors-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const statCounts = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    interview: apps.filter((a) => a.status === "interview_scheduled").length,
  }), [apps]);

  const inputStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    outline: "none",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}
          >
            Campus Ambassadors
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Manage campus ambassador applications
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110"
          style={{ background: grad }}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: statCounts.total, icon: Users, color: `rgb(${theme.c1})` },
          { label: "Pending", value: statCounts.pending, icon: Clock, color: "#eab308" },
          { label: "Approved", value: statCounts.approved, icon: CheckCircle2, color: "#22c55e" },
          { label: "Interviews", value: statCounts.interview, icon: CalendarCheck, color: "#3b82f6" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border p-4"
            style={{
              background: theme.mode === "light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.03)",
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>
                {s.label}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: theme.textMuted }} />
          <input
            type="text"
            placeholder="Search by name, email, college..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4"
            style={inputStyle}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: theme.textMuted }} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={inputStyle}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-2xl border"
        style={{
          background: theme.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.02)",
          borderColor: theme.border,
        }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${theme.border}`,
                background: theme.mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
              }}
            >
              {["Name", "College", "Year", "Branch", "Status", "Applied", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: theme.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: theme.textMuted }}>
                  No applications found.
                </td>
              </tr>
            ) : (
              paginated.map((app) => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS.pending;
                const StatusIcon = STATUS_ICONS[app.status] || Clock;
                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition hover:bg-white/[0.02]"
                    style={{ borderBottom: `1px solid ${theme.border}` }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-left hover:underline"
                        style={{ color: theme.text }}
                      >
                        <p className="font-semibold">{app.full_name}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{app.email}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{app.college}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{app.year_of_study}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>{app.branch}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="rounded-lg text-xs"
                        style={{
                          ...inputStyle,
                          padding: "6px 8px",
                          fontSize: 11,
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-30"
            style={{ color: theme.text, background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)" }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: p === page ? grad : "transparent",
                color: p === page ? "white" : theme.textMuted,
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-30"
            style={{ color: theme.text, background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)" }}
          >
            Next
          </button>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8"
            style={{
              background: theme.mode === "light" ? "#fff" : theme.bg,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 25px 60px -15px rgba(0,0,0,0.5)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
                  {selectedApp.full_name}
                </h3>
                <p className="text-sm" style={{ color: theme.textMuted }}>{selectedApp.email}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {[
                ["Phone", selectedApp.phone],
                ["College", selectedApp.college],
                ["Year", selectedApp.year_of_study],
                ["Branch", selectedApp.branch],
                ["LinkedIn", selectedApp.linkedin_url || "—"],
                ["Instagram", selectedApp.instagram_handle || "—"],
                ["Applied", new Date(selectedApp.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-start gap-3">
                  <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    {label}
                  </span>
                  <span style={{ color: theme.text }}>{value}</span>
                </div>
              ))}

              {selectedApp.motivation && (
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                    Motivation
                  </span>
                  <p
                    className="rounded-xl p-3 text-sm leading-relaxed"
                    style={{
                      background: theme.mode === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                      color: theme.text,
                    }}
                  >
                    {selectedApp.motivation}
                  </p>
                </div>
              )}

              {/* Status changer */}
              <div className="pt-4 border-t" style={{ borderColor: theme.border }}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const sc = STATUS_COLORS[s];
                    const Icon = STATUS_ICONS[s];
                    const isActive = selectedApp.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedApp.id, s)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition"
                        style={{
                          background: isActive ? sc.bg : "transparent",
                          color: isActive ? sc.text : theme.textMuted,
                          border: `1px solid ${isActive ? sc.border : theme.border}`,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {STATUS_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
