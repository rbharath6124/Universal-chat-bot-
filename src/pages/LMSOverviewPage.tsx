import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Sparkles, Trophy, Clock3, LogOut } from "lucide-react";
import { useRouter } from "../RouterContext";
import { getLMSCourses, getLMSLessons, getLMSProgress, LMSCourse, LMSLesson, LMSProgress } from "../lib/lmsApi";
import LMSLoginGuard from "../components/LMSLoginGuard";
import { useAuth } from "../AuthContext";

export default function LMSOverviewPage() {
  const { navigate } = useRouter();
  const { signOut, purchasedCourseIds } = useAuth();
  
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [progress, setProgress] = useState<LMSProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allCourses, allLessons, allProgress] = await Promise.all([
        getLMSCourses(),
        getLMSLessons(),
        getLMSProgress()
      ]);
      setCourses(allCourses.filter(c => purchasedCourseIds.includes(c.id)));
      setLessons(allLessons);
      setProgress(allProgress);
      setLoading(false);
    }
    load();
  }, [purchasedCourseIds]);

  if (loading) {
    return <main className="min-h-screen px-4 pb-24 pt-24 text-zinc-100 flex justify-center">Loading LMS...</main>;
  }

  return (
    <LMSLoginGuard>
      <main className="min-h-screen px-4 pb-24 pt-24 text-zinc-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="lms-pro-card rounded-3xl p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="lms-pro-gradient-text text-4xl font-black tracking-tight md:text-5xl">
                Premium learning. Secure delivery. Enterprise flow.
              </h1>
              <p className="max-w-2xl lms-text-secondary">
                A dynamic learning portal built into the current platform with secure lesson access, progress tracking, certificates, and premium cinematic UI.
              </p>
              <div className="pt-2">
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
            <div className="lms-pro-glass-pill grid gap-3 rounded-3xl p-5 text-sm lms-text-secondary md:min-w-[320px]">
              <div className="flex items-center justify-between"><span>Active courses</span><strong className="lms-text-primary">{courses.length}</strong></div>
              <div className="flex items-center justify-between"><span>Lessons</span><strong className="lms-text-primary">{lessons.length}</strong></div>
              <div className="flex items-center justify-between"><span>Progress records</span><strong className="lms-text-primary">{progress.length}</strong></div>
              <div className="flex items-center justify-between"><span>Purchased access</span><strong className="lms-text-primary">{purchasedCourseIds.length}</strong></div>
            </div>
          </div>
        </motion.div>
        {purchasedCourseIds.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card flex flex-col items-center justify-center rounded-3xl p-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-2xl font-bold lms-text-primary">No Courses Purchased Yet</h2>
            <p className="mb-8 max-w-md lms-text-secondary">
              It looks like you haven't enrolled in any programs or your payment hasn't been processed yet. Browse our programs and enroll to get access to the LMS portal!
            </p>
            <button
              onClick={() => navigate("programs")}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-3 font-semibold text-zinc-950 transition hover:brightness-110 shadow-lg shadow-cyan-500/20"
            >
              Browse Programs
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="lms-pro-glow-icon h-5 w-5 lms-text-accent" />
              <h2 className="text-xl font-semibold lms-text-primary">Continue learning</h2>
            </div>
            <div className="grid gap-4">
              {courses.slice(0, 3).map((course) => {
                const courseProgress = progress.find(p => p.lesson_id.startsWith(course.id))?.progress || 0;
                return (
                  <button key={course.id} onClick={() => navigate(`learn/course/${course.slug || course.id}`)} className="lms-pro-card lms-pro-card-hover flex w-full flex-col gap-3 rounded-2xl p-4 text-left">
                    <div className="flex w-full items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold lms-text-primary">{course.title}</h3>
                      <span className="lms-pro-glass-pill rounded-full px-3 py-1 text-xs lms-text-secondary">{course.level}</span>
                    </div>
                    <p className="text-sm lms-text-secondary">{course.tagline}</p>
                    {courseProgress > 0 && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full lms-bg-accent">
                        <div className="lms-pro-progress-bar h-full rounded-full" style={{ width: `${courseProgress}%` }} />
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs lms-text-secondary">
                      <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {course.rating} rating</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="lms-pro-glow-icon h-5 w-5 text-teal-400" />
              <h2 className="text-xl font-semibold lms-text-primary">Security & delivery</h2>
            </div>
            <ul className="space-y-4 text-sm lms-text-secondary">
              <li className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> Encrypted video playback abstraction with obfuscated lesson endpoints.</li>
              <li className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> Right-click, download, and screen capture protections on the lesson player.</li>
              <li className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> Secure session validation and access token enforcement for every lesson.</li>
              <li className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> Dynamic course progression stored locally for seamless continuation.</li>
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card rounded-3xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="lms-pro-glow-icon h-5 w-5 lms-text-accent" />
              <h2 className="text-xl font-semibold lms-text-primary">Course catalog</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <button key={course.id} onClick={() => navigate(`learn/course/${course.slug || course.id}`)} className="lms-pro-card lms-pro-card-hover flex w-full flex-col rounded-3xl p-6 text-left">
                <div className="flex w-full items-center justify-between">
                  <span className="lms-pro-glass-pill rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] lms-text-secondary">{course.level}</span>
                  <span className="text-sm font-medium text-teal-400">₹{course.price}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold lms-text-primary">{course.title}</h3>
                <p className="mt-2 text-sm lms-text-secondary">{course.tagline}</p>
              </button>
            ))}
          </div>
            </motion.div>
          </>
        )}
      </section>
      </main>
    </LMSLoginGuard>
  );
}
