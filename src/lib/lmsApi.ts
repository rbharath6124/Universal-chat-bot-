import { supabase } from "./supabase";
import { Program, getPrograms } from "./programsApi";

export interface LMSLesson {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string;
  google_drive_file_id: string;
  duration: string;
  order_index: number;
  is_preview: boolean;
  created_at: string;
}

export interface LMSModule {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface LMSProgress {
  id: string;
  user_id?: string;
  lesson_id: string;
  progress: number;
  completed: boolean;
  updated_at: string;
}

// Re-use Program as LMSCourse
export type LMSCourse = Program;

export async function getLMSCourses(): Promise<LMSCourse[]> {
  const programs = await getPrograms();
  return programs.filter(p => p.status === "published");
}

export async function getLMSCourseBySlug(slug: string): Promise<LMSCourse | null> {
  const courses = await getLMSCourses();
  return courses.find(c => c.slug === slug || c.id === slug) || null;
}

export async function getLMSModules(courseId?: string): Promise<LMSModule[]> {
  let query = supabase.from("lms_modules").select("*").order("order_index", { ascending: true });
  if (courseId) {
    query = query.eq("course_id", courseId);
  }
  const { data } = await query;
  return data as LMSModule[] || [];
}

export async function getLMSModuleBySlug(courseSlug: string, moduleSlug: string): Promise<LMSModule | null> {
  const course = await getLMSCourseBySlug(courseSlug);
  if (!course) return null;
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleSlug);
  const queryField = isId ? "id" : "slug";
  const { data } = await supabase.from("lms_modules").select("*").eq("course_id", course.id).eq(queryField, moduleSlug).single();
  return data as LMSModule || null;
}

export async function getLMSModuleByIdentifier(identifier: string): Promise<LMSModule | null> {
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const queryField = isId ? "id" : "slug";
  const { data } = await supabase.from("lms_modules").select("*").eq(queryField, identifier).limit(1);
  return data?.[0] as LMSModule || null;
}

export async function getLMSLessons(courseId?: string): Promise<LMSLesson[]> {
  let query = supabase.from("lms_lessons").select("*").order("order_index", { ascending: true });
  if (courseId) {
    query = query.eq("course_id", courseId);
  }
  const { data } = await query;
  return data as LMSLesson[] || [];
}

export async function getLMSLessonBySlug(courseSlug: string, lessonSlug: string, moduleSlug?: string): Promise<LMSLesson | null> {
  const course = await getLMSCourseBySlug(courseSlug);
  if (!course) return null;
  
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonSlug);
  const queryField = isId ? "id" : "slug";
  let query = supabase.from("lms_lessons").select("*").eq("course_id", course.id).eq(queryField, lessonSlug);
  if (moduleSlug) {
    const module = await getLMSModuleBySlug(courseSlug, moduleSlug);
    if (module) {
      query = query.eq("module_id", module.id);
    } else {
      return null;
    }
  }
  const { data } = await query.limit(1);
  return data?.[0] as LMSLesson || null;
}

export async function getLMSLessonByIdentifier(identifier: string): Promise<LMSLesson | null> {
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const queryField = isId ? "id" : "slug";
  const { data } = await supabase.from("lms_lessons").select("*").eq(queryField, identifier).limit(1);
  return data?.[0] as LMSLesson || null;
}

export async function getLMSProgress(): Promise<LMSProgress[]> {
  // Temporary MVP: no auth, so return everything or we could use local storage JUST for user progress MVP.
  // Actually, user said NO local storage.
  const { data } = await supabase.from("lms_progress").select("*");
  return data as LMSProgress[] || [];
}

export async function saveLMSProgress(lesson_id: string, progress: number) {
  const completed = progress >= 90;
  // Upsert without user_id for MVP
  await supabase.from("lms_progress").upsert({
    lesson_id,
    progress,
    completed,
    updated_at: new Date().toISOString()
  }, { onConflict: "lesson_id" });
}

export async function addModule(course_id: string, title: string, description: string = "") {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: existing } = await supabase.from("lms_modules").select("id").eq("course_id", course_id);
  const order_index = (existing?.length || 0) + 1;
  
  const { data } = await supabase.from("lms_modules").insert({
    course_id,
    title,
    slug,
    description,
    order_index
  }).select().single();
  return data as LMSModule;
}

export async function updateModule(id: string, updates: Partial<LMSModule>) {
  if (updates.title) {
    updates.slug = updates.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  await supabase.from("lms_modules").update(updates).eq("id", id);
}

export async function deleteModule(id: string) {
  await supabase.from("lms_modules").delete().eq("id", id);
}

export async function addLesson(course_id: string, module_id: string, title: string, description: string = "") {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: existing } = await supabase.from("lms_lessons").select("id").eq("module_id", module_id);
  const order_index = (existing?.length || 0) + 1;
  
  const { data } = await supabase.from("lms_lessons").insert({
    course_id,
    module_id,
    title,
    slug,
    description,
    order_index,
    duration: "10 min"
  }).select().single();
  return data as LMSLesson;
}

export async function updateLesson(id: string, updates: Partial<LMSLesson>) {
  const secretUpdates: any = {};
  if ("google_drive_file_id" in updates) {
    secretUpdates.google_drive_file_id = updates.google_drive_file_id;
    delete updates.google_drive_file_id;
  }

  if (updates.title) {
    updates.slug = updates.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("lms_lessons").update(updates).eq("id", id);
  }

  if (secretUpdates.google_drive_file_id !== undefined) {
    await supabase.from("lesson_secrets").upsert({
      lesson_id: id,
      google_drive_file_id: secretUpdates.google_drive_file_id
    }, { onConflict: "lesson_id" });
  }
}

export async function getLessonSecret(lessonId: string): Promise<string> {
  const { data } = await supabase.from("lesson_secrets").select("google_drive_file_id").eq("lesson_id", lessonId).single();
  return data?.google_drive_file_id || "";
}

export async function deleteLesson(id: string) {
  await supabase.from("lms_lessons").delete().eq("id", id);
}

export function extractGoogleDriveFileId(url: string) {
  if (!url) return null;
  const trimmed = url.trim();
  
  // Match /d/ID
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD) return matchD[1];
  
  // Match id=ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];

  // Match /uc?id=ID or /view?id=ID
  const matchUc = trimmed.match(/\/uc\?.*?id=([a-zA-Z0-9_-]+)/);
  if (matchUc) return matchUc[1];

  // Match folders (even though they are folders, extract the ID)
  const matchFolder = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];
  
  // If it's already just an ID (alphanumeric + dashes + underscores, usually 25-35 chars)
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

export function generateGoogleDrivePreviewUrl(fileId: string) {
  if (!fileId) return "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export async function requestSecureVideo(lessonId: string) {
  const { data, error } = await supabase
    .from("lesson_secrets")
    .select("google_drive_file_id")
    .eq("lesson_id", lessonId)
    .single();

  if (error || !data?.google_drive_file_id) {
    throw new Error("This lesson does not have a valid secure video source configured.");
  }

  const fileId = extractGoogleDriveFileId(data.google_drive_file_id);
  if (!fileId) {
    throw new Error("The secure video source configured is not a valid Google Drive link.");
  }

  return {
    lessonId,
    embedUrl: generateGoogleDrivePreviewUrl(fileId),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}
