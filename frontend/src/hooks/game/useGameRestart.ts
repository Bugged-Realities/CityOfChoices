import {
  resetCharacter,
  resetInventory,
  fetchInventory,
  fetchStoryStart,
} from "../../api/storyFetch";
import { fetchCharacter } from "../../api/auth";
import type { Character } from "../../types";
import {
  handleApiError,
  createGameError,
  getErrorMessage,
  logError,
  type ErrorContext,
} from "../../utils/errorHandling";

interface UseGameRestartProps {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  setInventory: (inventory: any[]) => void;
  setNode: (node: any) => void;
  setCurrentKey: (key: string) => void;
  setGameEnded: (ended: boolean) => void;
  setError: (error: string | null) => void;
  setIsRestarting: (restarting: boolean) => void;
}

export const useGameRestart = ({
  character,
  setCharacter,
  setInventory,
  setNode,
  setCurrentKey,
  setGameEnded,
  setError,
  setIsRestarting,
}: UseGameRestartProps) => {
  // Function to restart the game
  const handleRestart = async () => {
    if (!character) return;

    const context: ErrorContext = {
      action: "restart_game",
      component: "useGameRestart",
      additionalInfo: { characterId: character.id },
    };

    try {
      setIsRestarting(true);
      // First, set gameEnded to false to exit the ending screen
      setGameEnded(false);
      setError(null);

      // Reset character stats and game state
      try {
        await resetCharacter();
      } catch (resetError) {
        const gameError = handleApiError(resetError, {
          ...context,
          action: "reset_character",
        });
        logError(gameError);
        setError(getErrorMessage(gameError));
        setGameEnded(true);
        return;
      }

      // Reset inventory
      try {
        await resetInventory();
      } catch (inventoryError) {
        const gameError = handleApiError(inventoryError, {
          ...context,
          action: "reset_inventory",
        });
        logError(gameError);
        // Continue even if inventory reset fails
        console.warn("Failed to reset inventory:", getErrorMessage(gameError));
      }

      // Fetch updated character and inventory
      let updatedCharacter;
      try {
        updatedCharacter = await fetchCharacter();
        setCharacter(updatedCharacter.character);
      } catch (characterError) {
        const gameError = handleApiError(characterError, {
          ...context,
          action: "fetch_character",
        });
        logError(gameError);
        setError(getErrorMessage(gameError));
        setGameEnded(true);
        return;
      }

      try {
        const updatedInventory = await fetchInventory();
        setInventory(updatedInventory.inventory);
      } catch (inventoryError) {
        const gameError = handleApiError(inventoryError, {
          ...context,
          action: "fetch_inventory",
        });
        logError(gameError);
        // Continue even if inventory fetch fails
        console.warn("Failed to fetch inventory:", getErrorMessage(gameError));
      }

      // Reload story
      try {
        const storyData = await fetchStoryStart();
        if (storyData.current_scene) {
          setNode(storyData.current_scene);
          setCurrentKey(storyData.current_scene.stage);
        } else {
          const gameError = createGameError(
            "No story scene available after restart.",
            context
          );
          logError(gameError);
          setError(getErrorMessage(gameError));
        }
      } catch (storyError) {
        const gameError = handleApiError(storyError, {
          ...context,
          action: "fetch_story_start",
        });
        logError(gameError);
        setError(getErrorMessage(gameError));
        setGameEnded(true);
      }
    } catch (error) {
      const gameError = handleApiError(error, context);
      logError(gameError);
      setError(getErrorMessage(gameError));
      // If restart fails, set gameEnded back to true
      setGameEnded(true);
    } finally {
      setIsRestarting(false);
    }
  };

  return {
    handleRestart,
  };
};
