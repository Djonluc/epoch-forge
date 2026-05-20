
export enum GamePhase {
    EARLY = 'Early',
    MID = 'Mid',
    LATE = 'Late'
}

export type BoostCategory =
    | "Civ – Economy"
    | "Civ – Economy"
    | "Civ – Buildings, Walls & Towers"
    | "Civ – General"
    | "Citizens & Fishing Boats"
    | "Infantry – Ranged"
    | "Infantry – Sword / Spear"
    | "Cavalry – Ranged"
    | "Cavalry – Melee"
    | "Siege Weapons & Mobile AA"
    | "Tanks"
    | "Aircraft"
    | "Ships"
    | "Cyber"
    | "Religion";

export interface Heading {
    name: BoostCategory;
    bonusCost: number;
    minEpoch: number;
}

export interface Boost {
    name: string;
    baseCost: number;
    category: BoostCategory;
    tags: GamePhase[];
    meta: StrategicMetadata; // New strategic layer
}

export interface CivPower {
    name: string;
    cost: number;
    minEpoch: number; 
    maxEpoch: number; 
    tags: GamePhase[];
    description?: string;
    meta: StrategicMetadata; // New strategic layer
}

export interface GeneratedItem {
    name: string;
    cost: number;
    originalCost: number;
    type: 'boost' | 'power';
    category?: BoostCategory;
    inflationApplied?: number;
    description?: string;
    trace?: string; // Decision trace: Why this specific item was chosen
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Archetype = 'Random' | 'Economic' | 'Aggressive' | 'Defensive' | 'Naval' | 'Balanced';

export interface StrategicMetadata {
    strategyTags: string[];        // ['Rush', 'Stealth', 'Cheap', 'Boom', 'Turtle']
    terrainAffinity: MapCategory[]; // Affinity for land, water, space
    doctrineAffinity: string[];    // IDs of doctrines this item excels in
    antiSynergyTags: string[];     // Tags that this item conflicts with
    role: 'Core' | 'Support' | 'Scaling' | 'Tech';
    unitFocus?: string[];          // ['Infantry', 'Tanks', 'Ships']
}

export interface SynergyRule {
    name: string;
    items: string[];
    description: string;
}

export interface DoctrineTemplate {
    id: string;
    name: string;
    description: string;
    preferredTags: string[];
    forbiddenTags: string[];
    priorityCategories: BoostCategory[];
    ecoFocus: 'Aggressive' | 'Stable' | 'Greedy';
    militaryIdentity: 'Swarm' | 'Elite' | 'Technical' | 'Heavy';
    mapPreference: MapCategory[];
    winCondition: string;
}

export interface PlayerCiv {
    id: string;
    playerName: string;
    pointsSpent: number;
    items: GeneratedItem[];
    ratings: {
        early: number;
        mid: number;
        late: number;
    };
    summary: string;
    powerScore: number;
    seed: string;
    primaryCategory: string; 
    difficulty: Difficulty;
    reasoning: string;
    warnings: string[];
    rerollUsed: boolean;
    synergies: SynergyRule[];
    isValid: boolean;
    doctrine?: {
        id: string;
        name: string;
        winCondition: string;
    };
}

export type PresetMode = 'Casual' | 'Tournament' | 'Chaos' | 'Historical';
export type PointUsageMode = 'Efficient' | 'Exact' | 'Loose';
export type MapSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge';
export type Resources = 'Low' | 'Standard' | 'High';
export type GameSpeed = 'Slow' | 'Standard' | 'Fast';
export type MapCategory = 'land' | 'water' | 'mixed' | 'space';

export type MapType =
    | "Continental"
    | "Mediterranean"
    | "Highlands"
    | "Plains"
    | "Large Islands"
    | "Small Islands"
    | "Tournament Islands"
    | "Neo Continental"
    | "Neo Islands"
    | "Planets – Earth"
    | "Planets – Large"
    | "Planets – Small"
    | "Planets – Mars"
    | "Planets – Satellite"
    | "Planets – Satellite";

export interface MapInfo {
    id: MapType;
    label: string;
    description: string;
    category: MapCategory;
    navalSupport: boolean;
    minEpoch?: number; // For Planets
}

export interface RandomizableOption<T> {
    mode: 'fixed' | 'random';
    value: T; // The selection when in Fixed mode
    allowed: T[]; // The allowed pool when in Random mode
}

export interface AppConfig {
    numPlayers: number;
    playerNames: string[];
    playerArchetypes: Archetype[]; // Parallel array to playerNames
    startEpoch: number;
    endEpoch: number;
    seed: string;

    // Randomizable Settings (Mode + Pool Pattern)
    mapType: RandomizableOption<MapType>;
    preset: RandomizableOption<PresetMode>;
    pointUsage: RandomizableOption<PointUsageMode>;
    mapSize: RandomizableOption<MapSize>;
    resources: RandomizableOption<Resources>;
    gameSpeed: RandomizableOption<GameSpeed>;

    // Epochs (Simple for now, can be upgraded later)

    isEndEpochRandom: boolean;
    endEpochMin: number;
    endEpochMax: number;
}

export type ConcreteMapType = Exclude<MapType, 'Random'>;
export type ConcretePresetMode = Exclude<PresetMode, 'Random'>; // PresetMode currently doesn't have Random in Enum but it's good practice
export type ConcretePointUsageMode = Exclude<PointUsageMode, 'Random'>; // PointUsageMode doesn't have Random either
export type ConcreteArchetype = Exclude<Archetype, 'Random'>;

export interface ResolvedAppConfig {
    numPlayers: number;
    playerNames: string[];
    playerArchetypes: ConcreteArchetype[];
    startEpoch: number;
    endEpoch: number;
    seed: string;

    // These MUST be concrete values, never 'Random'
    preset: PresetMode;
    pointUsage: PointUsageMode;
    mapType: ConcreteMapType;
    mapSize: MapSize;
    resources: Resources;
    gameSpeed: GameSpeed;
}
