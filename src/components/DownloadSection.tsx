import { Download, HardDrive, ShieldCheck, Monitor, AlertTriangle } from "lucide-react";
import { SYSTEM_SPECS } from "../data";

export default function DownloadSection() {
  const downloadUrl = import.meta.env.VITE_CLIENT_DOWNLOAD_URL as string | undefined;
  const clientSize = (import.meta.env.VITE_CLIENT_SIZE as string | undefined) || "See download page";
  return (
    <section id="download" className="relative scroll-mt-28 py-16 sm:py-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Download className="h-3.5 w-3.5" />
            <span>Official Game Client S6E3</span>
          </div>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            DOWNLOAD <span className="text-gradient-gold">CLIENT</span>
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            Download the official client package configured by the server operator.
          </p>
        </div>

        {/* Primary Download Feature Card with Mega + MediaFire */}
        <div className="fantasy-panel gold-border relative mb-14 overflow-hidden rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.2)]">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" aria-hidden="true" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                  VERSION 1.04D • S6E3
                </span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  FULL GAME CLIENT
                </span>
              </div>
              <h3 className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
                Download Full Game Client
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Season 6 Episode 3 game client for this server. Verify the published checksum before installing.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-amber-400" />
                  File Size: <strong className="text-white">{clientSize}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="h-4 w-4" /> Official operator link</span>
              </div>
            </div>

            {/* 2 Primary Download Options: Mega + MediaFire */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[280px]">
              <a
                href={downloadUrl || "#download"}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!downloadUrl}
                className={`btn-shine flex items-center justify-between gap-3 rounded-2xl px-6 py-4 text-sm font-black shadow-[0_12px_35px_-8px_rgba(212,175,55,0.45)] transition ${downloadUrl ? "bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] hover:brightness-110" : "pointer-events-none bg-white/10 text-white/50"}`}
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-5 w-5" />
                  <span className="text-left leading-tight">
                    <span className="block text-xs font-semibold opacity-75">OFFICIAL CLIENT</span>
                    <span className="text-sm font-extrabold">{downloadUrl ? "DOWNLOAD" : "NOT CONFIGURED"}</span>
                  </span>
                </div>
                <span className="rounded bg-black/20 px-2 py-1 text-xs font-mono font-bold text-white">{clientSize}</span>
              </a>
              
              <div className="text-center text-[11px] text-white/40 pt-1">
                Configure VITE_CLIENT_DOWNLOAD_URL during the production build.
              </div>
            </div>
          </div>
        </div>

        {/* Technical Requirements Table (Min vs Recommended) */}
        <div className="fantasy-panel gold-border mb-14 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Monitor className="h-5 w-5 text-amber-400" />
                <span>Technical System Requirements</span>
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Optimized for low resource usage. Seamless 60 FPS on both legacy hardware and modern gaming rigs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th scope="col" className="py-3 px-4">Hardware Component</th>
                  <th scope="col" className="py-3 px-4 text-white/70">Minimum Requirements</th>
                  <th scope="col" className="py-3 px-4 text-amber-300 font-bold">Recommended Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {SYSTEM_SPECS.map((spec) => (
                  <tr key={spec.component} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white/80 whitespace-nowrap">
                      {spec.component}
                    </td>
                    <td className="py-3 px-4 text-white/60">
                      {spec.minimum}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {spec.recommended}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Step Setup Guide & Antivirus Notice */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                1
              </span>
              <h4 className="font-display font-bold text-white">Download & Extract</h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              Download the 2.1 GB archive from our direct link or cloud mirrors. Extract the entire ZIP folder to your preferred local drive (e.g. <code className="text-amber-200">D:\Games\MuOrigins</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                2
              </span>
              <h4 className="font-display font-bold text-white">Run Launcher.exe</h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              Launch <code className="text-amber-200">Launcher.exe</code> as Administrator. It will automatically verify files and download any minor updates or patches in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                3
              </span>
              <h4 className="font-display font-bold text-white">Login & Enter World</h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              Enter the username and password you created in the Registration Module. Choose your server and begin your adventure in Lorencia!
            </p>
          </div>
        </div>

        {/* Antivirus Whitelist Notice */}
        <div className="fantasy-panel mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="text-xs text-white/70 leading-relaxed">
              <strong className="text-white block font-bold mb-1">
                Antivirus & Windows Defender False Positive Notice:
              </strong>
              Only download the client from the official link above. Verify its checksum when one is published. Do not disable antivirus protection globally; submit a suspicious file to the operator before adding a narrowly scoped exclusion.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
