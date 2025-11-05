import {
  postStoryChoice,
  fetchInventory,
  resetInventory,
  resetCharacter,
  postInventoryItem,
} from "../../api/storyFetch";
import { updateCharacterStats, validateToken } from "../../api/auth";
import type { InventoryItem, Character, StoryNode } from "../../types";
import {
  handleApiError,
  createGameError,
  getErrorMessage,
  logError,
  type ErrorContext,
} from "../../utils/errorHandling";

interface UseChoiceManagementProps {
  character: Character | null;
  inventory: InventoryItem[];
  currentKey: string;
  node: StoryNode | null;
  setNode: (node: StoryNode | null) => void;
  setCurrentKey: (key: string) => void;
  setCharacter: (character: Character | null) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setGameEnded: (ended: boolean) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  isRestarting: boolean;
}

export const useChoiceManagement = ({
  character,
  inventory,
  currentKey,
  node,
  setNode,
  setCurrentKey,
  setCharacter,
  setInventory,
  setGameEnded,
  setError,
  setIsLoading,
  isRestarting,
}: UseChoiceManagementProps) => {
  // Helper function to check if a choice requires items and if the player has them
  const canMakeChoice = (choiceIndex: number) => {
    if (!node || !node.options || choiceIndex >= node.options.length)
      return true;

    const option = node.options[choiceIndex];
    if (!option) return true;

    // Check for single required item
    if (option.required_item) {
      const hasItem = inventory.some(
        (item) => item.item_name === option.required_item && !item.used
      );
      if (!hasItem) return false;
    }

    // Check for multiple required items
    if (option.required_items) {
      for (const requiredItem of option.required_items) {
        const hasItem = inventory.some(
          (item) => item.item_name === requiredItem && !item.used
        );
        if (!hasItem) return false;
      }
    }

    return true;
  };

  // Helper function to get missing items for a choice
  const getMissingItemsForChoice = (choiceIndex: number) => {
    if (!node || !node.options || choiceIndex >= node.options.length) return [];

    const option = node.options[choiceIndex];
    if (!option) return [];

    const missingItems = [];

    // Check for single required item
    if (option.required_item) {
      const hasItem = inventory.some(
        (item) => item.item_name === option.required_item && !item.used
      );
      if (!hasItem) {
        missingItems.push(option.required_item);
      }
    }

    // Check for multiple required items
    if (option.required_items) {
      for (const requiredItem of option.required_items) {
        const hasItem = inventory.some(
          (item) => item.item_name === requiredItem && !item.used
        );
        if (!hasItem) {
          missingItems.push(requiredItem);
        }
      }
    }

    return missingItems;
  };

  // Handle choice selection
  const handleChoice = async (choiceIndex: number) => {
    const context: ErrorContext = {
      action: "make_choice",
      component: "useChoiceManagement",
      additionalInfo: { choiceIndex, currentKey },
    };

    try {
      // Validate token before making choice
      const isValid = await validateToken();
      if (!isValid) {
        setError("Session expired. Please log in again.");
        return;
      }

      setIsLoading(true);
      setError(null);
      const data = await postStoryChoice(currentKey, choiceIndex);
      if (data.error) {
        const gameError = createGameError(data.error, context, data);
        logError(gameError);
        setError(getErrorMessage(gameError));
        return;
      }

      const selectedOption = node?.options[choiceIndex];

      // Update character stats if needed
      if (selectedOption?.stat_changes && character) {
        try {
          // Add small random variation (±2 points)
          const randomFear = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const randomSanity = Math.floor(Math.random() * 5) - 2; // -2 to +2

          const newFear = Math.max(
            0,
            Math.min(
              100,
              (character.fear || 0) +
                (selectedOption.stat_changes.fear || 0) +
                randomFear
            )
          );
          const newSanity = Math.max(
            0,
            Math.min(
              100,
              (character.sanity || 0) +
                (selectedOption.stat_changes.sanity || 0) +
                randomSanity
            )
          );

          console.log("Fear calculation:", {
            currentFear: character.fear,
            statChange: selectedOption.stat_changes.fear,
            randomVariation: randomFear,
            newFear: newFear,
          });

          const updatedCharacter = await updateCharacterStats({
            fear: newFear,
            sanity: newSanity,
          });
          console.log("updatedCharacter", updatedCharacter);
          setCharacter(updatedCharacter.character);
        } catch (statsError) {
          const gameError = handleApiError(statsError, {
            ...context,
            action: "update_character_stats",
          });
          logError(gameError);
          // Don't fail the whole choice if stats update fails
          console.warn(
            "Failed to update character stats:",
            getErrorMessage(gameError)
          );
        }
      }

      // Add reward to inventory if needed
      if (selectedOption?.reward && character) {
        try {
          await postInventoryItem(
            selectedOption.reward,
            "Reward from story choice"
          );
          const updatedInventory = await fetchInventory();
          setInventory(updatedInventory.inventory);
        } catch (inventoryError) {
          const gameError = handleApiError(inventoryError, {
            ...context,
            action: "add_inventory_item",
          });
          logError(gameError);
          // Don't fail the whole choice if inventory update fails
          console.warn(
            "Failed to add inventory item:",
            getErrorMessage(gameError)
          );
        }
      }

      // Update the story node
      setNode(data);
      if (data && data.stage) {
        setCurrentKey(data.stage);
      }

      // Check for ending
      if (
        data.stage &&
        data.stage.startsWith("ending") &&
        character &&
        !isRestarting
      ) {
        try {
          await resetInventory();
          await resetCharacter();
          setInventory([]);
          setGameEnded(true);
        } catch (endingError) {
          const gameError = handleApiError(endingError, {
            ...context,
            action: "handle_ending",
          });
          logError(gameError);
          // Still set game ended even if cleanup fails
          setGameEnded(true);
        }
      }
    } catch (error) {
      const gameError = handleApiError(error, context);
      logError(gameError);
      setError(getErrorMessage(gameError));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    canMakeChoice,
    getMissingItemsForChoice,
    handleChoice,
  };
};
