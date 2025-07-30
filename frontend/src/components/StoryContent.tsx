import React from "react";

interface StoryContentProps {
  node: any;
  currentKey: string;
  onChoice: (choiceIndex: number) => Promise<void>;
}

const StoryContent: React.FC<StoryContentProps> = ({
  node,
  currentKey,
  onChoice,
}) => {
  if (!node) return <div>Loading...</div>;

  return (
    <div className="flex-1 p-6">
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Story
        </h2>
        <div className="text-gray-300 space-y-4">
          <p className="text-sm text-gray-400">Current Stage: {currentKey}</p>
          <p className="text-sm text-gray-400">Node ID: {node?.id}</p>
          <p className="text-lg leading-relaxed">{node?.description}</p>
          <div className="space-y-3 mt-6">
            {(node?.options || []).map((option: any, idx: number) => (
              <button
                key={idx}
                onClick={() => onChoice(idx)}
                className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200 text-white hover:text-gray-100"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryContent;
