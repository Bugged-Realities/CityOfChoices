// Utility functions for fetching story data
import {
  fetchHandler,
  basicFetchOptions,
  getPostOptions,
} from "../utils/fetchHelpers";

export async function fetchStoryStart() {
  const [data, error] = await fetchHandler(
    "/api/story/start",
    basicFetchOptions
  );
  if (error) throw error;
  return data;
}

// Fetch a story node by key
export async function fetchStoryNode(key: string) {
  const [data, error] = await fetchHandler(
    `/api/story/${key}`,
    basicFetchOptions
  );
  if (error) throw error;
  return data;
}

// Post a choice to the story API
export async function postStoryChoice(current: string, choice_index: number) {
  const [data, error] = await fetchHandler(
    "/api/story/choice",
    getPostOptions({ current, choice_index })
  );
  if (error) throw error;
  return data;
}
