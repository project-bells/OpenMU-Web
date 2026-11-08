import { Download, HardDrive, ShieldCheck, Monitor, AlertTriangle } from "lucide-react";
import { useI18n } from "../i18n";

export default function DownloadSection() {
  const { t } = useI18n();
  const d = t.download;

  return (
    <section id="download" className="relative scroll-mt-28 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Download className="h-3.5 w-3.5" />
            <span>{d.badge}</span>
          </div>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {d.h2a} <span className="text-gradient-gold">{d.h2b}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">{d.sub}</p>
        </div>

        {/* Primary Download Feature Card */}
        <div className="fantasy-panel gold-border relative mb-14 overflow-hidden rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.2)] sm:p-10">
          <div
            className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-amber-400/40 bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                  {d.versionBadge}
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  {d.fullClientBadge}
                </span>
              </div>
              <h3 className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
                {d.cardTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{d.cardDesc}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-amber-400" />
                  {d.fileSize} <strong className="text-white">2.1 GB</strong>
                </span>
                <span>•</span>
                <span>{d.updatedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  {d.virusClean}
                </span>
              </div>
            </div>

            {/* Download Mirrors */}
            <div className="flex min-w-[280px] shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="https://mega.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-sm font-black text-[#090d16] shadow-[0_12px_35px_-8px_rgba(212,175,55,0.45)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-5 w-5" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-bold opacity-75">{d.opt1Label}</span>
                    <span className="text-sm font-extrabold">{d.opt1Title}</span>
                  </span>
                </div>
                <span className="rounded bg-black/20 px-2 py-1 font-mono text-xs font-bold text-white">
                  2.1 GB
                </span>
              </a>

              <a
                href="https://www.mediafire.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center justify-between gap-3 rounded-2xl border-white/20 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-5 w-5 text-amber-400" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] font-bold text-white/50">{d.opt2Label}</span>
                    <span className="text-sm font-extrabold">{d.opt2Title}</span>
                  </span>
                </div>
                <span className="rounded bg-white/10 px-2 py-1 font-mono text-xs text-white/70">
                  2.1 GB
                </span>
              </a>

              <div className="text-center font-mono text-[11px] text-white/40">{d.mirrorNote}</div>
            </div>
          </div>
        </div>

        {/* Technical Requirements Table */}
        <div className="fantasy-panel gold-border mb-14 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display flex items-center gap-2 text-xl font-bold text-white">
                <Monitor className="h-5 w-5 text-amber-400" />
                <span>{d.sysReqTitle}</span>
              </h3>
              <p className="mt-1 text-xs text-white/60">{d.sysReqSub}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 uppercase">
                  <th scope="col" className="px-4 py-3">
                    {d.colComponent}
                  </th>
                  <th scope="col" className="px-4 py-3 text-white/70">
                    {d.colMin}
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold text-amber-300">
                    {d.colRec}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {d.specs.map((spec) => (
                  <tr key={spec.component} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-white/80">
                      {spec.component}
                    </td>
                    <td className="px-4 py-3 text-white/60">{spec.minimum}</td>
                    <td className="px-4 py-3 font-semibold text-white">{spec.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Troubleshooting / Antivirus Guide */}
        <div className="fantasy-panel mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="space-y-2 text-xs leading-relaxed text-white/75">
              <strong className="block text-sm font-bold text-white">{d.avTitle}</strong>
              <p>{d.avDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
