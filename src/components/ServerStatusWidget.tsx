import { useState, useEffect } from "react";
import { Server, Clock, Users, Wifi, ShieldCheck, Lock, Coins } from "lucide-react";
import { useI18n } from "../i18n";
import { fetchServerStatus, ServerStatusData } from "../services/dbApi";

export default function ServerStatusWidget() {
  const { lang } = useI18n();
  const [nowUtc7, setNowUtc7] = useState<string>("");
  const [siegeCountdown, setSiegeCountdown] = useState<string>("");
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [serverData, setServerData] = useState<ServerStatusData | null>(null);

  // Fetch live server database status
  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      const data = await fetchServerStatus();
      if (mounted) {
        setServerData(data);
        if (data.onlineCount) setOnlineCount(data.onlineCount);
      }
    };
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const maxCapacity = serverData?.realms?.reduce((acc, r) => acc + (r.max || 0), 0) || 0;

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
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {maxCapacity > 0 ? `MAX ${(maxCapacity >= 1000 ? (maxCapacity / 1000).toFixed(1) + "K" : maxCapacity)}` : (serverData?.status === "ONLINE" ? "ONLINE" : "OFFLINE")}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">{lang === "th" ? "ผู้เล่นออนไลน์รวมทุกห้อง" : "Warriors Online Across Realms"}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40">
                <Wifi className={`h-3 w-3 ${serverData?.status === "ONLINE" ? "text-emerald-400" : "text-rose-400"}`} />
                <span>
                  {serverData?.uptime
                    ? `${lang === "th" ? "ออนไลน์ต่อเนื่อง" : "Uptime"}: ${serverData.uptime}`
                    : serverData?.status === "ONLINE"
                      ? "Server Online & Stable"
                      : (lang === "th" ? "เซิร์ฟเวอร์ออฟไลน์" : "Server Offline")}
                </span>
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

          {/* 4. Anti-Cheat & Security Card */}
          <div className="flex items-start gap-3.5 sm:pl-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-white">
                  Origins GameGuard
                </span>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  ACTIVE
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/50 truncate">
                Memory Guard & Anti-Speedhack
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Lock className="h-3 w-3" />
                <span>{lang === "th" ? "สำรองข้อมูลทุกวัน • ไร้การล้างเซิร์ฟ" : "Daily Backup • No Wipe Guarantee"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Reward Exchange Highlight Banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Coins className="h-3.5 w-3.5" />
            </span>
            <span className="text-white/80">
              <strong className="text-amber-300 font-bold">
                {lang === "th" ? "ระบบออนไลน์แลกเครดิต:" : "Online Time Rewards:"}
              </strong>{" "}
              {lang === "th"
                ? "ออนไลน์ครบ 1 ชั่วโมง รับทันที 10 Credits • สะสม 100 Credits แลกได้ 50 WCoin ใช้ช้อป Web Shop ฟรี!"
                : "Earn 10 Credits every 1 hour online • Convert 100 Credits into 50 WCoin for Web Shop!"}
            </span>
          </div>

          <a
            href="#online-rewards"
            className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-white transition whitespace-nowrap self-start sm:self-auto bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1 rounded-lg border border-amber-400/25"
          >
            <span>{lang === "th" ? "ดูวิธีแลก WCoin" : "View Exchange System"}</span>
            <span className="text-xs">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
