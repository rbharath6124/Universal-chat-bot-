import {
  ShieldCheck,
  BrainCircuit,
  ChartColumn,
  Code,
  TrendingUp,
  Megaphone,
  Database,
  Briefcase,
} from "lucide-react";

export interface Course {
  id: string;
  title: string;
  icon: typeof ShieldCheck;
  blurb: string;
  duration: string;
  level: string;
  gradient: string;
  tags: string[];
}

export const courses: Course[] = [
  {
    id: "cyber",
    title: "Cyber Security",
    icon: ShieldCheck,
    blurb:
      "Master ethical hacking, network defense, SIEM tooling and real incident response in a hands-on lab.",
    duration: "8 Weeks",
    level: "Beginner → Pro",
    gradient: "from-violet-500 to-fuchsia-600",
    tags: ["Ethical Hacking", "SIEM", "Pentest"],
  },
  {
    id: "ai",
    title: "Artificial Intelligence",
    icon: BrainCircuit,
    blurb:
      "Build intelligent agents with machine learning, neural networks, NLP and computer vision.",
    duration: "10 Weeks",
    level: "Intermediate",
    gradient: "from-blue-500 to-indigo-600",
    tags: ["ML", "Neural Nets", "NLP"],
  },
  {
    id: "data",
    title: "Data Science",
    icon: ChartColumn,
    blurb:
      "Turn raw data into insight with Python, statistics, visualization and predictive modelling.",
    duration: "10 Weeks",
    level: "Intermediate",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["Python", "Pandas", "ML"],
  },
  {
    id: "fullstack",
    title: "Full Stack Dev",
    icon: Code,
    blurb:
      "Ship production apps end-to-end with React, Node, databases and modern deployment workflows.",
    duration: "12 Weeks",
    level: "Beginner → Pro",
    gradient: "from-emerald-500 to-teal-600",
    tags: ["React", "Node", "APIs"],
  },
  {
    id: "stock",
    title: "Stock Market & Crypto",
    icon: TrendingUp,
    blurb:
      "Learn the art of investing in traditional markets and the emerging world of cryptocurrencies.",
    duration: "6 Weeks",
    level: "Beginner",
    gradient: "from-amber-500 to-orange-600",
    tags: ["Trading", "Crypto", "Analysis"],
  },
  {
    id: "marketing",
    title: "Digital Marketing",
    icon: Megaphone,
    blurb:
      "Drive growth with SEO, performance ads, content strategy and conversion-focused funnels.",
    duration: "8 Weeks",
    level: "Beginner",
    gradient: "from-pink-500 to-rose-600",
    tags: ["SEO", "Ads", "Funnels"],
  },
  {
    id: "analytics",
    title: "Business Analytics",
    icon: Database,
    blurb:
      "Make data-driven decisions with dashboards, SQL, Power BI and analytical storytelling.",
    duration: "8 Weeks",
    level: "Intermediate",
    gradient: "from-purple-500 to-violet-600",
    tags: ["SQL", "Power BI", "KPIs"],
  },
  {
    id: "hr",
    title: "Human Resources",
    icon: Briefcase,
    blurb:
      "Become an HR professional with recruitment, analytics and people-operations frameworks.",
    duration: "6 Weeks",
    level: "Beginner",
    gradient: "from-sky-500 to-cyan-600",
    tags: ["Recruiting", "Ops", "Analytics"],
  },
];

export const steps = [
  {
    n: "01",
    title: "Training",
    desc: "Live, mentor-led sessions taught by industry experts with curated, job-aligned curriculum.",
  },
  {
    n: "02",
    title: "Experience",
    desc: "Work on real-world scenarios solving genuine business problems.",
  },
  {
    n: "03",
    title: "Projects",
    desc: "Build a portfolio with real-time minor & major capstone projects that prove your skills.",
  },
  {
    n: "04",
    title: "Evaluation",
    desc: "Continuous assessment and personalised feedback to make you truly placement-ready.",
  },
  {
    n: "05",
    title: "Placement",
    desc: "We connect you to our hiring partner network and prep you to land the offer.",
  },
];

export const stats = [
  { value: "25K+", label: "Learners Empowered" },
  { value: "120+", label: "Hiring Partners" },
  { value: "3", label: "Certificates Earned" },
  { value: "94%", label: "Satisfaction Rate" },
];

export const certificates = [
  {
    title: "Course Completion",
    desc: "Awarded upon successful completion of the full curriculum.",
  },
  {
    title: "Experience Certificate",
    desc: "Earned through real practical work on capstone projects.",
  },
  {
    title: "Outstanding Performance",
    desc: "Recognises exceptional contribution during the program.",
  },
];

export const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Data Analyst @ Fintech",
    quote:
      "The experience felt like a real job. I walked into interviews with actual projects to show — that changed everything.",
    avatar: "AS",
  },
  {
    name: "Rohan Mehta",
    role: "Security Analyst",
    quote:
      "From zero to running my own ethical hacking lab. The mentors pushed me and the placement team delivered.",
    avatar: "RM",
  },
  {
    name: "Priya Nair",
    role: "ML Engineer",
    quote:
      "The AI track was intense and rewarding. Building a recommendation engine made my resume stand out instantly.",
    avatar: "PN",
  },
  {
    name: "Karthik Reddy",
    role: "Full Stack Developer",
    quote:
      "Best decision for my career. The structured path of training to placement removed all the guesswork.",
    avatar: "KR",
  },
];

export const partners = [
  "TechNova",
  "DataForge",
  "CloudPeak",
  "Quantix",
  "NexaSoft",
  "ByteWorks",
  "Skyline AI",
  "Vertex Labs",
];
