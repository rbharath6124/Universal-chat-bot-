import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";

interface LMSLoginGuardProps {
  children: ReactNode;
  requireCourseId?: string; // If passed, checks if the user has purchased this specific course
}

export default function LMSLoginGuard({ children, requireCourseId }: LMSLoginGuardProps) {
  const { user, loading, purchasedCourseIds, signInWithGoogle, signOut } = useAuth();
  const { theme, mode } = useTheme();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: `rgb(${theme.c1})` }} />
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl"
          style={{
            borderColor: theme.border,
            background: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(10,15,25,0.8)",
            backdropFilter: "blur(20px)",
            color: theme.text,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: `rgba(${theme.c1}, 0.15)`, color: `rgb(${theme.c1})` }}
          >
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">LMS Portal Access</h2>
          <p className="mb-8 text-sm" style={{ color: theme.textMuted }}>
            You must be signed in to access your purchased courses and learning materials.
          </p>

          <button
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold text-white transition hover:brightness-110"
            style={{ background: `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))` }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // If they have no purchased courses at all, deny access to the entire LMS portal
  if (purchasedCourseIds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl"
          style={{
            borderColor: theme.border,
            background: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(10,15,25,0.8)",
            backdropFilter: "blur(20px)",
            color: theme.text,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
          >
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
          <p className="mb-8 text-sm" style={{ color: theme.textMuted }}>
            You do not currently have access to any courses. Please join a course to access the LMS portal.
          </p>
          <p className="mb-8 text-xs" style={{ color: theme.textMuted }}>
            Logged in as: <strong>{user.email}</strong>
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("programs")}
              className="w-full rounded-xl py-3 font-semibold text-white transition hover:brightness-110"
              style={{ background: `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))` }}
            >
              Browse Programs
            </button>
            <button
              onClick={signOut}
              className="w-full rounded-xl py-3 font-semibold transition hover:bg-white/5"
              style={{ color: theme.textMuted }}
            >
              Sign out / Use a different account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If a specific course ID is required, check if they own it
  if (requireCourseId && !purchasedCourseIds.includes(requireCourseId)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl"
          style={{
            borderColor: theme.border,
            background: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(10,15,25,0.8)",
            backdropFilter: "blur(20px)",
            color: theme.text,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
          >
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
          <p className="mb-8 text-sm" style={{ color: theme.textMuted }}>
            You have not purchased this course yet. If you just made a payment, please wait a few moments and refresh.
          </p>
          <p className="mb-8 text-xs" style={{ color: theme.textMuted }}>
            Logged in as: <strong>{user.email}</strong>
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("programs")}
              className="w-full rounded-xl py-3 font-semibold text-white transition hover:brightness-110"
              style={{ background: `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))` }}
            >
              Browse Programs
            </button>
            <button
              onClick={signOut}
              className="w-full rounded-xl py-3 font-semibold transition hover:bg-white/5"
              style={{ color: theme.textMuted }}
            >
              Sign out / Use a different account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
