import { useState, useEffect } from "react";
import {
  fetchStoryStart,
  fetchStoryNode,
  postStoryChoice,
} from "../api/storyFetch";
import { fetchCharacter } from "../api/auth";
import { useNavigate } from "react-router-dom";

// Types for the story nodes
type Choice = { text: string; next: string };
type StoryNode = {
  background: string;
  prompt: string;
  choices: Choice[];
};

function GameLayout() {
  const [character, setCharacter] = useState<any>(null);
  // State Variables for the game
  const [node, setNode] = useState<StoryNode | null>(null);
  const [currentKey, setCurrentKey] = useState<string>("start");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load the character on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCharacter()
      .then((data) => setCharacter(data))
      .catch(() => setError("Failed to load character."));
  }, []);

  // Load the first node on mount
  useEffect(() => {
    fetchStoryStart()
      .then((data) => {
        setNode(data);
        setCurrentKey("start");
      })
      .catch(() => setError("Failed to load story."));
  }, []);

  // Handle choice selection
  const handleChoice = (choiceIndex: number) => {
    postStoryChoice(currentKey, choiceIndex)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setNode(data);
          // Find the next key from the previous node's choices
          if (node && node.choices[choiceIndex]) {
            setCurrentKey(node.choices[choiceIndex].next);
          }
        }
      })
      .catch(() => setError("Failed to progress story."));
  };
  // If there's an error, set the error state
  if (error) return <div>Error: {error}</div>;
  if (!node) return <div>Loading...</div>;

  // If there's no node, return a message
  if (!node) return <div>No story node found.</div>;

  // If there's a node, return the game content
  return (
    <div>
      <div className="character-info">
        <h2>Character Info</h2>
        <p>Name: {character?.name}</p>
        <p>Fear: {character?.fear}</p>
        <p>Sanity: {character?.sanity}</p>
        <p>Created At: {character?.created_at}</p>
      </div>
      <div className="game-content">
        <h2>Story</h2>
        <div className="story-node">
          <p>{node?.background}</p>
          <p>{node?.prompt}</p>
          {node?.choices.map((choice, idx) => (
            <button key={idx} onClick={() => handleChoice(idx)}>
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameLayout;
