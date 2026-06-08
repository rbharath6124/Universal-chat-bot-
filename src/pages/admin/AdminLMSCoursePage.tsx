import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowLeft, BookOpen, Layers3, Save, Shield, Video } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useRouter } from "../../RouterContext";
import { addLesson, addModule, extractGoogleDriveFileId, getLMSCourseBySlug, getLMSLessons, getLMSModules, updateLesson, getLessonSecret, LMSCourse, LMSModule, LMSLesson } from "../../lib/lmsApi";
import { supabase } from "../../lib/supabase";

export default function AdminLMSCoursePage({ slug }: { slug: string }) {
  const { theme } = useTheme();
  const { navigate } = useRouter();
  
  const [course, setCourse] = useState<LMSCourse | null>(null);
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [lessons, setLessons] = useState<LMSLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const syncRan = useRef(false);

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    google_drive_input: "",
    is_preview: false,
  });
  
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  const [grantEmail, setGrantEmail] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState({ type: "", text: "" });
  const [grantedStudents, setGrantedStudents] = useState<any[]>([]);

  const fetchGrantedStudents = async () => {
    if (!course) return;
    try {
      const { data, error } = await supabase
        .from("lms_purchases")
        .select("*")
        .eq("course_id", course.id)
        .order("purchased_at", { ascending: false });
      
      if (error) throw error;
      setGrantedStudents(data || []);
    } catch (err) {
      console.error("Error fetching granted students:", err);
    }
  };

  useEffect(() => {
    async function load() {
      const c = await getLMSCourseBySlug(slug);
      if (c) {
        setCourse(c);
        let [m, l] = await Promise.all([
          getLMSModules(c.id),
          getLMSLessons(c.id)
        ]);

        // Auto-sync curriculum from program to LMS modules and lessons
        if (c.modules && Array.isArray(c.modules) && !syncRan.current) {
          syncRan.current = true;
          for (let i = 0; i < c.modules.length; i++) {
            const programMod = c.modules[i];
            let lmsMod = m.find((x) => x.title === programMod.title);
            
            if (!lmsMod) {
              lmsMod = await addModule(c.id, programMod.title, `Duration: ${programMod.duration || "N/A"}`);
              m.push(lmsMod);
            }
            
            if (programMod.topics && Array.isArray(programMod.topics)) {
              for (const topic of programMod.topics) {
                const existingLesson = l.find(x => x.module_id === lmsMod!.id && x.title === topic);
                if (!existingLesson) {
                  const newLesson = await addLesson(c.id, lmsMod!.id, topic, "Synced from program curriculum.");
                  l.push(newLesson);
                }
              }
            }
          }
        }

        setModules(m);
        setLessons(l);
        if (m.length > 0) setSelectedModuleId(m[0].id);
        if (l.length > 0) {
          setSelectedLessonId(l[0].id);
          const secret = await getLessonSecret(l[0].id);
          setForm({
            title: l[0].title,
            description: l[0].description || "",
            duration: l[0].duration || "",
            google_drive_input: secret || "",
            is_preview: l[0].is_preview || false,
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (course) fetchGrantedStudents();
  }, [course?.id]);

  const handleGrantAccess = async () => {
    if (!course || !grantEmail) return;
    setIsGranting(true);
    setGrantMessage({ type: "", text: "" });
    try {
      if (!grantEmail.includes("@")) throw new Error("Invalid email address.");
      
      const { error } = await supabase.from("lms_purchases").upsert({
        course_id: course.id,
        email: grantEmail,
      }, { onConflict: "course_id,email" });
      
      if (error) throw error;
      setGrantMessage({ type: "success", text: `Access granted to ${grantEmail}` });
      setGrantEmail("");
      fetchGrantedStudents();
    } catch (err: any) {
      setGrantMessage({ type: "error", text: err.message });
    } finally {
      setIsGranting(false);
    }
  };

  const selectedModule = useMemo(() => modules.find((m) => m.id === selectedModuleId) || modules[0], [modules, selectedModuleId]);
  const selectedLesson = useMemo(() => lessons.find((l) => l.id === selectedLessonId) || lessons[0], [lessons, selectedLessonId]);

  if (loading) return <main className="p-8 text-zinc-100">Loading...</main>;
  if (!course) return <main className="p-8 text-zinc-100">Course not found.</main>;

  const moduleLessons = lessons.filter((lesson) => lesson.module_id === (selectedModule?.id || ""));

  const handleAddModule = async () => {
    const title = prompt("Module title", `New module for ${course.title}`);
    if (!title) return;
    const created = await addModule(course.id, title, "Dynamic module created from admin LMS panel.");
    setModules([...modules, created]);
    setSelectedModuleId(created.id);
  };

  const handleAddLesson = async () => {
    if (!selectedModule) return;
    const title = prompt("Lesson title", `New lesson in ${selectedModule.title}`);
    if (!title) return;
    const created = await addLesson(course.id, selectedModule.id, title, "Dynamic lesson synced directly to the LMS.");
    setLessons([...lessons, created]);
    setSelectedLessonId(created.id);
    const secret = await getLessonSecret(created.id);
    setForm({
      title: created.title,
      description: created.description,
      duration: created.duration,
      google_drive_input: secret,
      is_preview: created.is_preview,
    });
  };

  const handleSaveLesson = async () => {
    if (!selectedLesson || !course) return;
    const fileId = extractGoogleDriveFileId(form.google_drive_input);
    if (!fileId) {
      alert("Invalid link! You must paste a Google Drive link or a valid File ID. YouTube links are not supported.");
      return;
    }

    setIsSavingLesson(true);
    try {
      await updateLesson(selectedLesson.id, {
        title: form.title || selectedLesson.title,
        description: form.description || selectedLesson.description,
        duration: form.duration || selectedLesson.duration,
        google_drive_file_id: fileId,
        is_preview: form.is_preview,
      });
      alert("Lesson updated securely.");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSavingLesson(false);
    }
  };

  return (
    <section className="space-y-6 text-zinc-100 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("admin/lms")} className="rounded-full bg-white/5 p-2 transition hover:bg-white/10 text-zinc-400">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{course.title} <span className="text-zinc-500 font-normal">LMS Sync</span></h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers3 className="h-4 w-4" /> Modules
            </h2>
            <button onClick={handleAddModule} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition">+ Add</button>
          </div>
          <div className="space-y-2">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition ${selectedModuleId === module.id ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100" : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"}`}
              >
                {module.title}
              </button>
            ))}
            {modules.length === 0 && <p className="text-xs text-zinc-500 italic">No modules created yet.</p>}
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Lessons
            </h2>
            {selectedModule && <button onClick={handleAddLesson} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition">+ Add</button>}
          </div>
          <div className="space-y-2">
            {moduleLessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={async () => {
                  setSelectedLessonId(lesson.id);
                  setForm({
                    title: lesson.title,
                    description: lesson.description || "",
                    duration: lesson.duration || "",
                    google_drive_input: "Loading...",
                    is_preview: lesson.is_preview || false,
                  });
                  const secret = await getLessonSecret(lesson.id);
                  setForm(prev => ({ ...prev, google_drive_input: secret }));
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition ${selectedLessonId === lesson.id ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100" : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"}`}
              >
                {lesson.title}
              </button>
            ))}
            {moduleLessons.length === 0 && selectedModule && <p className="text-xs text-zinc-500 italic">No lessons in this module.</p>}
            {!selectedModule && <p className="text-xs text-zinc-500 italic">Select a module first.</p>}
          </div>
        </div>

        <div className="space-y-6">
          {selectedLesson ? (
            <div className="rounded-2xl border p-6 space-y-6" style={{ background: "rgba(8,24,18,0.78)", borderColor: theme.border }}>
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Lesson Configuration</h3>
                  <p className="text-xs text-zinc-400">Link secure video content for LMS playback.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Lesson Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-cyan-500 focus:outline-none" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Duration (e.g. 15 min)</label>
                    <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview Available</label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition">
                      <input type="checkbox" checked={form.is_preview} onChange={e => setForm({ ...form, is_preview: e.target.checked })} className="rounded bg-black border-zinc-700 text-cyan-500 focus:ring-cyan-500 h-4 w-4" />
                      <span className="text-sm text-zinc-300">Allow public preview</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    <Shield className="h-4 w-4" /> Secure Video Source (Google Drive)
                  </label>
                  <p className="mb-3 text-xs text-zinc-400">Paste the Google Drive sharing link. The LMS will automatically extract the ID and generate signed, expiring URLs for playback to prevent unauthorized downloads.</p>
                  <input type="text" placeholder="https://drive.google.com/file/d/..." value={form.google_drive_input} onChange={e => setForm({ ...form, google_drive_input: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </div>

                <button onClick={handleSaveLesson} disabled={isSavingLesson} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {isSavingLesson ? "Saving & Securing..." : "Save Lesson Configuration"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-sm text-zinc-500">Select or create a lesson to configure its content.</p>
            </div>
          )}

          {/* Grant Access Section */}
          <div className="rounded-2xl border p-6 space-y-6" style={{ background: "rgba(8,24,18,0.78)", borderColor: theme.border }}>
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Grant Access</h3>
                <p className="text-xs text-zinc-400">Provide an email to grant exclusive access to this course.</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Student Email Address</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={handleGrantAccess}
                  disabled={isGranting || !grantEmail}
                  className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {isGranting ? "Granting..." : "Grant Access"}
                </button>
              </div>
              {grantMessage.text && (
                <p className={`mt-2 text-xs font-semibold ${grantMessage.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
                  {grantMessage.text}
                </p>
              )}
            </div>

            {grantedStudents.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Currently Granted Users</h4>
                <div className="max-h-[200px] overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-2 space-y-1">
                  {grantedStudents.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
                      <span>{s.email}</span>
                      <span className="text-xs text-zinc-500">{new Date(s.purchased_at || s.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
