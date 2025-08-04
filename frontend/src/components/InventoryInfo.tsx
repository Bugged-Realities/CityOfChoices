import React from "react";
import type { InventoryItem } from "../types";

interface InventoryInfoProps {
  inventory: InventoryItem[];
  onUseItem: (itemId: number, itemName: string) => Promise<void>;
  canItemTriggerStory: (itemName: string) => boolean;
}

const InventoryInfo: React.FC<InventoryInfoProps> = ({
  inventory,
  onUseItem,
  canItemTriggerStory,
}) => {
  if (!inventory) return null;

  return (
    <>
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-3 border border-white/20 shadow-lg h-full">
        <h2 className="text-lg font-bold text-white mb-3 text-center">
          Inventory
        </h2>
        <div className="space-y-2">
          {inventory && inventory.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {inventory.map((item: InventoryItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                >
                  <span
                    className={`flex-1 text-xs ${
                      item.used ? "text-gray-500 line-through" : "text-gray-300"
                    }`}
                  >
                    {item.item_name}
                  </span>
                  {!item.used && (
                    <button
                      onClick={async () => {
                        await onUseItem(item.id, item.item_name);
                      }}
                      className={`ml-1 px-2 py-1 rounded text-white text-xs transition-all duration-200 ${
                        canItemTriggerStory(item.item_name)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      title={
                        canItemTriggerStory(item.item_name)
                          ? "Use item to progress story!"
                          : "Use item"
                      }
                    >
                      {canItemTriggerStory(item.item_name)
                        ? "Use for Story"
                        : "Use"}
                    </button>
                  )}
                  {item.used && (
                    <span className="ml-1 text-gray-500 text-xs">(used)</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm text-center">
              No items in inventory.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryInfo;
