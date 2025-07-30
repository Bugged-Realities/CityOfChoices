import React from "react";

interface InventoryInfoProps {
  inventory: any[];
  character: any;
  currentKey: string;
  onUseItem: (itemId: number, itemName: string) => Promise<void>;
  canItemTriggerStory: (itemName: string) => boolean;
}

const InventoryInfo: React.FC<InventoryInfoProps> = ({
  inventory,
  character,
  currentKey,
  onUseItem,
  canItemTriggerStory,
}) => {
  if (!inventory) return null;

  return (
    <div className="p-6">
      <div className="backdrop-blur-md bg-black/30 rounded-lg p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Inventory</h2>
        <div className="space-y-3">
          {inventory && inventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                >
                  <span
                    className={`flex-1 ${
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
                      className={`ml-2 px-3 py-1 rounded text-white text-sm transition-all duration-200 ${
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
                    <span className="ml-2 text-gray-500 text-sm">(used)</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No items in inventory.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryInfo;
