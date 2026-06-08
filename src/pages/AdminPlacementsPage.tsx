import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Users, ChevronDown, ChevronRight,
  Download, Briefcase, Shield,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { canEditAdmin } from "../adminStore";
import {
  getJobs, addJob, updateJob, deleteJob,
  getJobApplications, updateJobAppStatus,
} from "../store";
import AdminListingModal from "../components/AdminListingModal";
import type { JobListing, JobApplication } from "../placementsData";

export default function AdminPlacementsPage({ isAdminLayout }: { isAdminLayout?: boolean }) {
  const { theme } = useTheme();
  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<JobListing | null>(null);
  const [adding, setAdding] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const canEdit = canEditAdmin();

  const fetchPlacementsData = async () => {
    try {
      setLoading(true);
      const [fetchedJobs, fetchedApps] = await Promise.all([
        getJobs(),
        getJobApplications()
      ]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementsData();
  }, []);

  const refresh = fetchPlacementsData;

  const handleSave = async (data: Record<string, string>) => {
    if (!canEdit) return;
    const applicationLink = data.applicationLink?.trim();
    const parsed = {
      ...data,
      applicationLink: applicationLink
        ? (/^https?:\/\//i.test(applicationLink) ? applicationLink : `https://${applicationLink}`)
        : undefined,
      technologies: data.technologies?.split(",").map((s: string) => s.trim()).filter(Boolean) || [],
      postedAt: new Date().toISOString().slice(0, 10),
    };

    if (editing) {
      await updateJob(editing.id, parsed as unknown as Partial<JobListing>);
    } else {
      await addJob(parsed as unknown as Omit<JobListing, "id">);
    }
    setEditing(null);
    setAdding(false);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    await deleteJob(id);
    await refresh();
  };

  const handleStatusChange = async (appId: string, status: JobApplication["status"]) => {
    if (!canEdit) return;
    await updateJobAppStatus(appId, status);
    await refresh();
  };

  const downloadResume = (app: JobApplication) => {
    if (!app.resumeData) return;
    const a = document.createElement("a");
    a.href = app.resumeData;
    a.download = app.resumeFileName || "resume";
    a.click();
  };

  const statusColors: Record<string, string> = {
    pending: "status-pending",
    shortlisted: "status-shortlisted",
    rejected: "status-rejected",
    hired: "status-hired",
  };

  return (
    <main className={`min-h-screen px-4 pb-16 ${isAdminLayout ? 'pt-6' : 'pt-28'}`}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: grad, boxShadow: `0 0 30px -8px ${theme.glow}` }}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
              >
                Admin · Placements
              </h1>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {jobs.length} listings · {applications.length} applications
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: grad, boxShadow: `0 8px 30px -10px ${theme.glow}` }}
            >
              <Plus className="h-4 w-4" />
              Add Job
            </button>
          )}
        </div>

        {/* Listings */}
        {loading && (
          <div className="flex justify-center p-8 text-white/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
        <div className="space-y-4">
          {jobs.map((job, i) => {
            const apps = applications.filter((a) => a.jobId === job.id);
            const isExpanded = expandedApp === job.id;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border"
                style={{
                  background: theme.glass,
                  backdropFilter: "blur(14px)",
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Listing Row */}
                <div className="flex flex-wrap items-center gap-4 p-5">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: grad }}
                  >
                    {job.companyInitials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-sm font-bold"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: theme.text }}
                    >
                      {job.role}
                    </h3>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      {job.company} · {job.location} · {job.salaryPackage} · {job.hiringType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedApp(isExpanded ? null : job.id)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                      style={{
                        background: `rgba(${theme.c1},${theme.mode === "light" ? 0.08 : 0.15})`,
                        color: `rgb(${theme.c1})`,
                      }}
                    >
                      <Users className="h-3 w-3" />
                      {apps.length}
                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => setEditing(job)}
                      disabled={!canEdit}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-70"
                      style={{ background: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", cursor: canEdit ? "pointer" : "not-allowed", opacity: canEdit ? 1 : 0.45 }}
                    >
                      <Pencil className="h-3.5 w-3.5" style={{ color: theme.textMuted }} />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={!canEdit}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-70"
                      style={{ background: "rgba(248,113,113,0.1)", cursor: canEdit ? "pointer" : "not-allowed", opacity: canEdit ? 1 : 0.45 }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Applicants Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="border-t px-5 py-4"
                        style={{ borderColor: theme.border }}
                      >
                        {apps.length === 0 ? (
                          <p className="py-4 text-center text-sm" style={{ color: theme.textMuted }}>
                            No applications yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {apps.map((app) => (
                              <div
                                key={app.id}
                                className="flex flex-wrap items-center gap-3 rounded-xl p-3"
                                style={{
                                  background: theme.mode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                                }}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium" style={{ color: theme.text }}>
                                    {app.name}
                                  </p>
                                  <p className="text-xs" style={{ color: theme.textMuted }}>
                                    {app.email}
                                    {app.experience && ` · ${app.experience}`}
                                  </p>
                                  {app.linkedinUrl && (
                                    <p className="mt-1 text-xs" style={{ color: `rgb(${theme.c1})` }}>
                                      LinkedIn: {app.linkedinUrl}
                                    </p>
                                  )}
                                  {app.whyHire && (
                                    <p className="mt-1 text-xs italic" style={{ color: theme.textMuted }}>
                                      "{app.whyHire.slice(0, 120)}{app.whyHire.length > 120 ? "..." : ""}"
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {app.resumeData && (
                                    <button
                                      onClick={() => downloadResume(app)}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-70"
                                      style={{ background: `rgba(${theme.c1},0.12)` }}
                                      title="Download Resume"
                                    >
                                      <Download className="h-3.5 w-3.5" style={{ color: `rgb(${theme.c1})` }} />
                                    </button>
                                  )}
                                  <select
                                    value={app.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        app.id,
                                        e.target.value as JobApplication["status"]
                                      )
                                    }
                                    disabled={!canEdit}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${statusColors[app.status]}`}
                                    style={{
                                      border: "none",
                                      outline: "none",
                                      cursor: canEdit ? "pointer" : "not-allowed",
                                      opacity: canEdit ? 1 : 0.7,
                                    }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="hired">Hired</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {jobs.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: `rgba(${theme.c1},0.12)` }}
            >
              <Briefcase className="h-10 w-10" style={{ color: `rgb(${theme.c1})` }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
              No jobs yet
            </h3>
            <p className="max-w-sm text-sm" style={{ color: theme.textMuted }}>
              Click "Add Job" to create your first listing.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(adding || editing) && (
        <AdminListingModal
          type="job"
          existing={editing}
          onSave={handleSave}
          onClose={() => { setAdding(false); setEditing(null); }}
        />
      )}
    </main>
  );
}
