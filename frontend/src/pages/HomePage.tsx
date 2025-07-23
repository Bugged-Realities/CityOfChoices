import HeaderSection from "../components/Header";
import Footer from "../components/Footer";
import GameIntroSection from "../components/GameIntroSection";

const HomePage = () => {
  return (
    <>
      <HeaderSection />
      <div className="centered-section">
        <GameIntroSection />
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
