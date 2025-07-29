import { useState, useEffect } from "react";
import {
  fetchStoryStart,
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

      // Reset game state
      setGameEnded(false);
      setError(null);

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
  }, []);

  // Load the inventory on mount
  useEffect(() => {
    if (character) {
      fetchInventory(character.id).then((inv) => setInventory(inv.inventory));
    }
  }, [character]);

  // Load the first node after character is loaded
  useEffect(() => {
    if (character) {
      fetchStoryStart()
        .then((data) => {
          // The backend returns the full game data including current_scene
          if (data.current_scene) {
            setNode(data.current_scene);
            setCurrentKey(data.current_scene.stage);
          } else {
            setError("No story scene available.");
          }
        })
        .catch((error) => {
          console.error("Story loading error:", error);
          setError("Failed to load story. Please try refreshing the page.");
        });
    }
  }, [character]);

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
      const data = await postStoryChoice(currentKey, choiceIndex);

      if (data.error) {
        setError(data.error);
        return;
      }

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
      setNode(data);
      console.log("Updated node:", data);
      if (data && data.stage) {
        setCurrentKey(data.stage);
        console.log("Updated currentKey:", data.stage);
      }

      // Check for ending
      if (data.stage && data.stage.startsWith("ending") && character) {
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
    // Note: We can't fetch a specific story node by stage with the current backend
    // The backend only provides /api/game/start which returns the current scene
    // For now, we'll need to restart the game to get the proper scene data
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
                        setInventory(updatedInventory.inventory);

                        // If story progression was triggered, update the story
                        if (storyResponse && storyResponse.current_node) {
                          setNode(storyResponse.current_node);
                          setCurrentKey(storyResponse.current_node.stage);
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
