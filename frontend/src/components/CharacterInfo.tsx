import React from "react";

interface CharacterInfoProps {
  character: any;
}

const CharacterInfo: React.FC<CharacterInfoProps> = ({ character }) => {
  if (!character) return null;

  return (
    <div className="w-64 p-6">
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Character Info</h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-white font-medium">{character.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fear:</span>
            <span className="text-white font-medium">{character.fear}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sanity:</span>
            <span className="text-white font-medium">{character.sanity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfo;
