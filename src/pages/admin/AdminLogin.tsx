import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertCircle } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      sessionStorage.setItem("login_intent", "admin");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background blobs */}
      <div
        className="blob pointer-events-none absolute -left-20 top-20 h-[300px] w-[300px] rounded-full opacity-20 blur-3xl"
        style={{ background: `rgb(${theme.c1})` }}
      />
      <div
        className="blob pointer-events-none absolute -right-20 bottom-20 h-[300px] w-[300px] rounded-full opacity-15 blur-3xl"
        style={{ background: `rgb(${theme.c2})`, animationDelay: "-4s" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl"
        style={{
          background: theme.glass,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -10px ${theme.glow}`,
        }}
      >
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: grad, boxShadow: `0 8px 32px -8px ${theme.glow}` }}
          >
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
          >
            Admin Portal
          </h1>
          <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            Secure access restricted to authorized personnel only.
          </p>
        </div>



          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
              style={{ background: grad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.hash = "#home"}
            className="text-xs transition hover:opacity-80"
            style={{ color: theme.textMuted }}
          >
            &larr; Return to Website
          </button>
        </div>
      </motion.div>
    </div>
  );
}
