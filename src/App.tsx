import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { RouterProvider, useRouter } from "./RouterContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import CustomCursor from "./components/CustomCursor";
import LoadingScreen from "./components/LoadingScreen";
import HomePage from "./pages/HomePage";
import ProgramsPage from "./pages/ProgramsPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import PlacementsPage from "./pages/PlacementsPage";
import LMSOverviewPage from "./pages/LMSOverviewPage";
import LMSCoursePage from "./pages/LMSCoursePage";
import LMSModulePage from "./pages/LMSModulePage";
import LMSLessonPage from "./pages/LMSLessonPage";
import CampusAmbassadorPage from "./pages/CampusAmbassadorPage";
import AdminLayout from "./pages/admin/AdminLayout";

function AppContent() {
  const { route } = useRouter();

  if (route.startsWith("admin")) {
    return (
      <div className="relative min-h-screen text-zinc-100">
        <AdminLayout />
      </div>
    );
  }

  let content;
  if (route === "programs" || route.startsWith("domains/")) {
    const parts = route.split("/");
    content = <ProgramsPage initialMainDomain={parts[1]} initialSubdomain={parts[2]} />;
  } else if (route === "learn") {
    content = <LMSOverviewPage />;
  } else if (route.startsWith("learn/course/")) {
    const path = route.replace("learn/course/", "");
    const parts = path.split("/");
    if (parts.length >= 3 && parts[1] === "module") {
      content = <LMSModulePage courseSlug={parts[0]} moduleSlug={parts[2]} />;
    } else if (parts.length >= 3 && parts[1] === "lesson") {
      content = <LMSLessonPage courseSlug={parts[0]} lessonSlug={parts[2]} />;
    } else {
      content = <LMSCoursePage slug={parts[0]} />;
    }
  } else if (route.startsWith("learn/module/")) {
    const parts = route.replace("learn/module/", "").split("/");
    if (parts.length === 1) {
      content = <LMSModulePage moduleSlug={parts[0]} />;
    } else {
      const [courseSlug, moduleSlug] = parts;
      content = <LMSModulePage courseSlug={courseSlug} moduleSlug={moduleSlug} />;
    }
  } else if (route.startsWith("learn/lesson/")) {
    const parts = route.replace("learn/lesson/", "").split("/");
    if (parts.length === 1) {
      content = <LMSLessonPage lessonSlug={parts[0]} />;
    } else {
      const [courseSlug, lessonSlug] = parts;
      content = <LMSLessonPage courseSlug={courseSlug} lessonSlug={lessonSlug} />;
    }
  } else if (route.startsWith("course-")) {
    const courseId = route.replace("course-", "");
    content = <CourseDetailPage courseId={courseId} />;
  } else if (route === "placements" || route === "job-portal" || route === "careers" || route === "internships") {
    content = <PlacementsPage />;
  } else if (route === "campus-ambassador") {
    content = <CampusAmbassadorPage />;
  } else {
    content = <HomePage />;
  }

  const { mode, theme } = useTheme();
  const isLMS = route === "learn" || route.startsWith("learn/");
  const lmsBgClass = mode === "light" ? "bg-slate-50 text-slate-900" : "bg-[#050B14] text-zinc-100";

  return (
    <div
      className={`relative min-h-screen ${isLMS ? lmsBgClass : ""} ${mode === 'light' ? 'light-theme' : ''}`}
      style={{
        background: isLMS ? undefined : theme.bg,
        color: theme.text,
      }}
    >
      <SmoothScroll />
      <CustomCursor />
      <LoadingScreen />

      {/* Ambient mesh gradient (marketing pages only) */}
      {!isLMS && (
        <>
          <div className="mesh-gradient" />
          <div className="grid-overlay" />
        </>
      )}

      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: 0.5,
            ease: [0.33, 1, 0.68, 1],
            opacity: { duration: 0.35 },
          }}
          style={{ willChange: "transform, opacity", position: "relative", zIndex: 1 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </div>
  );
}

import { AuthProvider } from "./AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
