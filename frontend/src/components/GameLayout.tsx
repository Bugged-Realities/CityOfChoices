import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CharacterInfo from "./CharacterInfo";
import InventoryInfo from "./InventoryInfo";
import StoryContent from "./StoryContent";
import GameEndedScreen from "./GameEndedScreen";
import Background from "./Background";
import { useGameState } from "../hooks/useGameState";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C]">
    <div className="bg-[#1A1F2C] border-2 border-[#5ec3b8] rounded-lg p-6 shadow-xl max-w-md">
      <h2 className="text-[#5ec3b8] font-['Press_Start_2P'] text-xl font-bold text-center mb-4">
        🔄 Loading...
      </h2>
      <p className="text-[#E8E6E3] font-['Press_Start_2P'] text-sm text-center">
        Preparing your journey...
      </p>
    </div>
  </div>
);

function GameLayout() {
  const navigate = useNavigate();
  const {
    character,
    inventory,
    node,
    error,
    gameEnded,
    isLoading,
    canItemTriggerStory,
    canMakeChoice,
    getMissingItemsForChoice,
    handleRestart,
    handleChoice,
    handleUseItem,
    getGameState,
    setGameState,
  } = useGameState();

  const [currentStageId, setCurrentStageId] = useState("start_subway");

  // Update background when stage changes
  useEffect(() => {
    if (node?.stage) {
      setCurrentStageId(node.stage);
    }
  }, [node?.stage]);

  // If there's an error, set the error state
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C]">
        <div className="bg-[#1A1F2C] border-2 border-[#E05219] rounded-lg p-6 shadow-xl max-w-md">
          <h2 className="text-[#E05219] font-['Press_Start_2P'] text-xl font-bold text-center mb-4">
            ⚠️ Error
          </h2>
          <p className="text-[#E8E6E3] font-['Press_Start_2P'] text-sm text-center">
            {error}
          </p>
        </div>
      </div>
    );

  // Show loading spinner if no node or loading
  if (!node || isLoading) {
    return <LoadingSpinner />;
  }

  // If the game has ended, show restart options
  if (gameEnded) {
    return (
      <GameEndedScreen
        character={character}
        endingDescription={node?.description}
        onRestart={handleRestart}
        onGoHome={() => navigate("/")}
      />
    );
  }

  // If there's a node, return the game content
  return (
    <div className="relative min-h-screen overflow-hidden font-['Press_Start_2P']">
      {/* Background */}
      <Background stageId={currentStageId} />

      {/* Game content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Top section with character info and story */}
        <div className="flex justify-between mb-12">
          {/* Character Info - left side */}
          <div className="w-64 pt-16 flex-shrink-0">
            <CharacterInfo
              character={character}
              getGameState={getGameState}
              setGameState={setGameState}
            />
          </div>

          {/* Story Content - right side in contained box */}
          <div className="flex-1 min-h-[500px]  max-w-2xl pt-16 flex justify-center">
            <StoryContent
              node={node}
              onChoice={handleChoice}
              canMakeChoice={canMakeChoice}
              getMissingItemsForChoice={getMissingItemsForChoice}
            />
          </div>
        </div>

        {/* Bottom section: Inventory */}
        <div className="flex-1 pt-2">
          <InventoryInfo
            inventory={inventory}
            onUseItem={handleUseItem}
            canItemTriggerStory={canItemTriggerStory}
          />
        </div>
      </div>
    </div>
  );
}

export default GameLayout;
