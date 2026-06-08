import { supabase } from "./lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accessLevel: "superadmin" | "admin" | "editor" | "viewer";
  unauthorized?: boolean;
}

export const ACCESS_LABELS = {
  superadmin: "Super Admin",
  admin: "Administrator",
  editor: "Content Editor",
  viewer: "Read Only",
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  if (!user) return null;

  if (user.email === "rbharath0467@gmail.com") {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || "Admin",
      role: "Super Admin",
      accessLevel: "superadmin",
    };
  }
  
  // Return a dummy object with unauthorized flag for other users
  return {
    id: user.id,
    email: user.email || "",
    name: "Unauthorized User",
    role: "None",
    accessLevel: "viewer",
    unauthorized: true,
  };
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

export function canEditAdmin() {
  // Only rbharath0467@gmail.com can access the admin dashboard anyway.
  return true;
}

export function canManageEmployees() {
  return true;
}

// Student mock (Will be replaced in Phase 3)
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  enrollmentDate: string;
  enrolledPrograms: string[];
}
export async function getStudents(): Promise<Student[]> {
  const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function updateStudentStatus(id: string, status: string) {
  await supabase.from("students").update({ status }).eq("id", id);
}
export async function deleteStudent(id: string) {
  await supabase.from("students").delete().eq("id", id);
}

// Employee mock (Will be replaced in Phase 3)
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinDate: string;
}
export async function getEmployees(): Promise<Employee[]> {
  const { data } = await supabase.from("employees").select("*").order("join_date", { ascending: false });
  return data || [];
}
export async function addEmployee(emp: Partial<Employee>) {
  await supabase.from("employees").insert([emp]);
}
export async function updateEmployee(id: string, emp: Partial<Employee>) {
  await supabase.from("employees").update(emp).eq("id", id);
}
export async function deleteEmployee(id: string) {
  await supabase.from("employees").delete().eq("id", id);
}

// Stats mock
export function getDashboardStats() {
  return {
    totalRevenue: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    activePrograms: 0,
    totalEmployees: 0,
    courseCompletions: 0,
    placementRate: 0,
  };
}

export interface Category {
  id: string;
  title: string;
}

export function getCategories(): Category[] {
  return [];
}

export interface Program {
  id: string;
  title: string;
}
