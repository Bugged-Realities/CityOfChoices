import GameLayout from "../components/GameLayout";
import Header from "../components/Header";
import Footer from "../components/Footer";

function GamePage() {
  return (
    <>
      <Header />
      <div>
        <GameLayout />
      </div>
      <Footer />
    </>
  );
}

export default GamePage;
