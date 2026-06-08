import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, Briefcase,
  FileText, Settings, BookOpen, Menu, LogOut
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useRouter } from "../../RouterContext";
import { ACCESS_LABELS, getAdminUser, logoutAdmin, AdminUser } from "../../adminStore";
import { supabase } from "../../lib/supabase";
import AdminLogin from "./AdminLogin";

// Import Admin Pages (We will create these next)
import AdminDashboard from "./AdminDashboard";
import AdminStudents from "./AdminStudents";
import AdminEmployees from "./AdminEmployees";
import AdminPrograms from "./AdminPrograms";
import AdminLMS from "./AdminLMS";
import AdminLMSCoursePage from "./AdminLMSCoursePage";
import AdminSettings from "./AdminSettings";
import AdminPlacementsPage from "../AdminPlacementsPage";
import AdminApplications from "./AdminApplications";
import AdminAmbassadors from "./AdminAmbassadors";

const NAV_ITEMS = [
  { id: "admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "admin/students", label: "Students", icon: Users },
  { id: "admin/employees", label: "Employees", icon: Briefcase },
  { id: "admin/programs", label: "Programs", icon: GraduationCap },
  { id: "admin/lms", label: "LMS", icon: BookOpen },
  { id: "admin/placements", label: "Job Portal", icon: Briefcase },
  { id: "admin/applications", label: "Applications", icon: FileText },
  { id: "admin/ambassadors", label: "Campus Ambassadors", icon: Users },
  { id: "admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { theme } = useTheme();
  const { route, navigate } = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check initial session
    getAdminUser().then(u => {
      setUser(u);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      const u = await getAdminUser();
      setUser(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setUser(null);
    navigate("home");
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-100" style={{ background: theme.bg }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (user.unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center" style={{ background: theme.bg }}>
        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
          style={{
            background: theme.glass,
            backdropFilter: "blur(20px)",
            border: `1px solid ${theme.border}`,
            boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -10px ${theme.glow}`,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            Access Denied
          </h1>
          <p className="mb-8 text-sm" style={{ color: theme.textMuted }}>
            You do not have administrative privileges to access this portal. The email <strong style={{ color: theme.text }}>{user.email}</strong> is not authorized.
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90"
            style={{ background: "rgb(239,68,68)" }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  // Render current page content
  const renderContent = () => {
    switch (route) {
      case "admin/dashboard": return <AdminDashboard />;
      case "admin/students": return <AdminStudents />;
      case "admin/employees": return <AdminEmployees />;
      case "admin/programs": return <AdminPrograms />;
      case "admin/lms":
      case "admin/lms/courses":
      case "admin/lms/modules":
      case "admin/lms/lessons": return <AdminLMS />;
      case "admin/placements": return <AdminPlacementsPage isAdminLayout />;
      case "admin/applications": return <AdminApplications />;
      case "admin/ambassadors": return <AdminAmbassadors />;
      case "admin/settings": return <AdminSettings />;
      default: {
        if (route.startsWith("admin/lms/course/")) {
          const slug = route.replace("admin/lms/course/", "");
          return <AdminLMSCoursePage slug={slug} />;
        }
        return <AdminDashboard />;
      }
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: grad, boxShadow: `0 0 20px -5px ${theme.glow}` }}
        >
          <span className="font-bold text-white">A</span>
        </div>
        <div>
          <h2 className="font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
            Asscendro Admin
          </h2>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: `rgb(${theme.c1})` }}>
            Enterprise Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = route === item.id || (route === "admin" && item.id === "admin/dashboard");
          return (
            <button
              key={item.id}
              onClick={() => { navigate(item.id); setMobileMenuOpen(false); }}
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
              style={{
                color: isActive ? theme.text : theme.textMuted,
                background: isActive ? `rgba(${theme.c1},0.15)` : "transparent",
                border: isActive ? `1px solid rgba(${theme.c1},0.3)` : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className="h-4 w-4 transition-transform group-hover:scale-110"
                  style={{ color: isActive ? `rgb(${theme.c1})` : "inherit" }}
                />
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="sidebar-active" className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${theme.c1})`, boxShadow: `0 0 10px ${theme.glow}` }} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t pt-4" style={{ borderColor: theme.border }}>
        <div className="mb-4 px-2">
          <p className="truncate text-xs font-semibold" style={{ color: theme.text }}>{user.email}</p>
          <p className="text-[10px]" style={{ color: theme.textMuted }}>
            {user.role} - {ACCESS_LABELS[user.accessLevel]}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Secure Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020806]" style={{ background: theme.mode === 'light' ? '#f8fafc' : '#020806' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden w-64 flex-shrink-0 flex-col border-r lg:flex"
        style={{
          background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.6)',
          backdropFilter: "blur(20px)",
          borderColor: theme.border,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r shadow-2xl lg:hidden"
              style={{
                background: theme.mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(8,24,18,0.95)',
                backdropFilter: "blur(20px)",
                borderColor: theme.border,
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header
          className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{
            background: theme.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(8,24,18,0.6)',
            backdropFilter: "blur(10px)",
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: grad }}>
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="font-bold" style={{ color: theme.text }}>Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/5"
          >
            <Menu className="h-5 w-5" style={{ color: theme.text }} />
          </button>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-7xl"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
