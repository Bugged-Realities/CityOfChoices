export interface InventoryItem {
  id: number;
  item_name: string;
  description: string;
  used: boolean;
}

export interface Character {
  id: number;
  name: string;
  fear: number;
  sanity: number;
  choice_history?: string[];
}

export interface Option {
  text: string;
  next: string;
  reward?: string;
  stat_changes?: { [key: string]: number };
  consume_item?: boolean;
  required_item?: string;
  required_items?: string[];
}

export interface StoryNode {
  id: number;
  stage: string;
  description: string;
  options: Option[];
  item_triggers?: Array<{
    item: string;
    next: string;
    message: string;
  }>;
  created_at?: string;
}

export interface GameState {
  current_stage: string;
  choice_history: string[];
  current_stats: { fear: number; sanity: number };
  inventory_snapshot: InventoryItem[];
}
