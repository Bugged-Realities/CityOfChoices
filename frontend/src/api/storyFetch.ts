// Utility functions for fetching story data
import {
  fetchHandler,
  basicFetchOptions,
  getPostOptions,
  getPutOptions,
  deleteOptions,
} from "../utils/fetchHelpers";

export async function fetchStoryStart() {
  const [data, error] = await fetchHandler(
    "/api/game/start",
    getPostOptions({})
  );
  if (error) throw error;
  return data;
}

// Post a choice to the story API
export async function postStoryChoice(current: string, choice_index: number) {
  const [data, error] = await fetchHandler(
    "/api/game/choice",
    getPostOptions({ current, choice_index })
  );
  if (error) throw error;
  return data;
}

// Use an item for story progression
export async function useItemForStory(current: string, item_name: string) {
  const [data, error] = await fetchHandler(
    "/api/game/use-item",
    getPostOptions({ current, item_name })
  );
  if (error) throw error;
  return data;
}

//Fetch inventory items
export async function fetchInventory(character_id: number) {
  const [data, error] = await fetchHandler(
    "/api/inventory/",
    basicFetchOptions()
  );
  if (error) throw error;
  return data;
}

// Post an item to the inventory
export async function postInventoryItem(
  character_id: number,
  item_name: string,
  description: string
) {
  const [data, error] = await fetchHandler(
    "/api/inventory/add",
    getPostOptions({ item_name, description })
  );
  if (error) throw error;
  return data;
}

export async function deleteInventoryItem(
  character_id: number,
  item_id: number
) {
  const [data, error] = await fetchHandler(
    `/api/inventory/${character_id}/${item_id}`,
    deleteOptions
  );
  if (error) throw error;
  return data;
}

export async function useInventoryItem(character_id: number, item_id: number) {
  const [data, error] = await fetchHandler(
    `/api/inventory/${item_id}/use`,
    getPutOptions({})
  );
  if (error) throw error;
  return data;
}

export async function resetInventory(character_id: number) {
  const [data, error] = await fetchHandler(
    "/api/inventory/reset",
    getPostOptions({})
  );
  if (error) throw error;
  return data;
}

export async function resetCharacter(character_id: number) {
  const [data, error] = await fetchHandler(
    "/api/characters/reset",
    getPostOptions({})
  );
  if (error) throw error;
  return data;
}

export async function saveGameState(gameState: any) {
  const token = localStorage.getItem("authToken");
  const [data, error] = await fetchHandler(
    "/api/auth/save",
    getPostOptions({ ...gameState, token })
  );
  if (error) throw error;
  return data;
}

export async function loadGameState() {
  const token = localStorage.getItem("authToken");
  const [data, error] = await fetchHandler(
    "/api/auth/load",
    basicFetchOptions()
  );
  if (error) throw error;
  return data;
}
