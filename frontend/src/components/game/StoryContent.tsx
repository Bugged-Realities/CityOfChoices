import React from "react";
import type { Option, StoryNode } from "../../types";

interface StoryContentProps {
  node: StoryNode | null;
  onChoice: (choiceIndex: number) => void;
  canMakeChoice?: (choiceIndex: number) => boolean;
  getMissingItemsForChoice?: (choiceIndex: number) => string[];
}

const StoryContent: React.FC<StoryContentProps> = ({
  node,
  onChoice,
  canMakeChoice,
  getMissingItemsForChoice,
}) => {
  return (
    <>
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-4 border border-white/20 shadow-lg h-full flex flex-col w-full">
        <h2 className="text-lg font-bold text-white text-center mb-3">
          Transmission...
        </h2>
        <div className="text-gray-300 space-y-3 flex-1 flex flex-col">
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-[#E8E6E3]">
              {node?.description}
            </p>
          </div>
          <div className="space-y-2 mt-auto">
            {(node?.options || []).map((option: Option, idx: number) => {
              const canMake = canMakeChoice ? canMakeChoice(idx) : true;
              const missingItems = getMissingItemsForChoice
                ? getMissingItemsForChoice(idx)
                : [];
              const hasRequiredItems =
                option.required_item || option.required_items;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    // Validate choice index before calling onChoice
                    if (idx >= 0 && idx < (node?.options?.length || 0)) {
                      onChoice(idx);
                    } else {
                      console.error(`Invalid choice index: ${idx}`);
                    }
                  }}
                  disabled={!canMake}
                  className={`w-full text-left p-3 rounded-none border-2 transition-all duration-300 text-sm font-['Press_Start_2P'] relative overflow-hidden group ${
                    canMake
                      ? "bg-[#0A0F1C] hover:bg-[#1A1F2C] border-[#5ec3b8] hover:border-[#55b0a5] shadow-[2px_2px_0px_0px_rgba(94,195,184,0.5)] hover:shadow-[3px_3px_0px_0px_rgba(94,195,184,0.7)] transform hover:translate-x-[-1px] hover:translate-y-[-1px] text-[#E8E6E3] hover:text-white"
                      : "bg-[#1A1F2C] border-[#8B8A91] text-[#8B8A91] cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="relative z-10">
                    <span>{option.text}</span>
                    {hasRequiredItems && (
                      <div className="text-xs mt-1 opacity-70">
                        {option.required_item && (
                          <span className="text-[#5ec3b8]">
                            Requires: {option.required_item}
                          </span>
                        )}
                        {option.required_items && (
                          <span className="text-[#5ec3b8]">
                            Requires: {option.required_items.join(", ")}
                          </span>
                        )}
                        {!canMake && missingItems.length > 0 && (
                          <div className="text-red-400 mt-1">
                            Missing: {missingItems.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {canMake && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryContent;
