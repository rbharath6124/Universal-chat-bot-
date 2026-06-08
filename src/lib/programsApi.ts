import { supabase } from "./supabase";

export interface MainDomain {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Subdomain {
  id: string;
  main_domain_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CourseModule {
  title: string;
  duration: string;
  topics: string[];
}

export interface Mentor {
  name: string;
  role: string;
  company: string;
  color: string;
  initials: string;
  experience: string;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  status: "published" | "draft";
  price: number;
  old_price?: number;
  duration: string;
  enrollments: number;
  rating: string;
  blurb: string;
  level: string;
  color: string;
  tags: string[];
  
  overview: string;
  who_should_enroll: string[];
  what_you_learn: string[];
  tools_covered: string[];
  modules: CourseModule[];
  projects: { title: string; description: string }[];
  mentors: Mentor[];
  certificate: string;
  includes: string[];
  faqs: { q: string; a: string }[];

  main_domain_id: string | null;
  subdomain_id: string | null;
  
  // Relations for joining
  main_domains?: { name: string, slug: string };
  subdomains?: { name: string, slug: string };
}

export async function getMainDomains(): Promise<MainDomain[]> {
  const { data, error } = await supabase
    .from("main_domains")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching main domains:", error);
    return [];
  }
  return data || [];
}

export async function getSubdomains(): Promise<Subdomain[]> {
  const { data, error } = await supabase
    .from("subdomains")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching subdomains:", error);
    return [];
  }
  return data || [];
}

export async function getPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select(`
      *,
      main_domains ( name, slug ),
      subdomains ( name, slug )
    `)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
  return (data || []) as Program[];
}

export async function addProgram(prog: Omit<Program, "id" | "enrollments" | "main_domains" | "subdomains">) {
  const { data, error } = await supabase
    .from("programs")
    .insert([{ ...prog, enrollments: 0 }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProgram(id: string, updates: Partial<Program>) {
  // Remove joined fields before updating
  const payload = { ...updates };
  delete payload.main_domains;
  delete payload.subdomains;
  
  const { data, error } = await supabase
    .from("programs")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteProgram(id: string) {
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);
    
  if (error) throw error;
}
