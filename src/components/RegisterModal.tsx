import { useEffect, useState } from "react";
import { X, User, Mail, Lock, CheckCircle2, Gamepad2, Gift, Loader2 } from "lucide-react";
import { useI18n, fmt } from "../i18n";

export default function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const m = t.modal;
  const [step, setStep] = useState<"form" | "loading" | "done">("form");
  const [form, setForm] = useState({ user: "", email: "", pass: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("form");
      setError("");
      document.body.style.overflow = "hidden";
      const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", fn);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", fn);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.user.length < 4) return setError(m.errUser);
    if (!form.email.includes("@")) return setError(m.errEmail);
    if (form.pass.length < 6) return setError(m.errPass);
    setError("");
    setStep("loading");
    setTimeout(() => setStep("done"), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={m.aria}
    >
      <div
        className="gold-border glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn .45s cubic-bezier(.22,1,.36,1) both" }}
      >
        <div className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[70px]" aria-hidden="true" />
        <button
          onClick={onClose}
          aria-label={m.close}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "done" ? (
          <div className="relative text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h3 className="font-display mt-4 text-2xl font-black text-white">{fmt(m.welcome, { name: form.user.toUpperCase() || m.hero })}</h3>
            <p className="mt-2 text-sm text-white/60">{m.created}</p>
            <div className="mt-4 rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/8 px-4 py-3.5">
              <p className="font-mono text-lg font-black tracking-[0.2em] text-amber-300">ORIGINS-2026</p>
              <p className="mt-1 text-[11px] text-white/50">{m.redeem}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href="#download" onClick={onClose} className="btn-shine rounded-xl bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] px-4 py-3 text-sm font-extrabold text-[#1a1200]">
                {m.download}
              </a>
              <a href="#download" onClick={onClose} className="rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-extrabold text-white transition hover:brightness-110">
                {m.discord}
              </a>
            </div>
            <p className="mt-3 text-[11px] text-white/40">{m.verify}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#f5c451] to-[#ff8a3c] shadow-lg shadow-amber-500/30">
                <Gamepad2 className="h-6 w-6 text-[#1a1200]" />
              </span>
              <div>
                <h3 className="font-display text-xl font-black text-white">{m.title}</h3>
                <p className="text-xs text-white/50">{m.sub}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/8 px-3.5 py-2.5 text-xs font-semibold text-amber-100">
              <Gift className="h-4 w-4 shrink-0 text-amber-300" />
              {m.bonus}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              {[
                { k: "user" as const, icon: User, ph: m.phUser, type: "text", auto: "username" },
                { k: "email" as const, icon: Mail, ph: m.phEmail, type: "email", auto: "email" },
                { k: "pass" as const, icon: Lock, ph: m.phPass, type: "password", auto: "new-password" },
              ].map((f) => (
                <label key={f.k} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 transition focus-within:border-amber-400/50 focus-within:bg-white/[.06]">
                  <f.icon className="h-4 w-4 shrink-0 text-white/35 transition group-focus-within:text-amber-300" />
                  <input
                    type={f.type}
                    autoComplete={f.auto}
                    required
                    value={form[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.ph}
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </label>
              ))}

              {error && (
                <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={step === "loading"}
                className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] px-6 py-4 text-base font-extrabold text-[#1a1200] shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-70"
              >
                {step === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {m.loading}
                  </>
                ) : (
                  m.submit
                )}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-white/35">
                {m.terms1}<br />{m.terms2}
              </p>
            </form>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: translateY(32px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }`}</style>
    </div>
  );
}
