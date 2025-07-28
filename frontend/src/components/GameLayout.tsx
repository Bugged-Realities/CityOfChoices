import { useState, useEffect } from "react";
import {
  fetchStoryStart,
  fetchStoryNode,
  postStoryChoice,
  postInventoryItem,
  resetInventory,
  useInventoryItem,
  useItemForStory,
} from "../api/storyFetch";
import {
  fetchCharacter,
  updateCharacterStats,
  restartCharacter,
} from "../api/auth";
import { useNavigate } from "react-router-dom";
import { fetchInventory } from "../api/storyFetch";
import SaveLoadControls from "./SaveLoadControls";

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

function GameLayout() {
  const [character, setCharacter] = useState<any>(null);
  // State variable for the inventory
  const [inventory, setInventory] = useState<any>(null);
  // State Variables for the game
  const [node, setNode] = useState<StoryNode | null>(null);
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
      await restartCharacter(character.id);
      const updatedCharacter = await fetchCharacter();
      setCharacter(updatedCharacter);

      // Reset game state
      setGameEnded(false);
      setError(null);

      // Reload story and inventory
      const storyData = await fetchStoryStart();
      setNode(storyData);
      setCurrentKey(storyData.stage); // <-- Move here, after storyData is defined
      const updatedInventory = await fetchInventory(character.id);
      setInventory(updatedInventory);
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
        setCharacter(data);
        // Fetch inventory after character is loaded
        return fetchInventory(data.id);
      })
      .then((inv) => setInventory(inv))
      .catch(() => setError("Failed to load character or inventory."));
  }, []);

  // Load the inventory on mount
  useEffect(() => {
    if (character) {
      fetchInventory(character.id).then(setInventory);
    }
  }, [character]);

  // Load the first node on mount
  useEffect(() => {
    fetchStoryStart()
      .then((data) => {
        setNode(data);
        setCurrentKey(data.stage); // Set currentKey to the node's stage
      })
      .catch(() => setError("Failed to load story."));
  }, []);

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
      console.log("POST /api/story/choice", {
        current: currentKey,
        choice_index: choiceIndex,
      });
      const data = await postStoryChoice(currentKey, choiceIndex);
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
          setInventory(updatedInventory);
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
        setInventory(updatedInventory);
      }

      setNode(data);
      if (data && data.stage) {
        setCurrentKey(data.stage); // Always update currentKey to the new node's stage
      }
      if (data.stage && data.stage.startsWith("ending") && character) {
        await resetInventory(character.id);
        setInventory([]);
        setGameEnded(true);
      }
    } catch {
      setError("Failed to progress story.");
    }
  };
  // If there's an error, set the error state
  if (error) return <div>Error: {error}</div>;
  if (!node) return <div>Loading...</div>;

  // If there's no node, return a message
  if (!node) return <div>No story node found.</div>;

  // If the game has ended, show restart options
  if (gameEnded) {
    return (
      <div className="game-ended-container">
        <div className="game-ended-content">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You have completed your journey through the City of Choices!</p>
          <div className="final-stats">
            <h3>Final Stats</h3>
            <p>Name: {character?.name}</p>
            <p>Final Fear: {character?.fear}</p>
            <p>Final Sanity: {character?.sanity}</p>
          </div>
          <div className="restart-options">
            <button onClick={handleRestart} className="restart-button">
              🔄 Play Again
            </button>
            <button onClick={() => navigate("/")} className="home-button">
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    // Optionally, fetch the node for the loaded stage
    if (data.current_stage) {
      fetchStoryNode(data.current_stage).then(setNode);
    }
  };

  // If there's a node, return the game content
  return (
    <div className="game-layout-main">
      <SaveLoadControls
        getGameState={getGameState}
        setGameState={setGameState}
      />
      <div className="character-info">
        <h2>Character Info</h2>
        <p>Name: {character?.name}</p>
        <p>Fear: {character?.fear}</p>
        <p>Sanity: {character?.sanity}</p>
      </div>
      <div className="inventory-info">
        <h2>Inventory</h2>
        {inventory && inventory.length > 0 ? (
          <ul>
            {inventory.map((item: any) => (
              <li key={item.id}>
                <span
                  style={
                    item.used
                      ? { textDecoration: "line-through", color: "#888" }
                      : {}
                  }
                >
                  {item.item_name}
                </span>
                {!item.used && (
                  <button
                    onClick={async () => {
                      try {
                        // First, mark the item as used
                        await useInventoryItem(character.id, item.id);

                        // Check if using this item triggers story progression
                        const storyResponse = await useItemForStory(
                          currentKey,
                          item.item_name
                        );

                        // Update inventory
                        const updatedInventory = await fetchInventory(
                          character.id
                        );
                        setInventory(updatedInventory);

                        // If story progression was triggered, update the story
                        if (storyResponse.node) {
                          setNode(storyResponse.node);
                          setCurrentKey(storyResponse.node.title);
                          setError(null); // Clear any previous errors
                        }
                      } catch (error) {
                        console.error("Error using item:", error);
                        setError("Failed to use item.");
                      }
                    }}
                    style={{
                      marginLeft: "8px",
                      backgroundColor: canItemTriggerStory(item.item_name)
                        ? "#4CAF50"
                        : "#2196F3",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    title={
                      canItemTriggerStory(item.item_name)
                        ? "Use item to progress story!"
                        : "Use item"
                    }
                  >
                    {canItemTriggerStory(item.item_name)
                      ? "Use for Story"
                      : "Use"}
                  </button>
                )}
                {item.used && " (used)"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in inventory.</p>
        )}
      </div>
      <div className="game-content">
        <h2>Story</h2>
        <div className="story-node">
          <p>{node?.description}</p>
          {(node?.options || []).map((option, idx) => (
            <button key={idx} onClick={() => handleChoice(idx)}>
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameLayout;
