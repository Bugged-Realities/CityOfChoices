// Utility functions for fetching story data
import {
  fetchHandler,
  basicFetchOptions,
  getPostOptions,
  getPutOptions,
  deleteOptions,
} from "../utils/fetchHelpers";

export async function fetchStoryStart() {
  try {
    const [data, error] = await fetchHandler(
      "/api/game/start",
      getPostOptions({})
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch story start:", error);
    throw error;
  }
}

export async function fetchSceneByStage(stage: string) {
  try {
    const [data, error] = await fetchHandler(
      `/api/game/scene/${stage}`,
      basicFetchOptions()
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to fetch scene for stage ${stage}:`, error);
    throw error;
  }
}

// Post a choice to the story API
export async function postStoryChoice(current: string, choice_index: number) {
  try {
    const [data, error] = await fetchHandler(
      "/api/game/choice",
      getPostOptions({ current, choice_index })
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to post story choice:", error);
    throw error;
  }
}

// Use an item for story progression
export async function triggerItemStoryProgression(
  current: string,
  item_name: string
) {
  try {
    const [data, error] = await fetchHandler(
      "/api/game/use-item",
      getPostOptions({ current, item_name })
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to trigger item story progression:", error);
    throw error;
  }
}

//Fetch inventory items
export async function fetchInventory() {
  try {
    const [data, error] = await fetchHandler(
      "/api/inventory/",
      basicFetchOptions()
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    throw error;
  }
}

// Post an item to the inventory
export async function postInventoryItem(
  item_name: string,
  description: string
) {
  try {
    const [data, error] = await fetchHandler(
      "/api/inventory/add",
      getPostOptions({ item_name, description })
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to post inventory item:", error);
    throw error;
  }
}

export async function deleteInventoryItem(item_id: number) {
  try {
    const [data, error] = await fetchHandler(
      `/api/inventory/${item_id}`,
      deleteOptions
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to delete inventory item ${item_id}:`, error);
    throw error;
  }
}

export async function consumeInventoryItem(item_id: number) {
  try {
    const [data, error] = await fetchHandler(
      `/api/inventory/${item_id}/use`,
      getPutOptions({})
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to consume inventory item ${item_id}:`, error);
    throw error;
  }
}

export async function resetInventory() {
  try {
    const [data, error] = await fetchHandler(
      "/api/inventory/reset",
      getPostOptions({})
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to reset inventory:", error);
    throw error;
  }
}

export async function resetCharacter() {
  try {
    const [data, error] = await fetchHandler(
      "/api/characters/reset",
      getPostOptions({})
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to reset character:", error);
    throw error;
  }
}

export async function saveGameState(gameState: Record<string, unknown>) {
  try {
    const [data, error] = await fetchHandler(
      "/api/auth/save",
      getPostOptions({ ...gameState })
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to save game state:", error);
    throw error;
  }
}

export async function loadGameState() {
  try {
    const [data, error] = await fetchHandler(
      "/api/auth/load",
      basicFetchOptions()
    );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to load game state:", error);
    throw error;
  }
}
