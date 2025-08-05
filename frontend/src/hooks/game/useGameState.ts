import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchStoryStart,
  fetchInventory,
  resetInventory,
  resetCharacter,
} from "../../api/storyFetch";
import { fetchCharacter, validateToken } from "../../api/auth";
import type { InventoryItem, Character, StoryNode } from "../../types";
import { useChoiceManagement } from "./useChoiceManagement";
import { useInventoryManagement } from "./useInventoryManagement";
import { useGameRestart } from "./useGameRestart";
import { useGamePersistence } from "./useGamePersistence";

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

  // Initialize specialized hooks
  const choiceManagement = useChoiceManagement({
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
  });

  const inventoryManagement = useInventoryManagement({
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
  });

  const gameRestart = useGameRestart({
    character,
    setCharacter,
    setInventory,
    setNode,
    setCurrentKey,
    setGameEnded,
    setError,
    setIsRestarting,
  });

  const gamePersistence = useGamePersistence({
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
  });

  // Load the character on mount with token validation
  useEffect(() => {
    const initializeGame = async () => {
      // Validate token first
      const isValid = await validateToken();
      if (!isValid) {
        navigate("/login");
        return;
      }

      // Token is valid, load character and inventory
      try {
        const characterData = await fetchCharacter();
        setCharacter(characterData.character);

        const inventoryData = await fetchInventory();
        setInventory(inventoryData.inventory);
      } catch (error) {
        setError("Failed to load character or inventory.");
      }
    };

    initializeGame();
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
    // State
    character,
    inventory,
    node,
    currentKey,
    error,
    gameEnded,
    isLoading,

    // Choice management
    canMakeChoice: choiceManagement.canMakeChoice,
    getMissingItemsForChoice: choiceManagement.getMissingItemsForChoice,
    handleChoice: choiceManagement.handleChoice,

    // Inventory management
    canItemTriggerStory: inventoryManagement.canItemTriggerStory,
    handleUseItem: inventoryManagement.handleUseItem,

    // Game restart
    handleRestart: gameRestart.handleRestart,

    // Game persistence
    getGameState: gamePersistence.getGameState,
    setGameState: gamePersistence.setGameState,

    // Error handling
    setError,
  };
};
