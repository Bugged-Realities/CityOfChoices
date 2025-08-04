import React from "react";

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

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: () => void;
  savedGameData: SavedGameData | null;
  loading: boolean;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  savedGameData,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1F2C] border-2 border-[#5ec3b8] rounded-none p-4 w-full max-w-5xl max-h-[40vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(94,195,184,0.3)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          marginLeft: "calc(25% + 2rem)", // Offset to center over story content
        }}
      >
        <h2 className="text-[#5ec3b8] font-['Press_Start_2P'] text-xl font-bold text-center mb-4">
          🎮 Load Saved Game
        </h2>

        {savedGameData ? (
          <div className="space-y-4">
            <div className="bg-[#0A0F1C] border border-[#5ec3b8] rounded-none p-4">
              <h3 className="text-[#5ec3b8] font-['Press_Start_2P'] text-sm font-bold mb-3">
                Saved Game Details
              </h3>

              <div className="space-y-3 text-[#E8E6E3] font-['Press_Start_2P'] text-xs">
                <div>
                  <strong className="text-[#5ec3b8]">Current Stage:</strong>{" "}
                  <span className="text-[#E05219]">
                    {savedGameData.current_stage || "Unknown"}
                  </span>
                </div>

                {savedGameData.current_stats && (
                  <div>
                    <strong className="text-[#5ec3b8]">Character Stats:</strong>
                    <div className="ml-4 mt-1 space-y-1">
                      <div>
                        Fear:{" "}
                        <span className="text-[#E05219]">
                          {savedGameData.current_stats.fear || 0}
                        </span>
                      </div>
                      <div>
                        Sanity:{" "}
                        <span className="text-[#E05219]">
                          {savedGameData.current_stats.sanity || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {savedGameData.inventory_snapshot &&
                  savedGameData.inventory_snapshot.length > 0 && (
                    <div>
                      <strong className="text-[#5ec3b8]">
                        Inventory Items:
                      </strong>
                      <div className="ml-4 mt-1 space-y-1">
                        {savedGameData.inventory_snapshot.map(
                          (item, index: number) => (
                            <div
                              key={index}
                              className={
                                item.used
                                  ? "text-gray-500 line-through"
                                  : "text-[#5ec3b8]"
                              }
                            >
                              {item.item_name} {item.used && "(used)"}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {savedGameData.choice_history &&
                  savedGameData.choice_history.length > 0 && (
                    <div>
                      <strong className="text-[#5ec3b8]">
                        Choice History:
                      </strong>
                      <div className="ml-4 mt-1 text-xs">
                        {savedGameData.choice_history.length} choices made
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-[#8B8A91] hover:bg-[#6B6A71] disabled:bg-[#6B6A71] text-[#E8E6E3] font-['Press_Start_2P'] font-bold rounded-none border-2 border-[#8B8A91] hover:border-[#6B6A71] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(139,138,145,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(139,138,145,0.8)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:transform-none relative overflow-hidden group text-xs"
              >
                <span className="relative z-10">Cancel</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
              </button>

              <button
                onClick={onLoad}
                disabled={loading}
                className="px-4 py-2 bg-[#5ec3b8] hover:bg-[#55b0a5] disabled:bg-[#8B8A91] text-[#E8E6E3] font-['Press_Start_2P'] font-bold rounded-none border-2 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:transform-none relative overflow-hidden group text-xs"
              >
                <span className="relative z-10">
                  {loading ? "Loading..." : "Load Game"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0A0F1C] border border-[#5ec3b8] rounded-none p-4">
              <p className="text-[#E05219] font-['Press_Start_2P'] text-xs text-center">
                No saved game found. Start a new game to create a save point.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#5ec3b8] hover:bg-[#55b0a5] text-[#E8E6E3] font-['Press_Start_2P'] font-bold rounded-none border-2 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] relative overflow-hidden group text-xs"
              >
                <span className="relative z-10">Close</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadGameModal;
