import React, { useState } from "react";

interface Character {
  id: number;
  name: string;
  fear: number;
  sanity: number;
}

interface GameEndedScreenProps {
  character: Character | null;
  endingDescription?: string;
  onRestart: () => Promise<void>;
  onGoHome: () => void;
}

const GameEndedScreen: React.FC<GameEndedScreenProps> = ({
  character,
  endingDescription,
  onRestart,
  onGoHome,
}) => {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    if (isRestarting) return; // Prevent multiple clicks

    setIsRestarting(true);
    try {
      await onRestart();
    } catch (error) {
      console.error("Restart failed:", error);
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C] relative">
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235ec3b8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(94,195,184,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(94,195,184,0.02) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center pt-16 pb-20 px-4">
          <div className="w-full max-w-md">
            <div className="bg-[#1A1F2C] border border-[#5ec3b8] rounded-lg p-8 shadow-xl backdrop-blur-sm">
              <h1 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold text-center mb-8">
                Game Complete!
              </h1>

              {endingDescription && (
                <div className="bg-[#0A0F1C] border border-[#5ec3b8] rounded-lg p-6 mb-8">
                  <h3 className="text-[#5ec3b8] font-['Press_Start_2P'] text-lg font-bold text-center mb-4">
                    Your Ending
                  </h3>
                  <p className="text-[#E8E6E3] font-['Press_Start_2P'] text-sm leading-relaxed text-center">
                    {endingDescription}
                  </p>
                </div>
              )}

              <div className="bg-[#0A0F1C] border border-[#5ec3b8] rounded-lg p-6 mb-8">
                <h3 className="text-[#5ec3b8] font-['Press_Start_2P'] text-lg font-bold text-center mb-4">
                  Final Stats
                </h3>
                <div className="space-y-3 text-[#E8E6E3] font-['Press_Start_2P'] text-sm">
                  <p>
                    Name:{" "}
                    <span className="text-[#E05219]">{character?.name}</span>
                  </p>
                  <p>
                    Final Fear:{" "}
                    <span className="text-[#E05219]">{character?.fear}</span>
                  </p>
                  <p>
                    Final Sanity:{" "}
                    <span className="text-[#E05219]">{character?.sanity}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRestart}
                  disabled={isRestarting}
                  className="w-full bg-[#5ec3b8] hover:bg-[#55b0a5] disabled:bg-[#8B8A91] text-[#E8E6E3] font-['Press_Start_2P'] font-bold px-6 py-3 rounded-none border-4 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:transform-none disabled:shadow-[2px_2px_0px_0px_rgba(139,138,145,0.8)] relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {isRestarting ? "Restarting..." : "Play Again"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                </button>

                <button
                  onClick={onGoHome}
                  className="w-full bg-[#0A0F1C] hover:bg-[#1A1F2C] text-[#E8E6E3] font-['Press_Start_2P'] font-bold px-6 py-3 rounded-none border-4 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] relative overflow-hidden group"
                >
                  <span className="relative z-10">Back to Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GameEndedScreen;
