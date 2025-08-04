import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchStoryStart,
  fetchSceneByStage,
  postStoryChoice,
  postInventoryItem,
  resetInventory,
  consumeInventoryItem,
  triggerItemStoryProgression,
  resetCharacter,
} from "../api/storyFetch";
import { fetchCharacter, updateCharacterStats } from "../api/auth";
import { fetchInventory } from "../api/storyFetch";
import type { InventoryItem, Character, StoryNode, GameState } from "../types";
import {
  handleApiError,
  createGameError,
  getErrorMessage,
  logError,
  type ErrorContext,
} from "../utils/errorHandling";

export const useGameState = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [currentKey, setCurrentKey] = useState<string>("start");
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Helper function to check if an item can trigger story progression
  const canItemTriggerStory = (itemName: string) => {
    if (!node || !node.item_triggers) return false;
    return node.item_triggers.some((trigger) => trigger.item === itemName);
  };

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

  // Function to restart the game
  const handleRestart = async () => {
    if (!character) return;

    const context: ErrorContext = {
      action: "restart_game",
      component: "useGameState",
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

  // Handle choice selection
  const handleChoice = async (choiceIndex: number) => {
    const context: ErrorContext = {
      action: "make_choice",
      component: "useGameState",
      additionalInfo: { choiceIndex, currentKey },
    };

    try {
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
          const newFear =
            (character.fear || 0) + (selectedOption.stat_changes.fear || 0);
          const newSanity =
            (character.sanity || 0) + (selectedOption.stat_changes.sanity || 0);

          const updatedCharacter = await updateCharacterStats({
            fear: newFear,
            sanity: newSanity,
          });
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

  // Handle item usage
  const handleUseItem = async (itemId: number, itemName: string) => {
    const context: ErrorContext = {
      action: "use_item",
      component: "useGameState",
      additionalInfo: { itemId, itemName, currentKey },
    };

    try {
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

    if (data.current_stats) {
      setCharacter((prev) =>
        prev
          ? {
              ...prev,
              fear: data.current_stats.fear,
              sanity: data.current_stats.sanity,
            }
          : null
      );
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

  // Load the character on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCharacter()
      .then((data) => {
        setCharacter(data.character);
        // Fetch inventory after character is loaded
        return fetchInventory();
      })
      .then((inv) => setInventory(inv.inventory))
      .catch(() => setError("Failed to load character or inventory."));
  }, [navigate]);

  // Load the inventory on mount
  useEffect(() => {
    if (character) {
      fetchInventory().then((inv) => setInventory(inv.inventory));
    }
  }, [character]);

  // Load the first node after character is loaded
  useEffect(() => {
    const loadInitialStory = async () => {
      if (character && !node) {
        try {
          const data = await fetchStoryStart();
          // The backend returns the full game data including current_scene
          if (data.current_scene) {
            setNode(data.current_scene);
            setCurrentKey(data.current_scene.stage);

            // Check if the initial stage is an ending
            if (
              data.current_scene.stage &&
              data.current_scene.stage.startsWith("ending") &&
              character &&
              !isRestarting
            ) {
              await resetInventory();
              await resetCharacter();
              setInventory([]);
              setGameEnded(true);
            }
          } else {
            setError("No story scene available.");
          }
        } catch {
          setError("Failed to load story. Please try refreshing the page.");
        }
      }
    };

    loadInitialStory();
  }, [character, node, isRestarting]);

  // Note: Removed automatic token clearing on page unload to prevent authentication issues
  // Token will be cleared only on explicit logout

  // Check for ending stages when node changes
  useEffect(() => {
    const checkForEnding = async () => {
      if (
        node &&
        node.stage &&
        node.stage.startsWith("ending") &&
        character &&
        !isRestarting
      ) {
        // Reset inventory and character for ending
        await resetInventory();
        await resetCharacter();
        setInventory([]);
        setGameEnded(true);
      }
    };

    checkForEnding();
  }, [node, character, isRestarting]);

  return {
    character,
    inventory,
    node,
    currentKey,
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
    setError,
  };
};
