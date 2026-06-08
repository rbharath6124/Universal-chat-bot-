import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "../RouterContext";
import { getMainDomains, getSubdomains, getPrograms, MainDomain, Subdomain, Program } from "../lib/programsApi";
import SectionHeading from "./SectionHeading";
import MagneticHover from "./MagneticHover";

export default function Programs() {
  const { theme } = useTheme();
  const { navigate } = useRouter();

  const [mainDomains, setMainDomains] = useState<MainDomain[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    async function load() {
      const [mains, subs, progs] = await Promise.all([
        getMainDomains(),
        getSubdomains(),
        getPrograms(),
      ]);
      setMainDomains(mains);
      setSubdomains(subs);
      setPrograms(progs.filter((p) => p.status === "published"));
    }
    load();
  }, []);

  const featuredDomains = subdomains
    .map((sub) => {
      const md = mainDomains.find((m) => m.id === sub.main_domain_id);
      return {
        ...sub,
        mainDomainName: md?.name || "",
        programCount: programs.filter((p) => p.subdomain_id === sub.id).length,
      };
    })
    .filter((sub) => sub.programCount > 0)
    .slice(0, 6);

  return (
    <section id="programs" className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Core Domains"
          title="Specialized Training Paths"
          subtitle="Our programs are designed to simulate actual corporate environments, focusing on high-demand technical skills."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredDomains.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.33, 1, 0.68, 1] }}
              className="cinematic-card group p-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: theme.accent }}
                >
                  {cat.mainDomainName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: theme.textMuted }}>
                  {cat.programCount} Programs
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight" style={{ color: theme.text }}>
                {cat.name}
              </h3>

              <p className="mt-3 text-sm font-light leading-relaxed" style={{ color: theme.textMuted }}>
                Master the art of {cat.name.toLowerCase()} through curated modules and real-world project implementation.
              </p>

              <div className="mt-8">
                <MagneticHover>
                  <button
                    onClick={() => navigate(`domains/${cat.id}`)}
                    className="group/btn flex items-center gap-2 text-sm font-bold transition-colors"
                    style={{ color: theme.accent }}
                  >
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </MagneticHover>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
