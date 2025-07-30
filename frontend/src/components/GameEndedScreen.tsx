import React, { useState } from "react";

interface GameEndedScreenProps {
  character: any;
  onRestart: () => Promise<void>;
  onGoHome: () => void;
}

const GameEndedScreen: React.FC<GameEndedScreenProps> = ({
  character,
  onRestart,
  onGoHome,
}) => {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    if (isRestarting) return; // Prevent multiple clicks

    setIsRestarting(true);
    try {
      await onRestart();
    } catch (error) {
      console.error("Restart failed:", error);
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div>
      <div>
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You have completed your journey through the City of Choices!</p>
        <div>
          <h3>Final Stats</h3>
          <p>Name: {character?.name}</p>
          <p>Final Fear: {character?.fear}</p>
          <p>Final Sanity: {character?.sanity}</p>
        </div>
        <div>
          <button
            onClick={handleRestart}
            disabled={isRestarting}
            className={isRestarting ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isRestarting ? "🔄 Restarting..." : "🔄 Play Again"}
          </button>
          <button onClick={onGoHome}>🏠 Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default GameEndedScreen;
