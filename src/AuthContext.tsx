import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  purchasedCourseIds: string[];
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshPurchases: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  purchasedCourseIds: [],
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshPurchases: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);

  const fetchPurchases = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("lms_purchases")
        .select("course_id")
        .eq("email", email);

      if (error) {
        console.error("Error fetching purchases:", error);
        return;
      }
      
      const courses = data ? data.map(row => row.course_id) : [];
      setPurchasedCourseIds(courses);
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      const isLmsUser = session?.user?.email && session.user.email !== "rbharath0467@gmail.com";
      
      setUser(isLmsUser ? session.user : null);
      if (isLmsUser) {
        fetchPurchases(session!.user!.email!).finally(() => setLoading(false));
      } else {
        setPurchasedCourseIds([]);
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      setUser(session?.user || null);
      if (session?.user) {
        fetchPurchases(session.user.email!);
      } else {
        setPurchasedCourseIds([]);
      }

      if (_event === "SIGNED_IN" && session?.user) {
        setTimeout(() => {
          const intent = sessionStorage.getItem("login_intent");
          if (intent === "admin") {
            window.location.hash = "#admin/dashboard";
          } else if (intent === "lms") {
            window.location.hash = "#learn";
          } else if (window.location.hash.includes("access_token") || window.location.hash === "") {
            window.location.hash = "#learn";
          }
          sessionStorage.removeItem("login_intent");
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    sessionStorage.setItem("login_intent", "lms");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect back to root so Supabase can parse the access token safely
        // Then onAuthStateChange will route to #learn
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshPurchases = async () => {
    if (user?.email) {
      await fetchPurchases(user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, purchasedCourseIds, signInWithGoogle, signOut, refreshPurchases }}>
      {children}
    </AuthContext.Provider>
  );
}
