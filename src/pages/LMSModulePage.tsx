import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import { getLMSModuleByIdentifier, getLMSModuleBySlug, getLMSLessons, LMSModule, LMSLesson } from "../lib/lmsApi";
import LMSLoginGuard from "../components/LMSLoginGuard";

export default function LMSModulePage({ courseSlug, moduleSlug }: { courseSlug?: string; moduleSlug?: string }) {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [module, setModule] = useState<LMSModule | null>(null);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const m = courseSlug && moduleSlug ? await getLMSModuleBySlug(courseSlug, moduleSlug) : await getLMSModuleByIdentifier(moduleSlug || "");
      if (m) {
        setModule(m);
        const l = await getLMSLessons(m.course_id);
        setLessons(l.filter((lesson) => lesson.module_id === m.id));
      }
      setLoading(false);
    }
    load();
  }, [courseSlug, moduleSlug]);

  if (loading) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100 flex justify-center">Loading Module...</main>;
  }

  if (!module) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100">Module not found.</main>;
  }

  return (
    <LMSLoginGuard requireCourseId={module.course_id}>
      <main className="min-h-screen px-4 pb-24 pt-24 text-zinc-100">
        <section className="mx-auto max-w-5xl rounded-3xl border p-6" style={{ background: "rgba(8, 24, 18, 0.78)", borderColor: theme.border }}>
          <button onClick={() => navigate("learn")} className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200"><ArrowLeft className="h-4 w-4" /> Back to learning hub</button>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Learning module</p>
            <h1 className="mt-3 text-3xl font-black" style={{ color: theme.text }}>{module.title}</h1>
            <p className="mt-3 text-zinc-300">{module.description}</p>
          </motion.div>

          <div className="mt-8 space-y-4">
            {lessons.map((lesson, index) => (
              <button key={lesson.id} onClick={() => navigate(`learn/course/${courseSlug}/lesson/${lesson.slug}`)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-white/8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-100">{index + 1}</span>
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: theme.text }}>{lesson.title}</h2>
                      <p className="mt-1 text-sm text-zinc-300">{lesson.description}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">{lesson.duration}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4 text-sm text-cyan-100"><BookOpen className="h-4 w-4" /> Lesson access is validated against your enrolled course and secure session token.</div>
        </section>
      </main>
    </LMSLoginGuard>
  );
}
