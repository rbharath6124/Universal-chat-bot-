import { supabase } from "./lib/supabase";
import type { JobListing, JobApplication } from "./placementsData";

// ─── Job Listings ───────────────────────────────────────────────────

export async function getJobs(): Promise<JobListing[]> {
  const { data } = await supabase
    .from("job_listings")
    .select("*")
    .order("posted_at", { ascending: false });
  return (data || []) as JobListing[];
}

export async function addJob(data: Omit<JobListing, "id">) {
  const { error } = await supabase.from("job_listings").insert([data]);
  if (error) throw error;
}

export async function updateJob(id: string, data: Partial<JobListing>) {
  const { error } = await supabase.from("job_listings").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("job_listings").delete().eq("id", id);
  if (error) throw error;
}

// ─── Job Applications ───────────────────────────────────────────────

export async function getJobApplications(): Promise<JobApplication[]> {
  const { data } = await supabase
    .from("job_applications")
    .select("*, job_listings!inner(*)")
    .order("applied_at", { ascending: false });
    
  return (data || []).map((app: any) => ({
    ...app,
    jobTitle: app.job_listings?.role || "Unknown Role",
    companyName: app.job_listings?.company || "Unknown Company"
  })) as JobApplication[];
}

export async function submitJobApplication(
  data: Omit<JobApplication, "id" | "status" | "appliedAt" | "jobTitle" | "companyName">
) {
  const { error } = await supabase.from("job_applications").insert([{
    job_id: data.jobId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    experience: data.experience,
    linkedin_url: data.linkedinUrl,
    resume_url: data.resumeUrl,
    why_hire: data.whyHire,
    status: "pending"
  }]);
  
  if (error) throw error;
}

export async function updateJobAppStatus(
  id: string,
  status: JobApplication["status"]
) {
  const { error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", id);
    
  if (error) throw error;
}
