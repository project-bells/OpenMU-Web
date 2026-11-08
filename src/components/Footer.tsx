import { useI18n } from "../i18n";
import { LogIn, UserPlus, Download, Trophy, Coins } from "lucide-react";

export default function Footer({
  onRegister,
  onLogin,
}: {
  onRegister: () => void;
  onLogin: () => void;
}) {
  const { t } = useI18n();
  const ft = t.footer;

  return (
    <footer className="border-t border-white/10 bg-[#070a11]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <a href="#top" className="inline-flex items-center gap-2.5">
              <img
                src="/images/logo.png"
                alt="eGiS-MU Logo"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="font-display text-lg font-black text-white">
                eGiS-<span className="text-amber-400">MU</span>
              </span>
            </a>
            <p className="mt-3 text-xs leading-relaxed text-white/50">{ft.desc}</p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-amber-300 uppercase">
              {ft.colNav}
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-white/65">
              <li>
                <a href="#rates" className="transition hover:text-amber-300">
                  {t.nav.features}
                </a>
              </li>
              <li>
                <a href="#classes" className="transition hover:text-amber-300">
                  {t.nav.classes}
                </a>
              </li>
              <li>
                <a href="#siege" className="transition hover:text-amber-300">
                  {t.nav.siege}
                </a>
              </li>
              <li>
                <a href="#events" className="transition hover:text-amber-300">
                  {t.nav.events}
                </a>
              </li>
              <li>
                <a href="#faq" className="transition hover:text-amber-300">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Portal Column */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-amber-300 uppercase">
              {ft.colAccount}
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-white/65">
              <li>
                <button
                  type="button"
                  onClick={onRegister}
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-300 transition hover:text-white"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{ft.linkRegister}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-1.5 font-semibold text-white/80 transition hover:text-amber-300"
                >
                  <LogIn className="h-3.5 w-3.5 text-amber-400" />
                  <span>{ft.linkLogin}</span>
                </button>
              </li>
              <li>
                <a
                  href="#download"
                  className="inline-flex items-center gap-1.5 transition hover:text-amber-300"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>{ft.linkDownload}</span>
                </a>
              </li>
              <li>
                <a
                  href="#ranking"
                  className="inline-flex items-center gap-1.5 transition hover:text-amber-300"
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>{ft.linkRanking}</span>
                </a>
              </li>
              <li>
                <a
                  href="#online-rewards"
                  className="inline-flex items-center gap-1.5 transition hover:text-amber-300"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>{ft.linkExchange}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Server Info Column */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-amber-300 uppercase">
              {ft.colInfo}
            </h4>
            <ul className="mt-3 space-y-2 font-mono text-xs text-white/60">
              <li>{ft.infoVersion}</li>
              <li>{ft.infoExp}</li>
              <li className="text-amber-300">{ft.infoOnlineReward}</li>
              <li>{ft.infoSiege}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:flex-row sm:text-left">
          <p>{ft.rights}</p>
          <p>{ft.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
