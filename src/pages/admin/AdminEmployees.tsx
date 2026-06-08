import { useState, useMemo, useEffect } from "react";
import type { CSSProperties, FormEvent } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Briefcase, Mail, UserPlus, X } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import {
  addEmployee,
  canManageEmployees,
  deleteEmployee,
  getEmployees,
  Employee,
} from "../../adminStore";

export default function AdminEmployees() {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Omit<Employee, "id">>({
    name: "",
    role: "",
    department: "",
    email: "",
    status: "active",
    joinDate: new Date().toISOString()
  });
  const canManage = canManageEmployees();

  const filtered = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!canManage) return;
    if (confirm("Remove this employee's access to the admin portal?")) {
      await deleteEmployee(id);
      await fetchEmployees();
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    try {
      await addEmployee({
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department.trim(),
        email: form.email.trim(),
      });
      await fetchEmployees();
      setForm({ name: "", role: "", department: "", email: "", status: "active", joinDate: new Date().toISOString() });
      setAdding(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this member.");
    }
  };

  const inputStyle: CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            Team Management
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {employees.length} active team members
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setAdding((open) => !open); setError(""); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: grad, boxShadow: `0 4px 20px -8px ${theme.glow}` }}
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Cancel" : "Add Member"}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center p-8 text-white/50">
           <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {adding && canManage && (
        <motion.form
          onSubmit={handleAddMember}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5"
          style={{
            background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
            backdropFilter: "blur(10px)",
            borderColor: theme.border,
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
            <h2 className="font-bold" style={{ color: theme.text }}>Add Member</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
            <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Work email" type="email" className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
            <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role title" className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />
            <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle} />

            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })} className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle}>
              <option value="active" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>Active</option>
              <option value="inactive" style={{ background: theme.mode === 'light' ? '#fff' : '#04100c' }}>Inactive</option>
            </select>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110" style={{ background: grad }}>
              Add Member
            </button>
          </div>
        </motion.form>
      )}

      <div
        className="flex items-center gap-4 rounded-2xl border p-4"
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
            placeholder="Search team members..."
            className="w-full rounded-xl py-2 pl-10 pr-4 text-sm outline-none"
            style={{
              background: theme.mode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp, i) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
              backdropFilter: "blur(10px)",
              borderColor: theme.border,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white shadow-lg"
                  style={{ background: grad }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: theme.text }}>{emp.name}</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{emp.role}</p>
                </div>
              </div>
              
              {canManage && (
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-red-500/10"
                  title="Remove Member"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
                <Mail className="h-4 w-4" />
                {emp.email}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
                <Briefcase className="h-4 w-4" />
                {emp.department}
              </div>
              
              <div className="mt-4 border-t pt-4" style={{ borderColor: theme.border }}>
                <span className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">
                  No Admin Access Allowed
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-sm" style={{ color: theme.textMuted }}>
          No team members found matching your search.
        </div>
      )}
    </div>
  );
}
