import { useState, useEffect } from "react";
import { Server, Clock, Users, Wifi, CheckCircle2, Settings2, ExternalLink } from "lucide-react";
import { getCustomApiUrl, setCustomApiUrl } from "../services/openMuApi";

export default function ServerStatusWidget() {
  const [nowUtc7, setNowUtc7] = useState<string>("");
  const [siegeCountdown, setSiegeCountdown] = useState<string>("");
  const [onlineCount, setOnlineCount] = useState<number>(4821);
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getCustomApiUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live UTC+7 Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // UTC+7 offset in ms = +7 * 60 * 60 * 1000
      const utc7Time = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));
      
      const year = utc7Time.getFullYear();
      const month = String(utc7Time.getMonth() + 1).padStart(2, "0");
      const day = String(utc7Time.getDate()).padStart(2, "0");
      const hours = String(utc7Time.getHours()).padStart(2, "0");
      const minutes = String(utc7Time.getMinutes()).padStart(2, "0");
      const seconds = String(utc7Time.getSeconds()).padStart(2, "0");

      setNowUtc7(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);

      // Calculate next Sunday 20:00 UTC+7
      const dayOfWeek = utc7Time.getDay(); // 0 is Sunday
      let daysUntilSunday = (7 - dayOfWeek) % 7;
      if (daysUntilSunday === 0 && (utc7Time.getHours() > 20 || (utc7Time.getHours() === 20 && utc7Time.getMinutes() > 0))) {
        daysUntilSunday = 7;
      }
      const targetSunday = new Date(utc7Time);
      targetSunday.setDate(utc7Time.getDate() + daysUntilSunday);
      targetSunday.setHours(20, 0, 0, 0);

      const diffMs = Math.max(0, targetSunday.getTime() - utc7Time.getTime());
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      const d = Math.floor(diffHrs / 24);
      const h = diffHrs % 24;
      setSiegeCountdown(`${d}d ${h}h ${diffMins}m ${diffSecs}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle realistic online count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next < 4780 ? 4785 : next > 4860 ? 4855 : next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const [configError, setConfigError] = useState("");

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError("");
    const result = setCustomApiUrl(customUrl.trim());
    if (result.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setShowConfig(false);
      }, 1200);
    } else {
      setConfigError(result.error || "Invalid URL scheme");
    }
  };

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6">
      <div className="fantasy-panel gold-border relative overflow-hidden rounded-2xl p-4 sm:p-5">
        {/* subtle background glow */}
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/10 blur-[80px]" aria-hidden="true" />
        <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-600/10 blur-[80px]" aria-hidden="true" />

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* 1. Server Realm Status */}
          <div className="flex items-start gap-3.5 border-b border-white/5 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
              <Server className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-wide text-white">Lorencia S1 • 50x</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50 truncate">PvP Realm • Season 6 Episode 3</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/40">
                <span>Noria S2 (30x Non-PvP):</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* 2. Online Players Counter */}
          <div className="flex items-start gap-3.5 border-b border-white/5 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black tracking-tight text-white tabular-nums">
                  {onlineCount.toLocaleString()}
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                  PEAK 6.5K
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">Warriors Online Across Realms</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40">
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span>99.98% Server SLA Uptime</span>
              </div>
            </div>
          </div>

          {/* 3. Server Time UTC+7 */}
          <div className="flex items-start gap-3.5 border-b border-white/5 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300">
              <Clock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-tight text-amber-200 tabular-nums">
                  {nowUtc7 || "Loading..."}
                </span>
                <span className="font-mono text-[10px] text-white/50 font-semibold">UTC+7</span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">Official Server Clock</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/80">
                <span>Castle Siege:</span>
                <span className="font-mono font-medium">{siegeCountdown}</span>
              </div>
            </div>
          </div>

          {/* 4. OpenMU Integration Info & Config */}
          <div className="flex items-center justify-between sm:pl-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-white">OpenMU Core</span>
                <span className="rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  REST API
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50 truncate font-mono">
                {customUrl ? "Custom Endpoint" : "Endpoint: /api/account/register"}
              </p>
              <a
                href="https://github.com/MUnique/OpenMU.git"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
              >
                <span>MUnique/OpenMU Repo</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              aria-label="Configure OpenMU API"
              title="OpenMU Server Connection Settings"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* API Settings Drawer */}
        {showConfig && (
          <form
            onSubmit={handleSaveConfig}
            className="mt-4 border-t border-white/10 pt-4 transition-all"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-white/70">
                  OpenMU Backend API URL (Optional Proxy / Direct Host):
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="e.g. http://localhost:5000/api or leave empty for default proxy"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-amber-400/60"
                />
              </div>
              <div className="flex items-center gap-2 sm:self-end">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-2 text-xs font-bold text-[#090d16] transition hover:brightness-110"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/60 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
            {configError && (
              <p className="mt-2 text-xs font-semibold text-red-400">
                {configError}
              </p>
            )}
            {savedSuccess && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connection preferences saved successfully!
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
