import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Classes from "./components/Classes";
import Siege from "./components/Siege";
import Events from "./components/Events";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import RegisterModal from "./components/RegisterModal";
import { useGlobalReveal } from "./hooks/hooks";
import { I18nProvider, useI18n } from "./i18n";
import { Zap, ArrowUp } from "lucide-react";

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
        className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f5c451] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-base font-extrabold text-[#1a1200] shadow-[0_18px_50px_-10px_rgba(245,196,81,.7)]"
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

function Page() {
  const { t } = useI18n();
  const [modal, setModal] = useState(false);
  const openRegister = () => setModal(true);
  useGlobalReveal();

  return (
    <div className="min-h-screen bg-[#05060f] text-white antialiased">
      <a
        href="#rates"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        {t.app.skip}
      </a>
      <Navbar onRegister={openRegister} />
      <main>
        <Hero onRegister={openRegister} />
        <Features />
        <Classes onRegister={openRegister} />
        <Siege onRegister={openRegister} />
        <Events />
        <Testimonials />
        <Pricing onRegister={openRegister} />
        <Faq />
        <FinalCta onRegister={openRegister} />
      </main>
      <Footer onRegister={openRegister} />
      <RegisterModal open={modal} onClose={() => setModal(false)} />
      <StickyMobileCta onRegister={openRegister} />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}
