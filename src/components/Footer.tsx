import { useI18n } from "../i18n";
import { LogIn, UserPlus, Heart } from "lucide-react";

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
            <p className="mt-3 text-xs leading-relaxed text-white/50">{ft.tagline}</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={onRegister}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{ft.start}</span>
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-amber-300"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-400" />
                <span>{ft.login}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Columns from locale */}
          {ft.cols.map((col, idx) => (
            <div key={`${col.h}-${idx}`}>
              <h4 className="font-display text-xs font-bold tracking-wider text-amber-300 uppercase">
                {col.h}
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/65">
                {col.links.map((link, linkIdx) => (
                  <li key={`${link}-${linkIdx}`}>
                    {link === "Account Login" ? (
                      <button
                        type="button"
                        onClick={onLogin}
                        className="transition hover:text-amber-300"
                      >
                        {link}
                      </button>
                    ) : link === "Create Account" ? (
                      <button
                        type="button"
                        onClick={onRegister}
                        className="transition hover:text-amber-300"
                      >
                        {link}
                      </button>
                    ) : (
                      <a href="#top" className="transition hover:text-amber-300">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:flex-row sm:text-left">
          <p>{ft.copyright}</p>
          <p className="flex items-center gap-1">
            <span>{ft.madeA}</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>{ft.madeB} • {ft.uptime}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
