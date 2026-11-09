import Hero from "../../components/Hero";
import ServerStatusWidget from "../../components/ServerStatusWidget";
import Features from "../../components/Features";
import OnlineExchangeSection from "../../components/OnlineExchangeSection";
import HighlightsSection from "../../components/HighlightsSection";
import GettingStartedSection from "../../components/GettingStartedSection";
import RegisterSection from "../../components/RegisterSection";
import DownloadSection from "../../components/DownloadSection";
import RankingSection from "../../components/RankingSection";
import EcosystemSection from "../../components/EcosystemSection";
import Classes from "../../components/Classes";
import Siege from "../../components/Siege";
import Events from "../../components/Events";
import Faq from "../../components/Faq";
import FinalCta from "../../components/FinalCta";
import { useGlobalReveal } from "../../hooks/hooks";
import { usePublicModals } from "../../layouts/PublicLayout";

export default function HomePage() {
  const { openRegister, openLogin } = usePublicModals();
  useGlobalReveal();

  return (
    <>
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
    </>
  );
}
