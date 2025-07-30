import React, { useState } from "react";
import { saveGameState, loadGameState } from "../api/storyFetch";
import LoadGameModal from "./LoadGameModal";

interface SaveLoadControlsProps {
  getGameState: () => any;
  setGameState: (data: any) => Promise<void>;
}

const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({
  getGameState,
  setGameState,
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedGameData, setSavedGameData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleLoadClick = async () => {
    setModalLoading(true);
    try {
      const data = await loadGameState();
      setSavedGameData(data);
      setShowLoadModal(true);
    } catch (err) {
      setMessage("Failed to load saved game data.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleLoadConfirm = async () => {
    setModalLoading(true);
    setMessage(null);
    try {
      await setGameState(savedGameData);
      setMessage("Game loaded!");
      setShowLoadModal(false);
    } catch (err) {
      setMessage("Failed to load game.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowLoadModal(false);
    setSavedGameData(null);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleSave}
        disabled={loading}
        style={{ marginRight: 8 }}
      >
        {loading ? "Saving..." : "Save"}
      </button>
      <button onClick={handleLoadClick} disabled={loading || modalLoading}>
        {modalLoading ? "Loading..." : "Load"}
      </button>
      {message && <span style={{ marginLeft: 12 }}>{message}</span>}

      <LoadGameModal
        isOpen={showLoadModal}
        onClose={handleCloseModal}
        onLoad={handleLoadConfirm}
        savedGameData={savedGameData}
        loading={modalLoading}
      />
    </div>
  );
};

export default SaveLoadControls;
