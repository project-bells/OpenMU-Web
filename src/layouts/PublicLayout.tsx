import { useState, createContext, useContext, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RegisterModal from "../components/RegisterModal";
import { useI18n } from "../i18n";
import { Zap, ArrowUp, ArrowRightLeft } from "lucide-react";

interface PublicModalContextType {
  openRegister: () => void;
  openLogin: () => void;
}

const PublicModalContext = createContext<PublicModalContextType>({
  openRegister: () => {},
  openLogin: () => {},
});

export const usePublicModals = () => useContext(PublicModalContext);

function StickyMobileCta({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > window.innerHeight * 0.9);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 transition-all duration-500 md:hidden ${
        show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <button
        onClick={onRegister}
        className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-base font-extrabold text-[#090d16] shadow-[0_18px_50px_-10px_rgba(212,175,55,.7)]"
      >
        <Zap className="h-5 w-5 shrink-0" /> {t.app.mobileCta}
      </button>
    </div>
  );
}

function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 1600);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <a
      href="#top"
      aria-label={t.app.backTop}
      className="glass fixed right-5 bottom-5 z-40 hidden h-12 w-12 place-items-center rounded-full text-white transition hover:border-amber-400/40 hover:text-amber-300 md:grid"
    >
      <ArrowUp className="h-5 w-5" />
    </a>
  );
}

export default function PublicLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);

  const openRegister = () => setRegisterOpen(true);
  const openLogin = () => navigate("/login");

  return (
    <PublicModalContext.Provider value={{ openRegister, openLogin }}>
      <div className="min-h-screen bg-[#090d16] text-white antialiased">
        <a
          href="#rates"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2 focus:font-bold focus:text-black"
        >
          {t.app.skip}
        </a>

        {/* Public Header Navbar */}
        <Navbar onRegister={openRegister} onLogin={openLogin} />

        {/* Main Content (HomePage or other public pages) */}
        <main>
          <Outlet />
        </main>

        {/* Public Footer */}
        <Footer onRegister={openRegister} onLogin={openLogin} />

        {/* Floating Player Portal Quick Shortcut */}
        <div className="fixed bottom-5 left-5 z-40 hidden sm:flex flex-col gap-2">
          <Link
            to="/user/dashboard"
            className="group flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-[#090d18]/90 px-3 py-2 text-xs font-bold text-cyan-300 shadow-xl backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white"
          >
            <ArrowRightLeft className="h-4 w-4 text-cyan-400 transition group-hover:scale-110" />
            <span>Dashboard ผู้เล่น (แลก 50 ชม.)</span>
          </Link>
        </div>

        {/* Modals & Helpers */}
        <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
        <StickyMobileCta onRegister={openRegister} />
        <BackToTop />
      </div>
    </PublicModalContext.Provider>
  );
}
