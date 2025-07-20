import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Choice = { text: string; next: string };
type StoryNode = {
  background: string;
  prompt: string;
  choices: Choice[];
};

function GamePage() {
  const [node, setNode] = useState<StoryNode | null>(null);
  const [currentKey, setCurrentKey] = useState<string>("start");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch the start node on mount
  useEffect(() => {
    fetch("/api/story/start")
      .then((res) => res.json())
      .then((data) => {
        setNode(data);
        setCurrentKey("start");
      })
      .catch(() => setError("Failed to load story."));
  }, []);

  // Handle choice selection
  const handleChoice = (choiceIndex: number) => {
    fetch("/api/story/choice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: currentKey, choice_index: choiceIndex }),
    })
      .then((res) => res.json())
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

  if (error) return <div>Error: {error}</div>;
  if (!node) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, (the story background)</h2>
      <div>
        <strong>{node.background}</strong>
      </div>
      <div>
        <p>{node.prompt}</p>
        {node.choices.map((choice, idx) => (
          <button key={idx} onClick={() => handleChoice(idx)}>
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GamePage;
