import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchStoryStart,
  fetchSceneByStage,
  postStoryChoice,
  postInventoryItem,
  resetInventory,
  useInventoryItem,
  useItemForStory,
  resetCharacter,
  saveGameState,
  loadGameState,
} from "../api/storyFetch";
import { fetchCharacter, updateCharacterStats } from "../api/auth";
import { fetchInventory } from "../api/storyFetch";

// Types for the story nodes
type Option = {
  text: string;
  next: string;
  reward?: string;
  stat_changes?: { [key: string]: number };
  consume_item?: boolean;
  required_item?: string;
};

type StoryNode = {
  id: number;
  stage: string;
  description: string;
  options: Option[];
  item_triggers?: Array<{
    item: string;
    next: string;
    message: string;
  }>;
  created_at?: string;
};

export const useGameState = () => {
  const [character, setCharacter] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [currentKey, setCurrentKey] = useState<string>("start");
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Helper function to check if an item can trigger story progression
  const canItemTriggerStory = (itemName: string) => {
    if (!node || !node.item_triggers) return false;
    return node.item_triggers.some((trigger: any) => trigger.item === itemName);
  };

  // Function to restart the game
  const handleRestart = async () => {
    if (!character) return;

    try {
      setIsRestarting(true);
      // First, set gameEnded to false to exit the ending screen
      setGameEnded(false);
      setError(null);

      // Reset character stats and game state
      await resetCharacter(character.id);
      // Reset inventory
      await resetInventory(character.id);

      // Fetch updated character and inventory
      const updatedCharacter = await fetchCharacter();
      setCharacter(updatedCharacter.character);
      const updatedInventory = await fetchInventory(
        updatedCharacter.character.id
      );
      setInventory(updatedInventory.inventory);

      // Reload story
      const storyData = await fetchStoryStart();
      if (storyData.current_scene) {
        setNode(storyData.current_scene);
        setCurrentKey(storyData.current_scene.stage);
      } else {
        setError("No story scene available after restart.");
      }
    } catch (error) {
      console.error("Error restarting game:", error);
      setError("Failed to restart game.");
      // If restart fails, set gameEnded back to true
      setGameEnded(true);
    } finally {
      setIsRestarting(false);
    }
  };

  // Handle choice selection
  const handleChoice = async (choiceIndex: number) => {
    try {
      console.log("Making choice:", choiceIndex, "for stage:", currentKey);
      const data = await postStoryChoice(currentKey, choiceIndex);

      if (data.error) {
        setError(data.error);
        return;
      }

      console.log("Received data from backend:", data);

      const selectedOption = node?.options[choiceIndex];

      // Update character stats if needed
      if (selectedOption?.stat_changes && character) {
        const newFear =
          (character.fear || 0) + (selectedOption.stat_changes.fear || 0);
        const newSanity =
          (character.sanity || 0) + (selectedOption.stat_changes.sanity || 0);

        const updatedCharacter = await updateCharacterStats(character.id, {
          fear: newFear,
          sanity: newSanity,
        });
        setCharacter(updatedCharacter.character);
      }

      // Add reward to inventory if needed
      if (selectedOption?.reward && character) {
        await postInventoryItem(
          character.id,
          selectedOption.reward,
          "Reward from story choice"
        );
        const updatedInventory = await fetchInventory(character.id);
        setInventory(updatedInventory.inventory);
      }

      // Update the story node
      console.log("Setting node to:", data);
      setNode(data);
      console.log("Updated node:", data);
      if (data && data.stage) {
        console.log("Setting currentKey to:", data.stage);
        setCurrentKey(data.stage);
        console.log("Updated currentKey:", data.stage);
      }

      // Check for ending
      if (
        data.stage &&
        data.stage.startsWith("ending") &&
        character &&
        !isRestarting
      ) {
        await resetInventory(character.id);
        await resetCharacter(character.id);
        setInventory([]);
        setGameEnded(true);
      }
    } catch (error) {
      console.error("Story progression error:", error);
      setError("Failed to progress story.");
    }
  };

  // Handle item usage
  const handleUseItem = async (itemId: number, itemName: string) => {
    try {
      // First, mark the item as used
      await useInventoryItem(character.id, itemId);

      // Check if using this item triggers story progression
      const storyResponse = await useItemForStory(currentKey, itemName);

      // Update inventory
      const updatedInventory = await fetchInventory(character.id);
      setInventory(updatedInventory.inventory);

      // If story progression was triggered, update the story
      if (storyResponse && storyResponse.node) {
        console.log(
          "Story progression triggered with node:",
          storyResponse.node
        );
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
          console.log(
            "Ending stage detected after item use:",
            storyResponse.node.stage
          );
          await resetInventory(character.id);
          await resetCharacter(character.id);
          setInventory([]);
          setGameEnded(true);
        }
      } else {
        console.log("No story progression triggered:", storyResponse);
      }
    } catch (error) {
      console.error("Error using item:", error);
      setError("Failed to use item.");
    }
  };

  // Helper to get the current game state for saving
  const getGameState = () => ({
    current_stage: currentKey,
    choice_history: character?.choice_history || [],
    current_stats: { fear: character?.fear, sanity: character?.sanity },
    inventory_snapshot: inventory || [],
  });

  // Helper to set the game state from loaded data
  const setGameState = async (data: any) => {
    console.log("Loading game state:", data);

    if (data.current_stage) {
      setCurrentKey(data.current_stage);
      console.log("Set current stage to:", data.current_stage);
    }

    if (data.current_stats) {
      setCharacter((prev: any) => ({
        ...prev,
        fear: data.current_stats.fear,
        sanity: data.current_stats.sanity,
      }));
      console.log("Updated character stats:", data.current_stats);
    }

    if (data.inventory_snapshot) {
      setInventory(data.inventory_snapshot);
      console.log("Updated inventory:", data.inventory_snapshot);
    }

    // Fetch the story node for the loaded stage
    if (data.current_stage) {
      try {
        console.log("Fetching story node for stage:", data.current_stage);
        const sceneData = await fetchSceneByStage(data.current_stage);
        setNode(sceneData);
        console.log("Loaded story node:", sceneData);

        // Check if the loaded stage is an ending
        if (
          data.current_stage.startsWith("ending") &&
          character &&
          !isRestarting
        ) {
          console.log(
            "Ending stage detected in loaded game:",
            data.current_stage
          );
          await resetInventory(character.id);
          await resetCharacter(character.id);
          setInventory([]);
          setGameEnded(true);
        }
      } catch (error) {
        console.error("Error loading story node:", error);
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
        return fetchInventory(data.character.id);
      })
      .then((inv) => setInventory(inv.inventory))
      .catch(() => setError("Failed to load character or inventory."));
  }, [navigate]);

  // Load the inventory on mount
  useEffect(() => {
    if (character) {
      fetchInventory(character.id).then((inv) => setInventory(inv.inventory));
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
              console.log(
                "Ending stage detected on initial load:",
                data.current_scene.stage
              );
              await resetInventory(character.id);
              await resetCharacter(character.id);
              setInventory([]);
              setGameEnded(true);
            }
          } else {
            setError("No story scene available.");
          }
        } catch (error) {
          console.error("Story loading error:", error);
          setError("Failed to load story. Please try refreshing the page.");
        }
      }
    };

    loadInitialStory();
  }, [character, node]);

  // Clear auth token on page unload
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("authToken");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  // Debug effect to monitor node changes
  useEffect(() => {
    console.log("Node state changed:", node);
  }, [node]);

  // Debug effect to monitor currentKey changes
  useEffect(() => {
    console.log("CurrentKey state changed:", currentKey);
  }, [currentKey]);

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
        console.log("Ending stage detected:", node.stage);
        // Reset inventory and character for ending
        await resetInventory(character.id);
        await resetCharacter(character.id);
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
    canItemTriggerStory,
    handleRestart,
    handleChoice,
    handleUseItem,
    getGameState,
    setGameState,
    setError,
  };
};
