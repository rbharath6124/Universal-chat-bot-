import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock3, Shield, Sparkles } from "lucide-react";
import { useRouter } from "../RouterContext";
import { getLMSLessonByIdentifier, getLMSLessonBySlug, getLMSProgress, requestSecureVideo, saveLMSProgress, LMSLesson, LMSProgress } from "../lib/lmsApi";
import SecureVideoPlayer from "../components/SecureVideoPlayer";
import LMSLoginGuard from "../components/LMSLoginGuard";

export default function LMSLessonPage({ courseSlug, lessonSlug }: { courseSlug?: string; lessonSlug?: string }) {
  const { navigate } = useRouter();
  
  const [lesson, setLesson] = useState<LMSLesson | null>(null);
  const [progressData, setProgressData] = useState<LMSProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [secureEmbedUrl, setSecureEmbedUrl] = useState("");
  const [playbackError, setPlaybackError] = useState("");

  useEffect(() => {
    async function load() {
      const l = courseSlug && lessonSlug ? await getLMSLessonBySlug(courseSlug, lessonSlug) : await getLMSLessonByIdentifier(lessonSlug || "");
      if (l) {
        setLesson(l);
        const p = await getLMSProgress();
        setProgressData(p);
      }
      setIsLoading(false);
    }
    load();
  }, [courseSlug, lessonSlug]);

  const progress = useMemo(() => progressData.find((item) => item.lesson_id === lesson?.id), [progressData, lesson?.id]);

  /* ── Keyboard shortcut blocking for security ── */
  useEffect(() => {
    const shortcutHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && (["s", "p", "u"].includes(key) || (event.shiftKey && ["i", "c", "j"].includes(key)))) {
        event.preventDefault();
      }
      if (event.key === "F12") event.preventDefault();
    };
    const dragHandler = (event: DragEvent) => event.preventDefault();

    window.addEventListener("keydown", shortcutHandler);
    document.addEventListener("dragstart", dragHandler);
    return () => {
      window.removeEventListener("keydown", shortcutHandler);
      document.removeEventListener("dragstart", dragHandler);
    };
  }, []);

  /* ── Secure video request ── */
  useEffect(() => {
    let isCurrent = true;

    if (!lesson?.id) return;

    setIsLoading(true);
    setSecureEmbedUrl("");
    setPlaybackError("");

    requestSecureVideo(lesson.id)
      .then((response) => {
        if (!isCurrent) return;
        setSecureEmbedUrl(response.embedUrl);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setPlaybackError(err instanceof Error ? err.message : "Secure playback initialization failed.");
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [lesson?.id]);

  const handleVideoProgress = useCallback(
    (playedSeconds: number) => {
      if (!lesson?.id) return;
      saveLMSProgress(lesson.id, playedSeconds);
    },
    [lesson?.id]
  );

  const handleVideoComplete = useCallback(() => {
    if (!lesson?.id) return;
    saveLMSProgress(lesson.id, 9999);
  }, [lesson?.id]);

  if (isLoading && !lesson) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100 flex justify-center">Loading Lesson...</main>;
  }

  if (!lesson) {
    return <main className="min-h-screen px-4 py-24 text-zinc-100 flex justify-center">Lesson not found.</main>;
  }

  const savedProgress = Math.round(progress?.progress || 0);

  return (
    <LMSLoginGuard requireCourseId={lesson.course_id}>
      <main className="min-h-screen px-4 pb-24 pt-24 text-zinc-100">
        <section className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card rounded-3xl p-4">
            <button onClick={() => navigate(courseSlug ? `learn/course/${courseSlug}` : "learn")} className="mb-4 inline-flex items-center gap-2 px-2 text-sm font-medium lms-text-secondary transition-colors hover:lms-text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to modules
            </button>
            <div className="rounded-2xl border border-white/5 bg-black p-2 shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)]">
              <SecureVideoPlayer
                embedUrl={secureEmbedUrl}
                lessonId={lesson.id}
                lessonDuration={lesson.duration}
                isLoading={isLoading}
                playbackError={playbackError}
                onProgress={handleVideoProgress}
                onReady={handleVideoComplete}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lms-pro-card rounded-3xl p-8">
            <h1 className="lms-pro-gradient-text text-3xl font-black">{lesson.title}</h1>
            <p className="mt-4 lms-text-secondary">{lesson.description}</p>
            
            <div className="mt-8 space-y-4 text-sm lms-text-secondary">
              <div className="lms-pro-glass-pill flex items-start gap-4 rounded-2xl p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 lms-text-accent" />
                <div>
                  <strong className="block lms-text-primary">Duration</strong>
                  <span className="lms-text-secondary">{lesson.duration}</span>
                </div>
              </div>
              
              <div className="lms-pro-glass-pill flex items-start gap-4 rounded-2xl p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 lms-text-accent" />
                <div className="w-full">
                  <strong className="block lms-text-primary">Current Progress</strong>
                  <span className="lms-text-secondary">Saved automatically</span>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 w-full overflow-hidden rounded-full lms-bg-accent">
                      <div className="lms-pro-progress-bar h-full rounded-full transition-all duration-300" style={{ width: `${savedProgress}%` }} />
                    </div>
                    <span className="min-w-[3ch] text-xs font-bold lms-text-primary">{savedProgress}%</span>
                  </div>
                </div>
              </div>

              <div className="lms-pro-glass-pill flex items-start gap-4 rounded-2xl p-4">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                <div>
                  <strong className="block lms-text-primary">Secure Delivery</strong>
                  <span className="lms-text-secondary">Validation and anti-link-sharing checks are active. All content is served through encrypted sessions.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </LMSLoginGuard>
  );
}
