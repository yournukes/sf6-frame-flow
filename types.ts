export type FrameData = {
  startup: number | string;
  active: number | string;
  // Recovery removed as requested
  onHit: number | string;
  onBlock: number | string;
};

export type MoveType = 'normal' | 'special' | 'super' | 'throw' | 'common';

export interface Move {
  id: string;
  name: string;
  command: string;
  type: MoveType;
  damage: number;
  frames: FrameData;
  tags: string[];
  notes: string;
}

export interface Situation {
  id: string;
  name: string; // e.g., "Midscreen Throw Loop"
  description: string;
  advantage: number; // Frame advantage (+/-)
  tags: string[];
}

export type OkizemeType = 'okizeme' | 'frame-kill';

export interface Okizeme {
  id: string;
  name: string;
  type: OkizemeType; // New field
  minAdvantage: number;
  maxAdvantage: number;
  description: string; // The setup
  afterAdvantage: number; // New field: Advantage after the action
  tags: string[];
}

export interface ComboStep {
  moveId: string;
  note?: string;
}

export interface Combo {
  id: string;
  name: string;
  starterId: string;
  steps: ComboStep[];
  totalDamage: number;
  meterCost: number;
  endSituationAdvantage: number; // Frames after combo ends
  tags: string[]; // If "Down" is here, suggest Oki
  notes: string;
  isFavorite?: boolean; // New field
}

export interface CharacterData {
  id: string;
  name: string;
  masterTags: string[]; // New field for Tag Management
  moves: Move[];
  situations: Situation[];
  combos: Combo[];
  okizeme: Okizeme[];
}

export interface AppState {
  characters: CharacterData[];
  activeCharacterId: string;
}