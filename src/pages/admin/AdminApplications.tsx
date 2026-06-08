import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { canEditAdmin } from "../../adminStore";
import { getJobApplications, updateJobAppStatus } from "../../store";

export default function AdminApplications() {
  const { theme } = useTheme();
  
  const [jobApps, setJobApps] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const canEdit = canEditAdmin();

  const fetchApps = async () => {
    try {
      const data = await getJobApplications();
      setJobApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const combinedApps = useMemo(() => {
    const list = [
      ...jobApps.map(a => ({ ...a, type: "Placement" as const, name: (a as any).name }))
    ];
    
    return list.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.email.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || a.type.toLowerCase() === filterType;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
  }, [jobApps, search, filterType]);

  const handleStatusChange = async (id: string, status: string) => {
    if (!canEdit) return;
    await updateJobAppStatus(id, status as any);
    await fetchApps();
  };

  const downloadResume = (app: any) => {
    if (!app.resumeData) return;
    const a = document.createElement("a");
    a.href = app.resumeData;
    a.download = app.resumeFileName || "resume";
    a.click();
  };

  const statusColors: Record<string, string> = {
    pending: "status-pending",
    shortlisted: "status-shortlisted",
    rejected: "status-rejected",
    hired: "status-hired",
  };

  const selectStyle: React.CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: 12,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            All Applications
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {combinedApps.length} total applications received
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-8 text-white/50">
           <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl border p-4"
        style={{
          background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
          backdropFilter: "blur(10px)",
          borderColor: theme.border,
        }}
      >
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: theme.textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants..."
            className="w-full rounded-xl py-2 pl-10 pr-4 text-sm outline-none"
            style={{
              background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: theme.textMuted }} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
            <option value="all" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>All Types</option>
            <option value="placement" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>Placements</option>
          </select>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
          backdropFilter: "blur(10px)",
          borderColor: theme.border,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead
              className="text-xs uppercase tracking-wider"
              style={{
                background: theme.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                color: theme.textMuted,
                borderBottom: `1px solid ${theme.border}`
              }}
            >
              <tr>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Applied Date</th>
                <th className="px-6 py-4 font-medium">Resume</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {combinedApps.map((app, i) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-bold" style={{ color: theme.text }}>{app.name}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{app.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: `rgba(${theme.c1},0.15)`,
                        color: `rgb(${theme.c1})`
                      }}
                    >
                      {app.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4" style={{ color: theme.textMuted }}>
                    {new Date(app.appliedAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {app.resumeData ? (
                      <button
                        onClick={() => downloadResume(app)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition hover:brightness-110"
                        style={{ background: `rgba(${theme.c1},0.15)`, color: `rgb(${theme.c1})` }}
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">No Resume</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={!canEdit}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${statusColors[app.status]}`}
                      style={{
                        border: "none",
                        outline: "none",
                        cursor: canEdit ? "pointer" : "not-allowed",
                        opacity: canEdit ? 1 : 0.7,
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {combinedApps.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: theme.textMuted }}>
              No applications found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
