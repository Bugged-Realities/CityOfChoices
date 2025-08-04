import React, { useState } from "react";
import { saveGameState, loadGameState } from "../api/storyFetch";
import LoadGameModal from "./LoadGameModal";
import type { GameState } from "../types";

interface SavedGameData {
  current_stage?: string;
  current_stats?: {
    fear: number;
    sanity: number;
  };
  inventory_snapshot?: Array<{
    item_name: string;
    used: boolean;
  }>;
  choice_history?: string[];
}

interface SaveLoadControlsProps {
  getGameState: () => GameState;
  setGameState: (data: GameState) => Promise<void>;
}

const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({
  getGameState,
  setGameState,
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedGameData, setSavedGameData] = useState<SavedGameData | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const state = getGameState();
      // Convert GameState to the format expected by the API
      const apiState = {
        ...state,
        inventory_snapshot: state.inventory_snapshot.map((item) => ({
          item_name: item.item_name,
          used: item.used,
        })),
      };
      await saveGameState(apiState);
      setMessage("Game saved!");
    } catch {
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
    } catch {
      setMessage("Failed to load saved game data.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleLoadConfirm = async () => {
    setModalLoading(true);
    setMessage(null);
    try {
      if (savedGameData) {
        // Convert SavedGameData back to GameState format
        const gameState: GameState = {
          current_stage: savedGameData.current_stage || "",
          choice_history: savedGameData.choice_history || [],
          current_stats: savedGameData.current_stats || { fear: 0, sanity: 0 },
          inventory_snapshot:
            savedGameData.inventory_snapshot?.map((item) => ({
              id: 0, // We don't have the original ID, so use 0
              item_name: item.item_name,
              description: "",
              used: item.used,
            })) || [],
        };
        await setGameState(gameState);
        setMessage("Game loaded!");
        setShowLoadModal(false);
      }
    } catch {
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
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-[#5ec3b8] hover:bg-[#55b0a5] disabled:bg-[#8B8A91] text-[#E8E6E3] font-['Press_Start_2P'] font-bold px-3 py-2 rounded-none border-2 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:transform-none disabled:shadow-[1px_1px_0px_0px_rgba(139,138,145,0.8)] relative overflow-hidden group text-xs"
        >
          <span className="relative z-10">
            {loading ? "Saving..." : "Save"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
        </button>

        <button
          onClick={handleLoadClick}
          disabled={loading || modalLoading}
          className="flex-1 bg-[#0A0F1C] hover:bg-[#1A1F2C] text-[#E8E6E3] font-['Press_Start_2P'] font-bold px-3 py-2 rounded-none border-2 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] relative overflow-hidden group text-xs"
        >
          <span className="relative z-10">
            {modalLoading ? "Loading..." : "Load"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
        </button>
      </div>

      {message && (
        <div className="text-center">
          <span className="text-[#5ec3b8] font-['Press_Start_2P'] text-xs">
            {message}
          </span>
        </div>
      )}

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
