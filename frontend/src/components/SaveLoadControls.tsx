import React, { useState } from "react";
import { saveGameState, loadGameState } from "../api/storyFetch";

interface SaveLoadControlsProps {
  getGameState: () => any;
  setGameState: (data: any) => void;
}

const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({
  getGameState,
  setGameState,
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const state = getGameState();
      await saveGameState(state);
      setMessage("Game saved!");
    } catch (err) {
      setMessage("Failed to save game.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await loadGameState();
      setGameState(data);
      setMessage("Game loaded!");
    } catch (err) {
      setMessage("Failed to load game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleSave}
        disabled={loading}
        style={{ marginRight: 8 }}
      >
        Save
      </button>
      <button onClick={handleLoad} disabled={loading}>
        Load
      </button>
      {message && <span style={{ marginLeft: 12 }}>{message}</span>}
    </div>
  );
};

export default SaveLoadControls;
