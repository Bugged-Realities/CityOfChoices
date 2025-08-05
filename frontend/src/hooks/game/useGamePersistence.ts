import {
  fetchSceneByStage,
  resetInventory,
  resetCharacter,
} from "../../api/storyFetch";
import type { GameState, Character } from "../../types";

interface UseGamePersistenceProps {
  currentKey: string;
  character: Character | null;
  inventory: any[];
  setCurrentKey: (key: string) => void;
  setCharacter: (character: Character | null) => void;
  setInventory: (inventory: any[]) => void;
  setNode: (node: any) => void;
  setGameEnded: (ended: boolean) => void;
  setError: (error: string | null) => void;
  isRestarting: boolean;
}

export const useGamePersistence = ({
  currentKey,
  character,
  inventory,
  setCurrentKey,
  setCharacter,
  setInventory,
  setNode,
  setGameEnded,
  setError,
  isRestarting,
}: UseGamePersistenceProps) => {
  // Helper to get the current game state for saving
  const getGameState = (): GameState => ({
    current_stage: currentKey,
    choice_history: character?.choice_history || [],
    current_stats: {
      fear: character?.fear || 0,
      sanity: character?.sanity || 0,
    },
    inventory_snapshot: inventory || [],
  });

  // Helper to set the game state from loaded data
  const setGameState = async (data: GameState) => {
    if (data.current_stage) {
      setCurrentKey(data.current_stage);
    }

    if (data.current_stats && character) {
      setCharacter({
        ...character,
        fear: data.current_stats.fear,
        sanity: data.current_stats.sanity,
      });
    }

    if (data.inventory_snapshot) {
      setInventory(data.inventory_snapshot);
    }

    // Fetch the story node for the loaded stage
    if (data.current_stage) {
      try {
        const sceneData = await fetchSceneByStage(data.current_stage);
        setNode(sceneData);

        // Check if the loaded stage is an ending
        if (
          data.current_stage.startsWith("ending") &&
          character &&
          !isRestarting
        ) {
          await resetInventory();
          await resetCharacter();
          setInventory([]);
          setGameEnded(true);
        }
      } catch {
        setError("Failed to load story node.");
      }
    }
  };

  return {
    getGameState,
    setGameState,
  };
};
