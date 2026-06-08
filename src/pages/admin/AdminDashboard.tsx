import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, GraduationCap, DollarSign, TrendingUp,
  Activity, Briefcase, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { useTheme } from "../../ThemeContext";
import { getDashboardStats } from "../../adminStore";
import { getJobApplications } from "../../store";

// Mock chart data
const revenueData = [
  { name: "Jan", total: 120000 },
  { name: "Feb", total: 150000 },
  { name: "Mar", total: 180000 },
  { name: "Apr", total: 220000 },
  { name: "May", total: 280000 },
  { name: "Jun", total: 350000 },
  { name: "Jul", total: 410000 },
];

const enrollmentsData = [
  { name: "Jan", count: 45 },
  { name: "Feb", count: 52 },
  { name: "Mar", count: 68 },
  { name: "Apr", count: 85 },
  { name: "May", count: 110 },
  { name: "Jun", count: 135 },
  { name: "Jul", count: 160 },
];

export default function AdminDashboard() {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;
  
  const [stats] = useState(getDashboardStats());
  const [jobApps, setJobApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const apps = await getJobApplications();
        setJobApps(apps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalApps = jobApps.length;
  const pendingApps = jobApps.filter(a => a.status === "pending").length;

  const cards = [
    { label: "Total Revenue", value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, trend: "+12%", color: `rgb(${theme.c1})` },
    { label: "Total Students", value: stats.totalStudents, icon: Users, trend: "+5%", color: `rgb(${theme.c2})` },
    { label: "Enrollments", value: stats.totalEnrollments, icon: GraduationCap, trend: "+18%", color: `rgb(${theme.c3})` },
    { label: "Placement Apps", value: totalApps, icon: Briefcase, trend: "+24%", color: `rgb(${theme.c1})` },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-white/50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            Overview
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Welcome back to your enterprise dashboard.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: grad, boxShadow: `0 4px 20px -8px ${theme.glow}` }}
        >
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
              backdropFilter: "blur(10px)",
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textMuted }}>{card.label}</p>
                <p className="mt-2 text-3xl font-extrabold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
                  {card.value}
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `rgba(${theme.c1}, 0.1)` }}
              >
                <card.icon className="h-6 w-6" style={{ color: card.color }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-emerald-400">{card.trend}</span>
              <span style={{ color: theme.textMuted }}>vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border p-5 lg:col-span-4"
          style={{
            background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
            backdropFilter: "blur(10px)",
            borderColor: theme.border,
          }}
        >
          <h3 className="mb-6 font-bold" style={{ color: theme.text }}>Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`rgb(${theme.c1})`} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={`rgb(${theme.c1})`} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.textMuted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.mode === 'light' ? '#fff' : '#081812',
                    borderColor: theme.border,
                    borderRadius: 12,
                    color: theme.text,
                  }}
                  itemStyle={{ color: `rgb(${theme.c1})` }}
                />
                <Area type="monotone" dataKey="total" stroke={`rgb(${theme.c1})`} strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Enrollments Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border p-5 lg:col-span-3"
          style={{
            background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.4)',
            backdropFilter: "blur(10px)",
            borderColor: theme.border,
          }}
        >
          <h3 className="mb-6 font-bold" style={{ color: theme.text }}>Enrollment Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentsData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: theme.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: theme.mode === 'light' ? '#fff' : '#081812',
                    borderColor: theme.border,
                    borderRadius: 12,
                    color: theme.text,
                  }}
                />
                <Bar dataKey="count" fill={`rgb(${theme.c2})`} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Mini Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between rounded-2xl border p-5"
          style={{ background: theme.glass, borderColor: theme.border }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
              <Activity className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-bold" style={{ color: theme.text }}>Pending Reviews</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>{pendingApps} applications</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: theme.textMuted }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between rounded-2xl border p-5"
          style={{ background: theme.glass, borderColor: theme.border }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(56, 189, 248, 0.1)" }}>
              <GraduationCap className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <p className="font-bold" style={{ color: theme.text }}>Active Programs</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>{stats.activePrograms} published</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: theme.textMuted }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between rounded-2xl border p-5"
          style={{ background: theme.glass, borderColor: theme.border }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(167, 139, 250, 0.1)" }}>
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="font-bold" style={{ color: theme.text }}>Team Members</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>{stats.totalEmployees} active</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: theme.textMuted }} />
        </motion.div>
      </div>
    </div>
  );
}
