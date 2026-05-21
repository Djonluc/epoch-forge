import { BOOSTS, CIV_POWERS, HEADINGS, SYNERGIES, MAP_TYPES_INFO, ARCHETYPES, MAP_TYPES, PRESET_MODES, POINT_MODES, MAP_SIZES, RESOURCES, GAME_SPEEDS, DEFAULT_NAMES, DOCTRINES } from '../constants';
import { Boost, BoostCategory, CivPower, GeneratedItem, PlayerCiv, AppConfig, ResolvedAppConfig, ConcreteMapType, ConcreteArchetype, Heading, GamePhase, MapType, Difficulty, Archetype, SynergyRule, MapInfo, RandomizableOption, PresetMode, PointUsageMode, MapSize, Resources, GameSpeed, DoctrineTemplate } from '../types';

export class SeededRNG {
    private seed: number;

    constructor(seedStr: string) {
        let h = 0xdeadbeef;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
        }
        this.seed = (h ^ h >>> 16) >>> 0;
        // Fix 7: Warm up RNG — discard first 8 values to reduce seed correlation
        for (let i = 0; i < 8; i++) this.next();
    }

    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    // Weighted pick
    pickWeighted<T>(items: T[], weights: number[]): T {
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);
        let random = this.next() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random < 0) return items[i];
        }
        return items[items.length - 1];
    }

    // Generic pick
    pick<T>(items: T[]): T {
        if (!items || items.length === 0) throw new Error("RNG Pick: Empty pool");
        return items[Math.floor(this.next() * items.length)];
    }
}

export const resolveMatchConfig = (config: AppConfig): ResolvedAppConfig => {
    const rng = new SeededRNG(config.seed);

    // --- Helper: Generic Option Resolver ---
    // Picks Fixed Value or Randomly from Allowed Pool
    const resolveOption = <T>(option: RandomizableOption<T>, defaultValue: T, fallbackPool: T[]): T => {
        if (option.mode === 'fixed') return option.value;

        // Random Mode
        const pool = option.allowed && option.allowed.length > 0 ? option.allowed : fallbackPool;
        return rng.pick(pool);
    };

    // --- 1. Map Type Resolution ---
    let mapType = resolveOption(config.mapType, 'Continental', MAP_TYPES);

    // Apply strict Map Logic (Planets gating, Space priority) 
    if (config.mapType.mode === 'random') {
        let pool = config.mapType.allowed.length ? config.mapType.allowed : MAP_TYPES;

        // Filter out Planets if Era is too early
        if (config.endEpoch < 14) {
            pool = pool.filter(m => !m.startsWith('Planets'));
        }

        if (pool.length === 0) pool = ['Continental']; // Safety fallback

        // Apply Weighted Selection for Map Type
        const spaceMaps = pool.filter(m => MAP_TYPES_INFO[m].category === 'space');
        const normalMaps = pool.filter(m => MAP_TYPES_INFO[m].category !== 'space');

        if (spaceMaps.length > 0 && normalMaps.length > 0) {
            // De-prioritize Space/Planet maps: 1% chance for Space, 99% for Normal
            mapType = rng.next() < 0.01 ? rng.pick(spaceMaps) : rng.pick(normalMaps);
        } else {
            mapType = rng.pick(pool);
        }
    }

    // --- 2. Other Options Resolution ---
    const preset = resolveOption(config.preset, 'Casual', PRESET_MODES);
    const pointUsage = resolveOption(config.pointUsage, 'Efficient', POINT_MODES);
    const mapSize = resolveOption(config.mapSize, 'Large', MAP_SIZES);
    const resources = resolveOption(config.resources, 'Standard', RESOURCES);
    const gameSpeed = resolveOption(config.gameSpeed, 'Standard', GAME_SPEEDS);

    const resolvedConfig: ResolvedAppConfig = {
        numPlayers: config.numPlayers,
        playerNames: Array.from({ length: config.numPlayers }).map((_, i) => {
            const name = config.playerNames[i];
            return (name && name.trim()) ? name : (DEFAULT_NAMES[i] || `OPERATIVE ${i + 1}`);
        }),
        playerArchetypes: [], // Filled below
        startEpoch: config.startEpoch,
        endEpoch: config.endEpoch,
        seed: config.seed, // Persist seed

        // Resolved Values
        preset,
        pointUsage,
        mapType,
        mapSize,
        resources,
        gameSpeed
    };

    // --- 3. Resolve Archetypes ---
    resolvedConfig.playerArchetypes = Array.from({ length: config.numPlayers }).map((_, i) => {
        const arch = config.playerArchetypes[i] || 'Random';
        if (arch !== 'Random') return arch as ConcreteArchetype;
        return rng.pick(ARCHETYPES.filter(a => a !== 'Random')) as ConcreteArchetype;
    });

    return resolvedConfig;
};

const getMatchWeight = (item: Boost | CivPower, config: ResolvedAppConfig): number => {
    const mapInfo = MAP_TYPES_INFO[config.mapType];
    if (!mapInfo) return 1.0;

    const { strategic } = mapInfo;
    let weight = 1.0;

    // 1. Category Weights from Map Info
    const cat = 'category' in item ? item.category : 'Civ – General';
    if (strategic.categoryWeights[cat] !== undefined) {
        weight *= strategic.categoryWeights[cat]!;
    }

    // 2. Tag Weights from Map Info
    item.meta.strategyTags.forEach(tag => {
        if (strategic.tagWeights[tag] !== undefined) {
            weight *= strategic.tagWeights[tag]!;
        }
    });

    // 3. Terrain Affinity
    const mapCat = mapInfo.category;
    if (!item.meta.terrainAffinity.includes(mapCat)) {
        weight *= 0.5; // Slight penalty for off-terrain
        if (mapCat === 'space' && item.meta.terrainAffinity.includes('water')) return 0; // Hard exclusion
        if (mapCat === 'land' && item.meta.terrainAffinity.every(t => t === 'water')) return 0; // Hard exclusion
    }

    return weight;
};

const getDoctrineWeight = (item: Boost | CivPower, doctrine: DoctrineTemplate): number => {
    // Fix 1: Capped ADDITIVE scoring instead of multiplicative explosion
    let bonus = 0;

    // 1. Preferred Tags: additive, capped at +3.0
    let tagBonus = 0;
    item.meta.strategyTags.forEach(tag => {
        if (doctrine.preferredTags.includes(tag)) tagBonus += 0.8;
    });
    bonus += Math.min(tagBonus, 3.0);

    // 2. Forbidden Tags: soft penalty instead of hard zero
    const isForbidden = item.meta.strategyTags.some(tag => doctrine.forbiddenTags.includes(tag));
    if (isForbidden) bonus -= 2.0;

    // 3. Category Affinity: additive
    const cat = 'category' in item ? item.category : '';
    if (doctrine.priorityCategories.includes(cat as any)) bonus += 0.6;

    // 4. Doctrine Affinity (Explicit Match): additive
    if (item.meta.doctrineAffinity.includes(doctrine.id)) bonus += 1.0;

    // Convert to multiplier with floor — max ~5.6×, min 0.1×
    return Math.max(0.1, 1.0 + bonus);
};

const getSynergyWeight = (item: Boost | CivPower, currentItems: GeneratedItem[]): number => {
    // Fix 2: Dampened synergy with diminishing returns
    const itemTags = item.meta.strategyTags;
    const heldTags = new Set(currentItems.flatMap(i => {
        const ref = i.type === 'power' 
            ? CIV_POWERS.find(p => p.name === i.name) 
            : BOOSTS.find(b => b.name === i.name);
        return ref?.meta.strategyTags || [];
    }));

    // 1. Reinforce existing tags with diminishing returns
    const matchCount = itemTags.filter(tag => heldTags.has(tag)).length;
    // 1st match = +0.15, 2nd = +0.10, 3rd+ = +0.05 each, capped
    let bonus = 0;
    for (let i = 0; i < Math.min(matchCount, 4); i++) {
        bonus += Math.max(0.05, 0.15 - (i * 0.05));
    }

    // 2. Anti-Synergy Penalties: soft penalty
    const hasConflict = item.meta.antiSynergyTags.some(tag => heldTags.has(tag));
    if (hasConflict) bonus -= 0.5;

    return Math.max(0.15, 1.0 + bonus);
};

const selectDoctrine = (rng: SeededRNG, config: ResolvedAppConfig, archetype: ConcreteArchetype, excludeDoctrineIds: string[] = []): DoctrineTemplate => {
    const mapInfo = MAP_TYPES_INFO[config.mapType];
    const mapCat = mapInfo.category;

    // Fix 3: Filter out doctrines already used by other players in this match
    let pool = DOCTRINES.filter(d => 
        d.mapPreference.includes(mapCat) && 
        !excludeDoctrineIds.includes(d.id)
    );
    // Fallback: if all map-compatible doctrines are excluded, allow repeats but still filter by map
    if (pool.length === 0) pool = DOCTRINES.filter(d => d.mapPreference.includes(mapCat));
    // Ultimate fallback
    if (pool.length === 0) pool = [...DOCTRINES];

    // Archetype Influence — reduced from 5:1 to 3:1 ratio
    const archetypeMap: Record<ConcreteArchetype, string[]> = {
        'Economic': ['economic_boom', 'air_superiority', 'wonder_race', 'fast_epoch'],
        'Aggressive': ['infantry_rush', 'guerilla_warfare', 'mechanized_assault', 'cyber_dominance'],
        'Defensive': ['defensive_turtle', 'siege_attrition', 'wonder_race', 'prophet_warfare'],
        'Naval': ['naval_domination'],
        'Balanced': ['economic_boom', 'infantry_rush', 'guerilla_warfare', 'defensive_turtle', 'wonder_race']
    };

    const preferredIds = archetypeMap[archetype] || [];
    const weightedPool = pool.flatMap(d => {
        const count = preferredIds.includes(d.id) ? 3 : 1; // Reduced from 5:1 to 3:1
        return Array(count).fill(d);
    });

    return rng.pick(weightedPool);
};

export const generateCivForPlayer = (
    config: ResolvedAppConfig,
    playerName: string,
    playerIndex: number,
    forceSeed?: string,
    ensurePower: boolean = false,
    excludeDoctrineIds: string[] = []
): PlayerCiv => {
    const seedString = forceSeed || `${config.seed}-${playerName}-${playerIndex}`;
    const rng = new SeededRNG(seedString);
    const archetype = config.playerArchetypes[playerIndex];

    // 1. SELECT DOCTRINE (The "Soul" of the Civ)
    const doctrine = selectDoctrine(rng, config, archetype, excludeDoctrineIds);

    let points = 100;
    const items: GeneratedItem[] = [];
    const categoryCounts: Record<string, number> = {};
    const takenItems = new Set<string>();

    // 2. Filter valid pool based on epochs
    const validBoosts = BOOSTS.filter(b => {
        const heading = HEADINGS.find(h => h.name === b.category);
        return heading && heading.minEpoch <= config.endEpoch;
    });

    const validPowers = CIV_POWERS.filter(p => p.minEpoch <= config.endEpoch);

    // Helper to get dynamic cost
    const getBoostCost = (boost: Boost) => {
        const heading = HEADINGS.find(h => h.name === boost.category);
        const count = categoryCounts[boost.category] || 0;
        return boost.baseCost + (count * (heading?.bonusCost || 0));
    };

    // 3. STRATEGIC POWER SELECTION (Super Powers)
    // Distribution: 10% for 0 | 70% for 1 | 15% for 2 | 5% for 3
    let targetPowers = 1;
    const powerRoll = rng.next();
    if (powerRoll < 0.10) targetPowers = 0;
    else if (powerRoll < 0.80) targetPowers = 1;
    else if (powerRoll < 0.95) targetPowers = 2;
    else targetPowers = 3;

    for (let i = 0; i < targetPowers; i++) {
        const candidates = validPowers.filter(p => {
            const weight = getMatchWeight(p, config) * getDoctrineWeight(p, doctrine);
            return weight > 0 && p.cost <= points && !takenItems.has(p.name);
        });

        if (candidates.length > 0) {
            const weights = candidates.map(p => getMatchWeight(p, config) * getDoctrineWeight(p, doctrine));
            const selection = rng.pickWeighted(candidates, weights);
            items.push({
                name: selection.name,
                cost: selection.cost,
                originalCost: selection.cost,
                type: 'power',
                description: selection.description,
                trace: 'Strategic Power Allocation'
            });
            points -= selection.cost;
            takenItems.add(selection.name);
        }
    }

    // 4. STRATEGIC SELECTION LOOP
    let loopLimit = 0;
    const MAX_LOOPS = 500;

    while (points > 0 && loopLimit < MAX_LOOPS) {
        loopLimit++;

        const affordableOptions = [
            ...validBoosts.filter(b => !takenItems.has(b.name) && getBoostCost(b) <= points)
                .map(b => ({ type: 'boost' as const, item: b, cost: getBoostCost(b) }))
            // CivPowers are no longer picked in the general loop to enforce the exact probability distribution
        ];

        if (affordableOptions.length === 0) break;

        // Point Usage Mode logic
        if (config.pointUsage === 'Efficient' && points <= 3) break;
        if (config.pointUsage === 'Loose' && points <= 12) break;

        // Calculate Weights
        const weights = affordableOptions.map(o => {
            let w = getMatchWeight(o.item, config);
            w *= getDoctrineWeight(o.item, doctrine);
            w *= getSynergyWeight(o.item, items);

            // Fix 5: Category diversity enforcement — diminishing returns after 3 picks
            if (o.type === 'boost') {
                const catCount = categoryCounts[o.item.category] || 0;
                if (catCount >= 3) w *= 0.5;
                if (catCount >= 5) w *= 0.25;
            }

            // Preset modifiers
            if (config.preset === 'Chaos') w *= (0.5 + rng.next() * 2);

            return w;
        });

        // Exact mode fallback
        let candidatePool = affordableOptions;
        let finalWeights = weights;
        if (config.pointUsage === 'Exact' && points < 15) {
            const exactMatches = affordableOptions.filter(o => o.cost === points);
            if (exactMatches.length > 0) {
                candidatePool = exactMatches;
                finalWeights = exactMatches.map((_, i) => weights[affordableOptions.indexOf(exactMatches[i])]);
            }
        }

        // Safety check for 0 weights
        if (finalWeights.every(w => w === 0)) {
            finalWeights = finalWeights.map(() => 1);
        }

        // Fix 4: Exploration randomness — 15% chance to ignore weights entirely
        const EXPLORATION_RATE = 0.15;
        let selection;
        let trace: string;
        if (rng.next() < EXPLORATION_RATE) {
            selection = candidatePool[Math.floor(rng.next() * candidatePool.length)];
            trace = `Exploration pick (strategic diversity)`;
        } else {
            selection = rng.pickWeighted(candidatePool, finalWeights);
            trace = `Aligned with ${doctrine.name}`;
            if (getMatchWeight(selection.item, config) > 1.3) trace = `Map-optimized for ${config.mapType}`;
        }

        if (selection.type === 'boost') {
            const b = selection.item as Boost;
            const heading = HEADINGS.find(h => h.name === b.category)!;
            const count = categoryCounts[b.category] || 0;

            items.push({
                name: b.name,
                cost: selection.cost,
                originalCost: b.baseCost,
                type: 'boost',
                category: b.category,
                inflationApplied: count * heading.bonusCost,
                description: b.name,
                trace
            });
            categoryCounts[b.category] = count + 1;
        } else {
            const p = selection.item as CivPower;
            items.push({
                name: p.name,
                cost: p.cost,
                originalCost: p.cost,
                type: 'power',
                description: p.description,
                trace
            });
        }

        points -= selection.cost;
        takenItems.add(selection.item.name);
    }

    // 5. VALIDATION & RATINGS
    const ratings = { early: 0, mid: 0, late: 0 };
    items.forEach(item => {
        const ref = item.type === 'power' ? CIV_POWERS.find(p => p.name === item.name) : BOOSTS.find(b => b.name === item.name);
        if (ref) {
            ref.tags.forEach(t => {
                if (t === GamePhase.EARLY) ratings.early += item.cost;
                if (t === GamePhase.MID) ratings.mid += item.cost;
                if (t === GamePhase.LATE) ratings.late += item.cost;
            });
        }
    });

    const normalize = (val: number) => Math.min(5, Math.max(1, Math.round(val / 15)));

    // Summary & Reasoning
    const primaryCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
    const winCondition = doctrine.winCondition;
    
    let summary = `${doctrine.name} strategy focusing on ${winCondition}.`;
    const getMeta = (item: GeneratedItem) => (item.type === 'power' ? CIV_POWERS.find(p => p.name === item.name) : BOOSTS.find(b => b.name === item.name))?.meta;
    
    if (items.some(i => getMeta(i)?.strategyTags.includes('Swarm'))) summary += " Relies on overwhelming numbers.";
    if (items.some(i => getMeta(i)?.strategyTags.includes('Tech'))) summary += " Prioritizes technological dominance.";

    let reasoning = `Engine prioritized the ${doctrine.name} doctrine for the ${config.mapType} terrain.`;
    reasoning += ` Strategy optimized for ${doctrine.militaryIdentity} military and ${doctrine.ecoFocus} economy.`;

    // Name Generation Logic
    let civName = "The Forge Alliance";
    const allTags = items.flatMap(i => getMeta(i)?.strategyTags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    
    if (topTags.includes('Stealth') || topTags.includes('Raiding')) civName = "The Shadow Syndicate";
    else if (topTags.includes('Defensive') || topTags.includes('Turtle') || topTags.includes('Armor')) civName = "The Iron Bastion";
    else if (topTags.includes('Cyber') || topTags.includes('Tech')) civName = "The Neon Directorate";
    else if (topTags.includes('Religion') || topTags.includes('Magic')) civName = "The Divine Order";
    else if (topTags.includes('Naval') || topTags.includes('Water')) civName = "The Sapphire Armada";
    else if (topTags.includes('Space') || topTags.includes('Automation')) civName = "The Astral Vanguard";
    else if (topTags.includes('Swarm') || topTags.includes('Rush')) civName = "The Crimson Tide";
    else if (topTags.includes('Boom') || topTags.includes('Wealth')) civName = "The Gilded Empire";
    else civName = `The ${primaryCat.split('–')[0].trim()} Coalition`;

    return {
        id: `civ-${playerIndex}-${Date.now()}`,
        playerName,
        civName,
        pointsSpent: 100 - points,
        items: items.sort((a, b) => (a.category || '').localeCompare(b.category || '')),
        ratings: {
            early: normalize(ratings.early),
            mid: normalize(ratings.mid),
            late: normalize(ratings.late)
        },
        summary,
        powerScore: Math.round((100 - points) + (items.length * 2)),
        seed: seedString,
        primaryCategory: primaryCat,
        difficulty: items.length > 8 ? 'Advanced' : 'Intermediate',
        reasoning,
        warnings: [],
        rerollUsed: false,
        synergies: (function detectSynergies(itemsList: GeneratedItem[]): SynergyRule[] {
            const itemNames = new Set(itemsList.map(i => i.name));
            return SYNERGIES.filter(rule => rule.items.every(req => itemNames.has(req)));
        })(items),
        isValid: true,
        doctrine: {
            id: doctrine.id,
            name: doctrine.name,
            winCondition: doctrine.winCondition,
            description: doctrine.description,
            ecoFocus: doctrine.ecoFocus
        }
    };
};
