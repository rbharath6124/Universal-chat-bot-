import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useRouter } from "../../RouterContext";
import { getLMSCourses, getLMSLessons, getLMSModules, LMSCourse, LMSModule, LMSLesson } from "../../lib/lmsApi";

export default function AdminLMS() {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [lmsCourses, setLMSCourses] = useState<LMSCourse[]>([]);
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, m, l] = await Promise.all([
        getLMSCourses(),
        getLMSModules(),
        getLMSLessons()
      ]);
      setLMSCourses(c);
      setModules(m);
      setLessons(l);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading LMS Data...</div>;
  }

  return (
    <section className="space-y-6 text-zinc-100">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border p-6" style={{ background: "rgba(8,24,18,0.78)", borderColor: theme.border }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">LMS Control Center</p>
            <h1 className="mt-2 text-3xl font-black" style={{ color: theme.text }}>Admin LMS portal</h1>
            <p className="mt-3 max-w-2xl text-zinc-300">Courses created in the admin panel are automatically synced into the public LMS catalog, lesson player, and student dashboard. No manual hardcoding is required.</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Secure, dynamic, and production-ready LMS orchestration</div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { label: "Published courses", value: lmsCourses.length, icon: GraduationCap },
          { label: "LMS modules", value: modules.length, icon: BookOpen },
          { label: "Secure lessons", value: lessons.length, icon: Shield },
        ].map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-3xl border p-5" style={{ background: "rgba(8,24,18,0.78)", borderColor: theme.border }}>
            <item.icon className="h-5 w-5 text-cyan-300" />
            <p className="mt-4 text-sm text-zinc-300">{item.label}</p>
            <p className="mt-2 text-3xl font-black" style={{ color: theme.text }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border p-6" style={{ background: "rgba(8,24,18,0.78)", borderColor: theme.border }}>
        <div className="mb-4 flex items-center gap-2 text-cyan-200"><Sparkles className="h-5 w-5" /> Synced LMS catalog</div>
        <div className="grid gap-4 md:grid-cols-2">
          {lmsCourses.map((course) => (
            <button key={course.id} onClick={() => navigate(`admin/lms/course/${course.slug || course.id}`)} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-cyan-400/40 hover:bg-white/8">
              <h2 className="text-xl font-semibold text-white">{course.title}</h2>
              <p className="mt-2 text-sm text-zinc-300">{course.tagline}</p>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-400"><span>Publish status</span><span>{course.status}</span></div>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
