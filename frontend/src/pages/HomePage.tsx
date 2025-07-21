import HeaderSection from "../components/Header";
import GameOverviewSection from "../components/GameOverviewSection";
import HowItWorksSection from "../components/HowItWorksSection";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <>
      <HeaderSection />
      <div className="centered-section">
        <GameOverviewSection />
      </div>
      <HowItWorksSection />
      <Footer />
    </>
  );
};

export default HomePage;
