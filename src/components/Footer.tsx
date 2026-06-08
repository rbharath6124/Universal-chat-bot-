import { GraduationCap, Globe, Send, Share2, Mail } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";

const cols = [
  {
    title: "Programs",
    links: [
      { label: "Cyber Security", route: "programs" },
      { label: "Artificial Intelligence", route: "programs" },
      { label: "Data Science", route: "programs" },
      { label: "Full Stack", route: "programs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", route: "home" },
      { label: "Campus Ambassador", route: "campus-ambassador" },
      { label: "Job Portal", route: "job-portal" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", route: "home" },
      { label: "Reviews", route: "home" },
      { label: "Contact", route: "home" },
      { label: "FAQs", route: "home" },
    ],
  },
];

export default function Footer() {
  const { theme } = useTheme();
  const { navigate } = useRouter();

  return (
    <footer className="relative border-t px-6 pb-10 pt-20 md:px-12" style={{ borderColor: theme.border }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: theme.accentGradient }}
              >
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: theme.text }}>
                Asscendro
              </span>
            </button>
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed" style={{ color: theme.textMuted }}>
              A Bangalore-based EdTech bridging academic learning and real-world skills
              through industry-aligned training and placements.
            </p>
            <div className="mt-6 flex gap-2">
              {[Globe, Send, Share2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: theme.textMuted }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.route)}
                      className="text-sm font-light transition-colors hover:opacity-80"
                      style={{ color: theme.textMuted }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row" style={{ borderColor: theme.border }}>
          <p className="font-light" style={{ color: theme.textMuted }}>
            &copy; {new Date().getFullYear()} Asscendro. Empowering Careers.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-light transition-colors hover:opacity-80" style={{ color: theme.textMuted }}>Privacy</a>
            <a href="#" className="font-light transition-colors hover:opacity-80" style={{ color: theme.textMuted }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
