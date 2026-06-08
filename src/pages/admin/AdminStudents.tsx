import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { canEditAdmin, getStudents, updateStudentStatus, deleteStudent, Student } from "../../adminStore";

export default function AdminStudents() {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const canEdit = canEditAdmin();

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, search, filterStatus]);

  const toggleStatus = async (id: string, current: string) => {
    if (!canEdit) return;
    const nextStatus = current === "active" ? "suspended" : "active";
    await updateStudentStatus(id, nextStatus);
    await fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (confirm("Are you sure you want to delete this student?")) {
      await deleteStudent(id);
      await fetchStudents();
    }
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
            Students Management
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {students.length} total enrolled students
          </p>
        </div>
      </div>

      {/* Toolbar */}
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
            placeholder="Search by name, email, or college..."
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
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="all" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>All Status</option>
            <option value="active" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>Active</option>
            <option value="suspended" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>Suspended</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-8 text-white/50">
           <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {/* Table */}
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
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Enrollment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: theme.border }}>
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: grad }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: theme.text }}>{student.name}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{student.email}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{student.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <p style={{ color: theme.text }}>{student.enrolledPrograms?.length || 0} Course(s)</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Joined {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        student.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(student.id, student.status)}
                        disabled={!canEdit}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
                        title={student.status === 'active' ? 'Suspend Student' : 'Activate Student'}
                        style={{ opacity: canEdit ? 1 : 0.45, cursor: canEdit ? "pointer" : "not-allowed" }}
                      >
                        {student.status === 'active' ? 
                          <Ban className="h-4 w-4 text-orange-400" /> : 
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        disabled={!canEdit}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-red-500/10"
                        title="Delete Student"
                        style={{ opacity: canEdit ? 1 : 0.45, cursor: canEdit ? "pointer" : "not-allowed" }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm" style={{ color: theme.textMuted }}>
              No students found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
