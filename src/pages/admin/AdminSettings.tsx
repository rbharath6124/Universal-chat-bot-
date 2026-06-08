import { useMemo, useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Moon,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { getAdminUser } from "../../adminStore";

type SettingsTab = "Profile" | "Security" | "Notifications" | "Appearance" | "API Keys";

const tabs: Array<{ id: SettingsTab; icon: typeof User }> = [
  { id: "Profile", icon: User },
  { id: "Security", icon: Lock },
  { id: "Notifications", icon: Bell },
  { id: "Appearance", icon: Moon },
  { id: "API Keys", icon: KeyRound },
];

const defaultSecurity = {
  twoFactor: true,
  loginAlerts: true,
  sessionTimeout: "30",
};

const defaultNotifications = {
  applications: true,
  listings: true,
  weeklyDigest: false,
  employeeChanges: true,
};

const readSavedSettings = () => {
  try {
    return JSON.parse(localStorage.getItem("asscendro_admin_settings") || "{}") as {
      security?: typeof defaultSecurity;
      notifications?: typeof defaultNotifications;
      apiKey?: string;
    };
  } catch {
    return {};
  }
};

export default function AdminSettings() {
  const { theme, toggleMode } = useTheme();
  const [user, setUser] = useState<{ email?: string; unauthorized?: boolean } | null>(null);

  useEffect(() => {
    getAdminUser().then(u => setUser(u));
  }, []);
  const [activeTab, setActiveTab] = useState<SettingsTab>("Profile");
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [timeoutOpen, setTimeoutOpen] = useState(false);
  const savedSettings = useMemo(readSavedSettings, []);
  const defaultApiKey = useMemo(() => "asc_live_" + (user?.email || "admin").replace(/[^a-z0-9]/gi, "").slice(0, 10) + "_9x4k2m", [user?.email]);
  const [security, setSecurity] = useState({ ...defaultSecurity, ...savedSettings.security });
  const [notifications, setNotifications] = useState({ ...defaultNotifications, ...savedSettings.notifications });
  const [apiKey, setApiKey] = useState(savedSettings.apiKey || defaultApiKey);

  const grad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  const cardStyle: CSSProperties = {
    background: theme.glass,
    backdropFilter: "blur(10px)",
    borderColor: theme.border,
  };

  const inputStyle: CSSProperties = {
    background: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
    color: theme.text,
    border: `1px solid ${theme.border}`,
  };

  const handleSave = () => {
    localStorage.setItem("asscendro_admin_settings", JSON.stringify({ security, notifications, apiKey }));
    localStorage.setItem("asscendro_admin_last_activity", Date.now().toString());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const renderToggle = (checked: boolean, onChange: () => void) => (
    <button
      type="button"
      onClick={onChange}
      className="relative h-7 w-12 rounded-full transition"
      style={{ background: checked ? grad : theme.mode === "light" ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.16)" }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white transition"
        style={{ left: checked ? 24 : 4 }}
      />
    </button>
  );

  const SettingRow = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4" style={{ borderColor: theme.border }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: theme.text }}>{title}</p>
        <p className="text-xs" style={{ color: theme.textMuted }}>{description}</p>
      </div>
      {children}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Security":
        return (
          <SettingsCard icon={Shield} title="Security" cardStyle={cardStyle} iconColor={`rgb(${theme.c1})`}>
            <div className="space-y-3">
              <SettingRow title="Two-factor authentication" description="Require an additional verification step for admin logins.">
                {renderToggle(security.twoFactor, () => setSecurity({ ...security, twoFactor: !security.twoFactor }))}
              </SettingRow>
              <SettingRow title="Login alerts" description="Send an email when a new device signs in.">
                {renderToggle(security.loginAlerts, () => setSecurity({ ...security, loginAlerts: !security.loginAlerts }))}
              </SettingRow>
              <SettingRow title="Session timeout" description="Automatically sign out inactive admin users.">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTimeoutOpen((open) => !open)}
                    className="flex min-w-36 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  >
                    {timeoutLabel(security.sessionTimeout)}
                    <ChevronDown className="h-4 w-4" style={{ color: theme.textMuted }} />
                  </button>
                  {timeoutOpen && (
                    <div
                      className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-xl border shadow-xl"
                      style={{
                        background: theme.mode === "light" ? "#ffffff" : "#07140f",
                        borderColor: theme.border,
                      }}
                    >
                      {["15", "30", "60", "120"].map((value) => {
                        const selected = security.sessionTimeout === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setSecurity({ ...security, sessionTimeout: value });
                              setTimeoutOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm transition hover:bg-white/10"
                            style={{
                              background: selected ? `rgba(${theme.c1},0.18)` : "transparent",
                              color: selected ? theme.text : theme.textMuted,
                            }}
                          >
                            {timeoutLabel(value)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SettingRow>
            </div>
          </SettingsCard>
        );
      case "Notifications":
        return (
          <SettingsCard icon={Bell} title="Notifications" cardStyle={cardStyle} iconColor={`rgb(${theme.c1})`}>
            <div className="space-y-3">
              <SettingRow title="New applications" description="Notify admins when candidates apply for placements.">
                {renderToggle(notifications.applications, () => setNotifications({ ...notifications, applications: !notifications.applications }))}
              </SettingRow>
              <SettingRow title="Listing updates" description="Notify the team when jobs or programs are changed.">
                {renderToggle(notifications.listings, () => setNotifications({ ...notifications, listings: !notifications.listings }))}
              </SettingRow>
              <SettingRow title="Weekly digest" description="Send a weekly summary of portal activity.">
                {renderToggle(notifications.weeklyDigest, () => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest }))}
              </SettingRow>
              <SettingRow title="Employee access changes" description="Notify super admins when team access is updated.">
                {renderToggle(notifications.employeeChanges, () => setNotifications({ ...notifications, employeeChanges: !notifications.employeeChanges }))}
              </SettingRow>
            </div>
          </SettingsCard>
        );
      case "Appearance":
        return (
          <SettingsCard icon={Moon} title="Appearance" cardStyle={cardStyle} iconColor={`rgb(${theme.c2})`}>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => theme.mode !== "dark" && toggleMode()}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition ${theme.mode === "dark" ? "ring-2" : ""}`}
                style={{ borderColor: theme.mode === "dark" ? `rgb(${theme.c1})` : theme.border, background: "rgba(255,255,255,0.02)" }}
              >
                <Moon className="h-6 w-6" style={{ color: theme.mode === "dark" ? `rgb(${theme.c1})` : theme.textMuted }} />
                <span className="text-sm font-medium" style={{ color: theme.text }}>Dark Mode</span>
              </button>
              <button
                type="button"
                onClick={() => theme.mode !== "light" && toggleMode()}
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition ${theme.mode === "light" ? "ring-2" : ""}`}
                style={{ borderColor: theme.mode === "light" ? `rgb(${theme.c1})` : theme.border, background: "rgba(255,255,255,0.02)" }}
              >
                <Sun className="h-6 w-6" style={{ color: theme.mode === "light" ? `rgb(${theme.c1})` : theme.textMuted }} />
                <span className="text-sm font-medium" style={{ color: theme.text }}>Light Mode</span>
              </button>
            </div>
          </SettingsCard>
        );
      case "API Keys":
        return (
          <SettingsCard icon={KeyRound} title="API Keys" cardStyle={cardStyle} iconColor={`rgb(${theme.c1})`}>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>Live API Key</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={showApiKey ? apiKey : "asc_live_****************"}
                    className="min-w-0 flex-1 rounded-xl px-4 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowApiKey((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: theme.border, color: theme.text }}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(apiKey)} className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: theme.border, color: theme.text }}>
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <SettingRow title="Webhook endpoint" description="Use this endpoint for application and listing events.">
                <code className="rounded-lg px-3 py-2 text-xs" style={{ background: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)", color: theme.text }}>
                  /api/admin/webhooks
                </code>
              </SettingRow>
              <button
                type="button"
                onClick={() => {
                  const nextKey = `asc_live_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
                  setApiKey(nextKey);
                  localStorage.setItem("asscendro_admin_settings", JSON.stringify({ security, notifications, apiKey: nextKey }));
                  setSaved(true);
                  window.setTimeout(() => setSaved(false), 1600);
                }}
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <RefreshCw className="h-4 w-4" />
                Rotate Key
              </button>
            </div>
          </SettingsCard>
        );
      default:
        return (
          <SettingsCard icon={User} title="Personal Information" cardStyle={cardStyle} iconColor={`rgb(${theme.c1})`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>First Name</label>
                  <input type="text" defaultValue="Asscendro" className="w-full rounded-xl px-4 py-2 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>Last Name</label>
                  <input type="text" defaultValue="Admin" className="w-full rounded-xl px-4 py-2 text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>Work Email</label>
                <input type="email" disabled value={user?.email || "admin@asscendro.com"} className="w-full cursor-not-allowed rounded-xl px-4 py-2 text-sm opacity-50 outline-none" style={inputStyle} />
              </div>
              <SettingRow title="Trusted device" description="This browser is marked as a trusted admin device.">
                <Smartphone className="h-5 w-5" style={{ color: `rgb(${theme.c1})` }} />
              </SettingRow>
            </div>
          </SettingsCard>
        );
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.text, fontFamily: "Space Grotesk, sans-serif" }}>
          Platform Settings
        </h1>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Manage your portal preferences, security, and team settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-white/5"
                style={{
                  background: isActive ? `rgba(${theme.c1}, 0.15)` : "transparent",
                  color: isActive ? theme.text : theme.textMuted,
                  border: isActive ? `1px solid rgba(${theme.c1}, 0.3)` : "1px solid transparent",
                }}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? `rgb(${theme.c1})` : "inherit" }} />
                {item.id}
              </button>
            );
          })}
        </div>

        <div className="space-y-6 md:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm" style={{ color: `rgb(${theme.c1})` }}>Saved</span>}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: grad, boxShadow: `0 8px 24px -8px ${theme.glow}` }}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  cardStyle,
  iconColor,
  children,
}: {
  icon: typeof User;
  title: string;
  cardStyle: CSSProperties;
  iconColor: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <div className="rounded-2xl border p-6" style={cardStyle}>
      <div className="mb-6 flex items-center gap-3">
        <Icon className="h-5 w-5" style={{ color: iconColor }} />
        <h2 className="text-lg font-bold" style={{ color: theme.text }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function timeoutLabel(value: string) {
  const labels: Record<string, string> = {
    "15": "15 minutes",
    "30": "30 minutes",
    "60": "1 hour",
    "120": "2 hours",
  };

  return labels[value] || "30 minutes";
}
