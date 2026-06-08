export interface JobListing {
  id: string;
  company: string;
  companyInitials: string;
  role: string;
  salaryPackage: string;
  experienceRequired: string;
  location: string;
  technologies: string[];
  hiringType: "Full-time" | "Contract" | "Part-time";
  domain: string;
  description: string;
  applicationLink?: string;
  postedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  resumeFileName?: string;
  resumeData?: string; // base64, kept for legacy if needed
  resumeUrl?: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  experience: string;
  whyHire: string;
  status: "pending" | "shortlisted" | "rejected" | "hired";
  appliedAt: string;
}

// ─── Sample Job Listings ─────────────────────────────────────────────

export const sampleJobs: JobListing[] = [
  {
    id: "job-001",
    company: "Zenith Technologies",
    companyInitials: "ZT",
    role: "Full Stack Developer",
    salaryPackage: "₹8–12 LPA",
    experienceRequired: "0–2 years",
    location: "Bangalore, India",
    technologies: ["React", "Node.js", "MongoDB", "AWS"],
    hiringType: "Full-time",
    domain: "Technology",
    description:
      "Join our product team to build and ship features across the stack. Strong ownership culture with mentorship from senior engineers.",
    postedAt: "2026-06-02",
  },
  {
    id: "job-002",
    company: "Meridian Finance",
    companyInitials: "MF",
    role: "Financial Analyst",
    salaryPackage: "₹6–9 LPA",
    experienceRequired: "1–3 years",
    location: "Mumbai, India",
    technologies: ["Excel", "SQL", "Tableau", "Financial Modeling"],
    hiringType: "Full-time",
    domain: "Finance",
    description:
      "Conduct financial analysis, build forecasting models, and support M&A due diligence for enterprise clients.",
    postedAt: "2026-05-30",
  },
  {
    id: "job-003",
    company: "ArcLight Studios",
    companyInitials: "AS",
    role: "UI/UX Designer",
    salaryPackage: "₹7–10 LPA",
    experienceRequired: "1–2 years",
    location: "Remote",
    technologies: ["Figma", "Adobe XD", "Prototyping", "Design Systems"],
    hiringType: "Full-time",
    domain: "Design",
    description:
      "Design beautiful, intuitive interfaces for web and mobile products. Work closely with product and engineering teams.",
    postedAt: "2026-05-28",
  },
  {
    id: "job-004",
    company: "Cypher Security",
    companyInitials: "CS",
    role: "Cybersecurity Analyst",
    salaryPackage: "₹10–15 LPA",
    experienceRequired: "2–4 years",
    location: "Hyderabad, India",
    technologies: ["SIEM", "Penetration Testing", "Python", "Network Security"],
    hiringType: "Full-time",
    domain: "Technology",
    description:
      "Monitor, detect, and respond to security threats. Conduct vulnerability assessments and penetration testing.",
    postedAt: "2026-05-25",
  },
  {
    id: "job-005",
    company: "GrowthLoop Marketing",
    companyInitials: "GL",
    role: "Growth Marketing Manager",
    salaryPackage: "₹9–14 LPA",
    experienceRequired: "2–5 years",
    location: "Delhi, India",
    technologies: ["Google Ads", "Meta Ads", "Analytics", "CRM"],
    hiringType: "Full-time",
    domain: "Marketing",
    description:
      "Own full-funnel growth strategy for B2B SaaS products. Drive acquisition, activation, and retention across channels.",
    postedAt: "2026-05-22",
  },
  {
    id: "job-006",
    company: "DataVerse AI",
    companyInitials: "DV",
    role: "Data Engineer",
    salaryPackage: "₹12–18 LPA",
    experienceRequired: "1–3 years",
    location: "Pune, India",
    technologies: ["Python", "Spark", "Airflow", "Snowflake"],
    hiringType: "Contract",
    domain: "Technology",
    description:
      "Design and maintain ETL pipelines for large-scale data platforms. Build data infrastructure that powers ML workloads.",
    postedAt: "2026-05-20",
  },
];
