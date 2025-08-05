import React from "react";
import SaveLoadControls from "../save-load/SaveLoadControls";
import type { Character, GameState } from "../../types";

interface CharacterInfoProps {
  character: Character | null;
  getGameState?: () => GameState;
  setGameState?: (data: GameState) => Promise<void>;
}

const CharacterInfo: React.FC<CharacterInfoProps> = ({
  character,
  getGameState,
  setGameState,
}) => {
  if (!character) return null;

  return (
    <>
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-3 border border-white/20 shadow-lg h-full flex flex-col">
        <h2 className="text-lg font-bold text-white mb-3 text-center">
          Status
        </h2>

        <div className="space-y-3 text-gray-300 text-sm flex-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-white font-medium">{character.name}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Fear:</span>
              <span className="text-white font-medium">{character.fear}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(character.fear, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Sanity:</span>
              <span className="text-white font-medium">{character.sanity}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(character.sanity, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Save/Load Controls */}
        {getGameState && setGameState && (
          <div className="mt-auto pt-3 border-t border-white/10">
            <SaveLoadControls
              getGameState={getGameState}
              setGameState={setGameState}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CharacterInfo;
