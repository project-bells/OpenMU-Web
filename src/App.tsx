import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServerStatusWidget from "./components/ServerStatusWidget";
import Features from "./components/Features";
import OnlineExchangeSection from "./components/OnlineExchangeSection";
import RegisterSection from "./components/RegisterSection";
import RankingSection from "./components/RankingSection";
import DownloadSection from "./components/DownloadSection";
import HighlightsSection from "./components/HighlightsSection";
import GettingStartedSection from "./components/GettingStartedSection";
import EcosystemSection from "./components/EcosystemSection";
import Classes from "./components/Classes";
import Siege from "./components/Siege";
import Events from "./components/Events";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import RegisterModal from "./components/RegisterModal";
import LoginModal from "./components/LoginModal";
import ErrorBoundary from "./components/ErrorBoundary";
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

function Page() {
  const { t } = useI18n();
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const openRegister = () => setModal(true);
  const openLogin = () => setLoginModal(true);
  useGlobalReveal();

  return (
    <div className="min-h-screen bg-[#090d16] text-white antialiased">
      <a
        href="#rates"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        {t.app.skip}
      </a>
      <Navbar onRegister={openRegister} onLogin={openLogin} />
      <main>
        {/* Section 1: Hero */}
        <Hero onRegister={openRegister} onLogin={openLogin} />

        {/* Section 2: Server Live Status & Stats */}
        <ServerStatusWidget />

        {/* Server Rates & Formula (id="rates") */}
        <Features />

        {/* Online-to-Credits & WCoin Exchange System (id="online-rewards") */}
        <OnlineExchangeSection onRegister={openRegister} onLogin={openLogin} />

        {/* Section 3: 3 Key Highlights */}
        <HighlightsSection />

        {/* Section 4: 3-Step Getting Started */}
        <GettingStartedSection onRegister={openRegister} />
        <RegisterSection />
        <DownloadSection />
        <RankingSection />

        {/* Section 5: Ecosystem & External Links */}
        <EcosystemSection onLogin={openLogin} />

        {/* Lore, Class Trees, Siege & FAQ */}
        <Classes onRegister={openRegister} />
        <Siege onRegister={openRegister} />
        <Events />
        <Faq />

        {/* Section 6: Footer CTA */}
        <FinalCta onRegister={openRegister} onLogin={openLogin} />
      </main>
      <Footer onRegister={openRegister} onLogin={openLogin} />
      <RegisterModal open={modal} onClose={() => setModal(false)} />
      <LoginModal
        open={loginModal}
        onClose={() => setLoginModal(false)}
        onSwitchToRegister={openRegister}
      />
      <StickyMobileCta onRegister={openRegister} />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <Page />
      </I18nProvider>
    </ErrorBoundary>
  );
}
