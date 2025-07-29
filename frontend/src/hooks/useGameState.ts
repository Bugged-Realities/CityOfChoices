import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchStoryStart,
  postStoryChoice,
  postInventoryItem,
  resetInventory,
  useInventoryItem,
  fetchInventory,
  resetCharacter,
} from "../api/storyFetch";
import { fetchCharacter, updateCharacterStats } from "../api/auth";

export const useGameState = (onTextChange?: (text: string) => void) => {
  const [character, setCharacter] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [node, setNode] = useState<any>(null);
  const [currentKey, setCurrentKey] = useState<string>("start");
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
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
      await resetCharacter(character.id);
      await resetInventory(character.id);
      const updatedCharacter = await fetchCharacter();
      setCharacter(updatedCharacter.character);

      // Reset game state
      setGameEnded(false);
      setError(null);

      // Reload story and inventory
      const storyData = await fetchStoryStart();
      setNode(storyData);
      setCurrentKey(storyData.stage);
      const updatedInventory = await fetchInventory(character.id);
      setInventory(updatedInventory.inventory);
    } catch (error) {
      console.error("Error restarting game:", error);
      setError("Failed to restart game.");
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

  // Load the first node on mount - only after character is loaded (which means user is authenticated)
  useEffect(() => {
    if (character) {
      console.log("DEBUG: Character loaded, fetching story data...");
      console.log(
        "DEBUG: Auth token:",
        localStorage.getItem("authToken") ? "Present" : "Missing"
      );

      fetchStoryStart()
        .then((data) => {
          if (data.current_scene) {
            setNode(data.current_scene);
            setCurrentKey(data.current_scene.stage);
          } else {
            setError("No story scene available.");
          }

          // Check for background changes on initial load
          if (onTextChange && data.description) {
            onTextChange(data.description);
          }
        })
        .catch((error) => {
          console.error("DEBUG: Story fetch error:", error);
          setError("Failed to load story.");
        });
    }
  }, [character, onTextChange]);

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

  // Handle choice selection
  const handleChoice = async (choiceIndex: number) => {
    try {
      console.log("Current state before choice:", { currentKey, choiceIndex });

      // Validate currentKey before making request
      let stageToUse = currentKey;
      if (!currentKey || currentKey === "start") {
        if (node && node.stage) {
          console.log("Using node.stage as fallback:", node.stage);
          stageToUse = node.stage;
        } else {
          console.error("Invalid currentKey and no node.stage:", currentKey);
          setError("Invalid story state. Please refresh the page.");
          return;
        }
      }

      const data = await postStoryChoice(stageToUse, choiceIndex);
      console.log("DEBUG: Choice response:", data);
      if (data.error) {
        setError(data.error);
        return;
      }

      const selectedOption = node?.options[choiceIndex];

      // If the choice requires an item, check inventory
      if (
        selectedOption?.consume_item &&
        selectedOption.required_item &&
        character
      ) {
        const hasItem = inventory?.some(
          (item: any) =>
            item.item_name === selectedOption.required_item && !item.used
        );
        if (!hasItem) {
          setError(`You need the ${selectedOption.required_item} to do that!`);
          return;
        }
        // Mark the item as used
        const itemToUse = inventory.find(
          (item: any) =>
            item.item_name === selectedOption.required_item && !item.used
        );
        if (itemToUse) {
          await useInventoryItem(character.id, itemToUse.id);
          const updatedInventory = await fetchInventory(character.id);
          setInventory(updatedInventory.inventory);
        }
      }

      if (selectedOption?.stat_changes && character) {
        const newFear =
          (character.fear || 0) + (selectedOption.stat_changes.fear + 12 || 0);
        const newSanity =
          (character.sanity || 0) +
          (selectedOption.stat_changes.sanity - 10 || 0);
        const updatedCharacter = await updateCharacterStats(character.id, {
          fear: newFear,
          sanity: newSanity,
        });
        setCharacter(updatedCharacter);
      }
      // If the option has a reward, add it to inventory
      if (selectedOption?.reward && character) {
        await postInventoryItem(
          character.id,
          selectedOption.reward,
          "Reward from story choice"
        );
        const updatedInventory = await fetchInventory(character.id);
        setInventory(updatedInventory.inventory);
      }

      setNode(data);
      if (data && data.stage) {
        console.log("Updating currentKey from", currentKey, "to", data.stage);
        setCurrentKey(data.stage);
      }

      // Check for background changes based on story text
      if (onTextChange && data.description) {
        onTextChange(data.description);
      }
      if (data.stage && data.stage.startsWith("ending") && character) {
        await resetInventory(character.id);
        await resetCharacter(character.id);
        const updatedCharacter = await fetchCharacter();
        setCharacter(updatedCharacter.character);
        const updatedInventory = await fetchInventory(
          updatedCharacter.character.id
        );
        setInventory(updatedInventory.inventory);
        setGameEnded(true);
      }
    } catch (error) {
      console.error("Story choice error:", error);
      setError(
        `Failed to progress story: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
  const setGameState = (data: any) => {
    if (data.current_stage) setCurrentKey(data.current_stage);
    if (data.current_stats) {
      setCharacter((prev: any) => ({
        ...prev,
        fear: data.current_stats.fear,
        sanity: data.current_stats.sanity,
      }));
    }
    if (data.inventory_snapshot) setInventory(data.inventory_snapshot);
  };

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
    getGameState,
    setGameState,
    setInventory,
    setNode,
    setCurrentKey,
    setError,
    fetchInventory,
  };
};
