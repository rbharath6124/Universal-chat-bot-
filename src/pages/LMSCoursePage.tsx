import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Clock3, Shield, Sparkles } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import { getLMSCourseBySlug, getLMSLessons, getLMSModules, LMSCourse, LMSLesson, LMSModule } from "../lib/lmsApi";
import LMSLoginGuard from "../components/LMSLoginGuard";

export default function LMSCoursePage({ slug }: { slug: string }) {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [course, setCourse] = useState<LMSCourse | null>(null);
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await getLMSCourseBySlug(slug);
      if (c) {
        setCourse(c);
        const [m, l] = await Promise.all([
          getLMSModules(c.id),
          getLMSLessons(c.id)
        ]);
        setModules(m);
        setLessons(l);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100 flex justify-center">Loading Course...</main>;
  }

  if (!course) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100 flex justify-center">Course not found.</main>;
  }

  return (
    <LMSLoginGuard requireCourseId={course.id}>
      <main className="min-h-screen px-4 pb-24 pt-24 text-zinc-100">
        <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border p-6" style={{ background: "rgba(8, 24, 18, 0.78)", borderColor: theme.border }}>
            <button onClick={() => navigate("learn")} className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200"><ArrowLeft className="h-4 w-4" /> Back to LMS</button>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Course overview</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl" style={{ color: theme.text }}>{course.title}</h1>
            <p className="mt-4 text-zinc-300">{course.overview || course.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-zinc-200">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{course.level}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1"><Clock3 className="mr-1 inline h-3.5 w-3.5" /> {course.duration}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> {course.rating} rating</span>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <Shield className="h-4 w-4" /> Secure access validation is enforced before lesson playback.
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border p-6" style={{ background: "rgba(8, 24, 18, 0.78)", borderColor: theme.border }}>
            <div className="mb-4 flex items-center gap-2 text-cyan-200"><BadgeCheck className="h-5 w-5" /> Modules & lessons</div>
            <div className="space-y-4">
              {modules.map((module, idx) => (
                <button key={module.id} onClick={() => navigate(`learn/course/${course.slug || course.id}/module/${module.slug}`)} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-white/8">
                  <div className="flex items-center justify-between"><h2 className="text-lg font-semibold" style={{ color: theme.text }}>{idx + 1}. {module.title}</h2><span className="text-xs uppercase tracking-[0.25em] text-zinc-400">Module</span></div>
                  <p className="mt-2 text-sm text-zinc-300">{module.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{lessons.filter((l) => l.module_id === module.id).slice(0, 2).map((lesson) => <span key={lesson.id} className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">{lesson.title}</span>)}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </LMSLoginGuard>
  );
}
