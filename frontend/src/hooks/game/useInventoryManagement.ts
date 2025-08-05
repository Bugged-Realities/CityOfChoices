import {
  consumeInventoryItem,
  triggerItemStoryProgression,
  fetchInventory,
} from "../../api/storyFetch";
import { resetInventory, resetCharacter } from "../../api/storyFetch";
import { validateToken } from "../../api/auth";
import type { InventoryItem, StoryNode } from "../../types";
import {
  handleApiError,
  getErrorMessage,
  logError,
  type ErrorContext,
} from "../../utils/errorHandling";

interface UseInventoryManagementProps {
  currentKey: string;
  node: StoryNode | null;
  setNode: (node: StoryNode | null) => void;
  setCurrentKey: (key: string) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setGameEnded: (ended: boolean) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  character: any;
  isRestarting: boolean;
}

export const useInventoryManagement = ({
  currentKey,
  node,
  setNode,
  setCurrentKey,
  setInventory,
  setGameEnded,
  setError,
  setIsLoading,
  character,
  isRestarting,
}: UseInventoryManagementProps) => {
  // Helper function to check if an item can trigger story progression
  const canItemTriggerStory = (itemName: string) => {
    if (!node || !node.item_triggers) return false;
    return node.item_triggers.some((trigger) => trigger.item === itemName);
  };

  // Handle item usage
  const handleUseItem = async (itemId: number, itemName: string) => {
    const context: ErrorContext = {
      action: "use_item",
      component: "useInventoryManagement",
      additionalInfo: { itemId, itemName, currentKey },
    };

    try {
      // Validate token before using item
      const isValid = await validateToken();
      if (!isValid) {
        setError("Session expired. Please log in again.");
        return;
      }

      setIsLoading(true);
      setError(null);
      // First, mark the item as used
      try {
        await consumeInventoryItem(itemId);
      } catch (consumeError) {
        const gameError = handleApiError(consumeError, {
          ...context,
          action: "consume_inventory_item",
        });
        logError(gameError);
        setError(getErrorMessage(gameError));
        return;
      }

      // Check if using this item triggers story progression
      let storyResponse;
      try {
        storyResponse = await triggerItemStoryProgression(currentKey, itemName);
      } catch (storyError) {
        const gameError = handleApiError(storyError, {
          ...context,
          action: "trigger_item_story",
        });
        logError(gameError);
        setError(getErrorMessage(gameError));
        return;
      }

      // Update inventory
      try {
        const updatedInventory = await fetchInventory();
        setInventory(updatedInventory.inventory);
      } catch (inventoryError) {
        const gameError = handleApiError(inventoryError, {
          ...context,
          action: "fetch_inventory",
        });
        logError(gameError);
        // Don't fail the whole operation if inventory fetch fails
        console.warn("Failed to fetch inventory:", getErrorMessage(gameError));
      }

      // If story progression was triggered, update the story
      if (storyResponse && storyResponse.node) {
        setNode(storyResponse.node);
        setCurrentKey(storyResponse.node.stage);
        setError(null); // Clear any previous errors

        // Check for ending stages after item-triggered story progression
        if (
          storyResponse.node.stage &&
          storyResponse.node.stage.startsWith("ending") &&
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
    canItemTriggerStory,
    handleUseItem,
  };
};
