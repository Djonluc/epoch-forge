import { BOOSTS, CIV_POWERS, HEADINGS, SYNERGIES, MAP_TYPES_INFO, ARCHETYPES, MAP_TYPES, PRESET_MODES, POINT_MODES, MAP_SIZES, RESOURCES, GAME_SPEEDS } from '../constants';
import { Boost, BoostCategory, CivPower, GeneratedItem, PlayerCiv, AppConfig, ResolvedAppConfig, ConcreteMapType, ConcreteArchetype, Heading, GamePhase, MapType, Difficulty, Archetype, SynergyRule, MapInfo, RandomizableOption, PresetMode, PointUsageMode, MapSize, Resources, GameSpeed } from '../types';

export class SeededRNG {
    private seed: number;

    constructor(seedStr: string) {
        let h = 0xdeadbeef;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
        }
        this.seed = (h ^ h >>> 16) >>> 0;
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
            // De-prioritize Space/Planet maps: 5% chance for Space, 95% for Normal
            mapType = rng.next() < 0.05 ? rng.pick(spaceMaps) : rng.pick(normalMaps);
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
        playerNames: config.playerNames,
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
    resolvedConfig.playerArchetypes = config.playerArchetypes.map(arch => {
        if (arch !== 'Random') return arch as ConcreteArchetype;
        return rng.pick(ARCHETYPES.filter(a => a !== 'Random')) as ConcreteArchetype;
    });

    return resolvedConfig;
};

const getMatchWeight = (item: Boost | CivPower, config: ResolvedAppConfig): number => {
    let weight = 1.0;
    const name = item.name.toLowerCase();
    const cat = 'category' in item ? item.category : '';
    const mapInfo = MAP_TYPES_INFO[config.mapType];

    if (!mapInfo) return 1.0;

    // 1. Strict Naval Exclusion
    if (mapInfo.navalSupport === false) {
        if (cat === 'Ships' || name.includes('fishing') || name.includes('naval')) return 0;
    }

    // 2. Map Category Weighting
    if (mapInfo.category === 'land') {
        if (cat.includes('Infantry') || cat.includes('Buildings') || cat.includes('Economy')) weight = 1.4;
        if (cat.includes('Cavalry')) weight = 1.2;
    } else if (mapInfo.category === 'water') {
        if (cat === 'Ships' || name.includes('fishing')) weight = 3.0;
        if (cat.includes('Cavalry')) weight = 0.5;
    } else if (mapInfo.category === 'mixed') {
        if (cat === 'Ships') weight = 1.2;
    } else if (mapInfo.category === 'space') {
        if (cat === 'Aircraft' || cat === 'Tanks' || cat === 'Cyber') weight = 2.5;
        if (name.includes('farming') || name.includes('hunting')) weight = 0.1;
        if (cat === 'Ships') return 0;
    }

    // 3. Specific Map Nuances
    if (mapInfo.id === 'Large Islands' || mapInfo.id === 'Small Islands' || mapInfo.id === 'Tournament Islands') {
        if (name === 'Expansionism') weight = 2.0;
    }

    // 4. Map Size Weighting
    if (config.mapSize === 'Tiny' || config.mapSize === 'Small') {
        if (name.includes('infantry') || name.includes('attack') || name === 'expansionism' || cat.includes('Infantry')) weight *= 1.3;
        if (cat.includes('Economy') || cat.includes('Buildings')) weight *= 0.8;
    } else if (config.mapSize === 'Large' || config.mapSize === 'Huge') {
        if (cat.includes('Economy')) weight *= 1.3;
        if (cat.includes('Cavalry')) weight *= 1.2;
        if (cat.includes('Infantry')) weight *= 0.9;
    }

    // 5. Resources Weighting
    const baseCost = 'cost' in item ? item.cost : item.baseCost;
    if (config.resources === 'Low') {
        if (cat.includes('Economy')) weight *= 1.4;
        if (name.includes('discount') || name.includes('cheap')) weight *= 1.3;
        if (baseCost > 30) weight *= 0.7;
    } else if (config.resources === 'High') {
        if (baseCost > 30) weight *= 1.3;
        if (cat.includes('Tanks') || cat.includes('Aircraft')) weight *= 1.2;
    }

    // 6. Game Speed Weighting
    if (config.gameSpeed === 'Fast') {
        // Boosts tagged 'Early' get a nudge
        if ('tags' in item && (item as any).tags?.includes('Early')) weight *= 1.3;
    } else if (config.gameSpeed === 'Slow') {
        if (cat.includes('Economy')) weight *= 1.2;
        if ('tags' in item && (item as any).tags?.includes('Late')) weight *= 1.3;
    }

    return weight;
};

// Bias weights based on user preference
const getArchetypeBias = (item: Boost | CivPower, archetype: ConcreteArchetype): number => {
    if (!archetype) return 1.0;

    const cat = 'category' in item ? item.category : '';
    const name = item.name;
    let weight = 1.0;

    switch (archetype) {
        case 'Economic':
            if (cat.includes('Economy') || cat.includes('Citizens')) weight = 1.3;
            if (name === 'Market' || name === 'Advanced Mining') weight = 1.3;
            break;
        case 'Aggressive':
            if (cat.includes('Infantry') || cat.includes('Cavalry') || cat.includes('Tanks')) weight = 1.25;
            if (name.includes('Attack')) weight = 1.2;
            if (name === 'Expansionism') weight = 1.3;
            break;
        case 'Defensive':
            if (cat.includes('Buildings') || cat.includes('Walls') || name.includes('Hit Points')) weight = 1.3;
            if (name === 'Priest Tower') weight = 1.3;
            break;
        case 'Naval':
            if (cat.includes('Ships') || name.includes('Fishing')) weight = 1.5;
            break;
        case 'Balanced':
            // Slight penalty to extreme specialization items to encourage spread
            if (cat.includes('Cyber') || cat.includes('Religion')) weight = 0.8;
            break;
    }
    return weight;
};

export const generateCivForPlayer = (
    config: ResolvedAppConfig,
    playerName: string,
    playerIndex: number,
    forceSeed?: string,
    ensurePower: boolean = false
): PlayerCiv => {
    // Unique seed per player based on main seed + name + index
    const seedString = forceSeed || `${config.seed}-${playerName}-${playerIndex}`;
    const rng = new SeededRNG(seedString);
    const archetype = config.playerArchetypes[playerIndex]; // guaranteed Concrete

    let points = 100;
    const items: GeneratedItem[] = [];
    const categoryCounts: Record<string, number> = {};
    const takenItems = new Set<string>();
    const warnings: string[] = [];

    // Map vs Archetype Warnings (Generated once)
    // Update warning to check navalSupport property instead of hardcoded 'Land'/'Space'
    // But we don't have MAP_TYPES_INFO[config.mapType] easily accessible unless we import it or look it up.
    // We imported it.
    const mapInfo = MAP_TYPES_INFO[config.mapType];
    if (archetype === 'Naval' && mapInfo && mapInfo.navalSupport === false) {
        warnings.push(`Naval archetype preference was suppressed due to ${config.mapType} map rules.`);
    }

    // 1. Filter valid pool based on epochs
    const validBoosts = BOOSTS.filter(b => {
        // Find heading to check min epoch
        const heading = HEADINGS.find(h => h.name === b.category);
        if (!heading) return false;
        return heading.minEpoch <= config.endEpoch;
    });

    const validPowers = CIV_POWERS.filter(p =>
        p.minEpoch <= config.endEpoch // Power starts before game ends
    );

    // 2. Pre-selection Logic for ensurePower (MANDATORY UPDATE)
    if (ensurePower) {
        // STRICT: We MUST find a power. If standard filtering fails, we relax constraints (but never Map rules if possible)
        let candidates = validPowers.filter(p => {
            // Strict check using weight function (handles naval/map logic)
            if (getMatchWeight(p, config) === 0) return false;
            return p.cost <= points;
        });

        // Fallback: If no affordable powers fit the map perfectly, allow ANY affordable valid power
        // WARNING: This breaks 'Strict Map' rules if we are forced to pick *something*.
        // But the user requested "Guaranteed Civ Power". 
        // We will try to pick the "least bad" option? Or just pick one.
        if (candidates.length === 0) {
            candidates = validPowers.filter(p => p.cost <= points);
        }

        if (candidates.length > 0) {
            const weights = candidates.map(p => getMatchWeight(p, config) * getArchetypeBias(p, archetype));
            // If weights are 0 because of fallback, treat them as 1.0 (uniform random fallback)
            const safeWeights = weights.map(w => w === 0 ? 1.0 : w);
            const p = rng.pickWeighted(candidates, safeWeights);

            items.push({
                name: p.name,
                cost: p.cost,
                originalCost: p.cost,
                type: 'power',
                description: p.description
            });
            points -= p.cost;
            takenItems.add(p.name);
            categoryCounts['Power'] = (categoryCounts['Power'] || 0) + 1;
        }
    }

    // Helper to get cost
    const getBoostCost = (boost: Boost) => {
        const heading = HEADINGS.find(h => h.name === boost.category);
        const count = categoryCounts[boost.category] || 0;
        const bonus = heading ? heading.bonusCost : 0;
        return boost.baseCost + (count * bonus);
    };

    // Mode Adjustments
    let loopLimit = 0;
    const MAX_LOOPS = 500;

    while (points > 0 && loopLimit < MAX_LOOPS) {
        loopLimit++;

        // Calculate all currently affordable options
        const affordableBoosts = validBoosts.filter(b => {
            if (takenItems.has(b.name)) return false;
            if (getMatchWeight(b, config) === 0) return false; // Map Exclusion
            return getBoostCost(b) <= points;
        });

        const affordablePowers = validPowers.filter(p => {
            if (takenItems.has(p.name)) return false;
            if (getMatchWeight(p, config) === 0) return false; // Map Exclusion
            return p.cost <= points;
        });

        const options = [
            ...affordableBoosts.map(b => ({ type: 'boost' as const, item: b, cost: getBoostCost(b) })),
            ...affordablePowers.map(p => ({ type: 'power' as const, item: p, cost: p.cost }))
        ];

        // Stop if no affordable items exist
        if (options.length === 0) break;

        // --- Point Usage Logic ---

        // Efficient: Stop if <= 5 points left (Avoid scraping bottom)
        if (config.pointUsage === 'Efficient' && points <= 5) break;

        // Loose: Stop if <= 15 points left (More random/casual)
        if (config.pointUsage === 'Loose' && points <= 15) break;

        // Exact: Try to hit 0. 
        // If we have < 10 points, prioritize items that get us closer to 0 or hit 0 exactly.
        // If no item hits 0, it falls through to normal selection (best effort).
        let candidateOptions = options;

        if (config.pointUsage === 'Exact' && points < 20) {
            const exactMatches = options.filter(o => o.cost === points);
            if (exactMatches.length > 0) {
                candidateOptions = exactMatches; // FORCE exact match
            }
        }

        // Apply Map Weights + Preset Modifiers
        const weights = candidateOptions.map(o => {
            let w = getMatchWeight(o.item, config);

            // Apply Archetype Bias (Soft Nudge)
            w *= getArchetypeBias(o.item, archetype);

            // PRESET: Historical (Fewer AoC powers, more stat boosts)
            if (config.preset === 'Historical') {
                if (o.type === 'power') w *= 0.2;
                if (o.type === 'boost') w *= 1.2;
            }

            // PRESET: Chaos (Extreme builds - Momentum)
            if (config.preset === 'Chaos' && o.type === 'boost' && o.item.category) {
                const c = categoryCounts[o.item.category] || 0;
                if (c > 0) w *= 2.0; // Heavy momentum
            }

            // PRESET: Tournament (Tight balance, low variance)
            if (config.preset === 'Tournament') {
                // Slight bias towards efficient/standard play
                // We can slightly punish extremely high inflation items to keep it grounded
                if (o.type === 'boost' && o.cost > 20) w *= 0.8;
            }

            // SYNERGY BIAS (Fine-tuning for "Builds that make sense")
            // If we have items in a category, drastically increase weight of same-category items
            if (o.type === 'boost' && o.item.category) {
                const count = categoryCounts[o.item.category] || 0;
                if (count > 0) {
                    // Momentum: The more you have, the more you want. 
                    // This creates themed builds (e.g. All Cavalry) rather than scattered soup.
                    w *= (1.0 + (count * 0.6));
                }
            }

            return w;
        });

        const selection = rng.pickWeighted(candidateOptions, weights);
        const itemWeight = weights[candidateOptions.indexOf(selection)];

        // Trace decision: Determine if bias was significant
        let trace = "Standard roll";
        const mapWeight = getMatchWeight(selection.item, config);
        const archWeight = getArchetypeBias(selection.item, archetype);
        if (mapWeight > 1.1) trace = `Favored by ${config.mapType} map rules`;
        else if (archWeight > 1.1) trace = `Influenced by ${archetype} archetype`;
        else if (selection.cost === points && config.pointUsage === 'Exact') trace = "Chosen to match point target exactly";

        if (selection.type === 'boost') {
            const b = selection.item as Boost;
            const heading = HEADINGS.find(h => h.name === b.category)!;
            const count = categoryCounts[b.category] || 0;
            const cost = selection.cost;

            items.push({
                name: b.name,
                cost: cost,
                originalCost: b.baseCost,
                type: 'boost',
                category: b.category,
                inflationApplied: count * heading.bonusCost,
                description: `${b.name} for ${b.category.split('–').pop()?.trim() || b.category}.`,
                trace
            });

            points -= cost;
            categoryCounts[b.category] = count + 1;
            takenItems.add(b.name);
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
            points -= p.cost;
            takenItems.add(p.name);
        }
    }

    // --- Validation Step ---
    const validateCiv = (civItems: GeneratedItem[]): boolean => {
        const total = civItems.reduce((sum, i) => sum + i.cost, 0);
        if (total > 100) return false;

        const names = new Set<string>();
        for (const i of civItems) {
            if (names.has(i.name)) return false; // Duplicate
            names.add(i.name);

            // Epoch validation
            if (i.type === 'power') {
                const p = CIV_POWERS.find(x => x.name === i.name);
                if (p && p.minEpoch > config.endEpoch) return false;
            } else {
                const heading = HEADINGS.find(h => h.name === i.category);
                if (heading && heading.minEpoch > config.endEpoch) return false;
            }

            // Map validation (Strict)
            const itemRef = i.type === 'power'
                ? CIV_POWERS.find(x => x.name === i.name)
                : BOOSTS.find(x => x.name === i.name);

            // If getMapWeight returns 0, it means it is FORBIDDEN on this map
            if (itemRef && getMatchWeight(itemRef, config) === 0) return false;
        }
        return true;
    };

    const isValid = validateCiv(items);

    // Ratings Calculation
    const ratings = { early: 0, mid: 0, late: 0 };

    items.forEach(item => {
        let tags: GamePhase[] = [];
        if (item.type === 'boost') {
            const b = BOOSTS.find(x => x.name === item.name);
            if (b) tags = b.tags;
        } else {
            const p = CIV_POWERS.find(x => x.name === item.name);
            if (p) tags = p.tags;
        }

        tags.forEach(t => {
            if (t === GamePhase.EARLY) ratings.early += item.cost;
            if (t === GamePhase.MID) ratings.mid += item.cost;
            if (t === GamePhase.LATE) ratings.late += item.cost;
        });
    });

    // Normalize ratings to 0-5 stars roughly
    const normalize = (val: number) => Math.min(5, Math.max(1, Math.round(val / 15)));

    const finalRatings = {
        early: normalize(ratings.early),
        mid: normalize(ratings.mid),
        late: normalize(ratings.late)
    };

    // --- Enhanced Summary Logic ---
    const categorySpend: Record<string, number> = {};
    items.forEach(item => {
        if (item.type === 'boost' && item.category) {
            categorySpend[item.category] = (categorySpend[item.category] || 0) + item.cost;
        }
    });

    const shortCatNames: Record<string, string> = {
        "Civ – Economy": "Economy",
        "Civ – Buildings, Walls & Towers": "Defenses",
        "Civ – General": "Utility",
        "Citizens & Fishing Boats": "Citizens",
        "Infantry – Ranged": "Ranged Inf",
        "Infantry – Sword / Spear": "Melee Inf",
        "Cavalry – Ranged": "Ranged Cav",
        "Cavalry – Melee": "Melee Cav",
        "Siege Weapons & Mobile AA": "Siege",
        "Tanks": "Armor",
        "Aircraft": "Air Force",
        "Ships": "Navy",
        "Cyber": "Cyber",
        "Religion": "Religion"
    };

    const topCategories = Object.entries(categorySpend)
        .sort((a, b) => b[1] - a[1]);

    const primary = topCategories[0];
    const secondary = topCategories[1];

    const bestEraEntry = Object.entries(finalRatings).sort((a, b) => b[1] - a[1])[0];
    const bestEra = bestEraEntry[0];
    const bestEraVal = bestEraEntry[1];

    let summary = "";

    // 1. Archetype (More conversational)
    if (bestEraVal >= 4) {
        if (bestEra === 'early') summary = "Fast early-game aggressor";
        else if (bestEra === 'mid') summary = "Mid-game powerhouse";
        else summary = "Late-game juggernaut";
    } else if (bestEraVal <= 2) {
        summary = "Scrappy underdog civilization";
    } else {
        summary = "Flexible, well-rounded civilization";
    }

    // 2. Focus (More natural flow)
    if (primary && primary[1] >= 20) {
        const pName = shortCatNames[primary[0]] || "Military";
        summary += ` backed by strong investment in ${pName}`;

        if (secondary && secondary[1] >= 15) {
            const sName = shortCatNames[secondary[0]] || "Military";
            summary += ` and ${sName}`;
        }
    } else {
        summary += " with a balanced approach";
    }

    // 3. Key Powers / Flavor
    const powerNames = new Set(items.filter(i => i.type === 'power').map(i => i.name));
    const powerFlavors: string[] = [];

    if (powerNames.has("Expansionism")) powerFlavors.push("rapid expansion");
    if (powerNames.has("Missile Base")) powerFlavors.push("nuclear capability");
    if (powerNames.has("Slavery")) powerFlavors.push("sacrificial production");
    if (powerNames.has("Priest Tower")) powerFlavors.push("religious fortification");
    if (powerNames.has("SAS Commando") || powerNames.has("Pathfinding")) powerFlavors.push("covert infantry tactics");

    if (powerFlavors.length > 0) {
        if (powerFlavors.length === 1) {
            summary += `. Features ${powerFlavors[0]}`;
        } else {
            const last = powerFlavors.pop();
            summary += `. Features ${powerFlavors.join(", ")} and ${last}`;
        }
    }

    // 4. Weakness check
    if ((categorySpend["Civ – Economy"] || 0) < 12) {
        summary += " — but requires careful economic management.";
    } else {
        summary += ".";
    }

    // Power Score (0-100)
    const synergyBonus = Object.values(categoryCounts).reduce((acc, c) => acc + (c > 1 ? (c - 1) * 5 : 0), 0);
    const powerScore = Math.min(100, (100 - points) + (synergyBonus * 0.5));

    // --- Difficulty Calculation ---
    let difficultyScore = 1; // Base

    // 1. Economic Stability (Low eco = hard)
    if ((categorySpend["Civ – Economy"] || 0) < 15) difficultyScore++;

    // 2. Early Game Presence (Weak early = hard to survive)
    if (finalRatings.early < 2) difficultyScore++;

    // 3. Complexity of Mechanics (Specific powers/units)
    if ((categorySpend["Religion"] || 0) > 0) difficultyScore++;
    if ((categorySpend["Cyber"] || 0) > 0) difficultyScore++;
    if ((categorySpend["Aircraft"] || 0) > 10) difficultyScore++;

    let difficulty: Difficulty = 'Intermediate';
    if (difficultyScore <= 1) difficulty = 'Beginner';
    else if (difficultyScore >= 4) difficulty = 'Advanced';

    // --- Reasoning Generation ---
    let reasoning = `Generated for a ${config.mapType} world using ${config.preset} rules.`;
    if (config.preset === 'Chaos') reasoning += " Chaos mode amplified streakiness.";
    if (config.preset === 'Tournament') reasoning += " Tournament rules favored efficiency.";
    reasoning += ` ${archetype} archetype preference influenced choices.`;
    if (primary) {
        reasoning += ` The ${shortCatNames[primary[0]] || primary[0]} focus emerged naturally from the seed.`;
    }

    return {
        id: `civ-${playerIndex}-${Date.now()}`,
        playerName,
        pointsSpent: 100 - points,
        items: items.sort((a, b) => (a.category || '').localeCompare(b.category || '')),
        ratings: finalRatings,
        summary,
        powerScore: Math.round(powerScore),
        seed: seedString,
        primaryCategory: primary ? primary[0] : 'General',
        difficulty,
        reasoning,
        warnings,
        rerollUsed: false,
        synergies: (function detectSynergies(itemsList: GeneratedItem[]): SynergyRule[] {
            const itemNames = new Set(itemsList.map(i => i.name));
            return SYNERGIES.filter(rule =>
                rule.items.every(requiredItem => itemNames.has(requiredItem))
            );
        })(items),
        isValid
    };
};
