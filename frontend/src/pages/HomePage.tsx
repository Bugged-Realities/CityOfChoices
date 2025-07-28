import HeaderSection from "../components/Header";
import Footer from "../components/Footer";
import GameIntroSection from "../components/GameIntroSection";
import { useNavigate } from "react-router-dom";
import { getToken } from "../api/auth";

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  return (
    <>
      <HeaderSection />
      <div className="centered-section">
        <GameIntroSection />
        {isLoggedIn && (
          <div className="play-game-section">
            <button
              onClick={() => navigate("/game")}
              className="play-game-button"
            >
              🎮 Continue Your Adventure
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
