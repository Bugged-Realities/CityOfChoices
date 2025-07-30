import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SaveLoadControls from "./SaveLoadControls";
import CharacterInfo from "./CharacterInfo";
import InventoryInfo from "./InventoryInfo";
import StoryContent from "./StoryContent";
import GameEndedScreen from "./GameEndedScreen";
import Background from "./Background";
import { useGameState } from "../hooks/useGameState";

function GameLayout() {
  const navigate = useNavigate();
  const {
    character,
    inventory,
    node,
    currentKey,
    error,
    gameEnded,
    canItemTriggerStory,
    handleRestart,
    handleChoice,
    handleUseItem,
    getGameState,
    setGameState,
    setError,
  } = useGameState();

  const [currentStageId, setCurrentStageId] = useState("start_subway");

  // Update background when stage changes
  useEffect(() => {
    if (node?.stage) {
      setCurrentStageId(node.stage);
    }
  }, [node?.stage]);

  // If there's an error, set the error state
  if (error) return <div>Error: {error}</div>;
  if (!node) return <div>Loading...</div>;

  // If there's no node, return a message
  if (!node) return <div>No story node found.</div>;

  // If the game has ended, show restart options
  if (gameEnded) {
    return (
      <GameEndedScreen
        character={character}
        onRestart={handleRestart}
        onGoHome={() => navigate("/")}
      />
    );
  }

  // If there's a node, return the game content
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background */}
      <Background stageId={currentStageId} />

      {/* Game content overlay */}
      <div className="relative z-10 h-full flex flex-col">
        <SaveLoadControls
          getGameState={getGameState}
          setGameState={setGameState}
        />
        <div className="flex-grow flex flex-col">
          <div className="flex">
            <CharacterInfo character={character} />
            <StoryContent
              node={node}
              currentKey={currentKey}
              onChoice={handleChoice}
            />
          </div>
          <InventoryInfo
            inventory={inventory}
            character={character}
            currentKey={currentKey}
            onUseItem={handleUseItem}
            canItemTriggerStory={canItemTriggerStory}
          />
        </div>
      </div>
    </div>
  );
}

export default GameLayout;
