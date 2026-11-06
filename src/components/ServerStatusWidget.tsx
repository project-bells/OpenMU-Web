import { useEffect, useState } from "react";
import { Clock, ExternalLink, Server, Users, Wifi, WifiOff } from "lucide-react";
import { getServerStatus, type ServerStatus } from "../services/openMuApi";

export default function ServerStatusWidget() {
  const [clock, setClock] = useState("");
  const [status, setStatus] = useState<ServerStatus>({ state: "offline", players: null, updatedAt: "" });

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "medium", hour12: false,
    }).format(new Date()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const update = async () => {
      try { setStatus(await getServerStatus(controller.signal)); }
      catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus({ state: "offline", players: null, updatedAt: new Date().toISOString() }); }
    };
    void update();
    const interval = window.setInterval(update, 15_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  const online = status.state === "online";
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6" aria-live="polite">
      <div className="fantasy-panel gold-border relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className="flex items-center gap-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/30 bg-amber-500/15 text-amber-300"><Server className="h-5 w-5" /></span>
            <div><p className="font-display text-sm font-bold text-white">OpenMU Game Server</p><p className={online ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-red-400"}>{online ? "Online" : "Unavailable"}</p></div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-300"><Users className="h-5 w-5" /></span>
            <div><p className="font-mono text-lg font-black text-white">{status.players === null ? "—" : status.players.toLocaleString()}</p><p className="text-xs text-white/50">Players online now</p></div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-purple-400/30 bg-purple-500/15 text-purple-300"><Clock className="h-5 w-5" /></span>
            <div><p className="font-mono text-sm font-bold text-amber-200">{clock || "Loading…"}</p><p className="text-xs text-white/50">Server time (UTC+7)</p></div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl border ${online ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300" : "border-red-400/30 bg-red-500/15 text-red-300"}`}>{online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}</span>
            <div><p className="font-display text-sm font-bold text-white">Live OpenMU API</p><a href="https://github.com/MUnique/OpenMU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline">Server project <ExternalLink className="h-3 w-3" /></a></div>
          </div>
        </div>
      </div>
    </section>
  );
}
