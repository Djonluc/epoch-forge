import { BOOSTS, CIV_POWERS, HEADINGS } from '../constants';
import { Boost, BoostCategory, CivPower, GeneratedItem, PlayerCiv, AppConfig, Heading, GamePhase, MapType, Difficulty, Archetype } from '../types';

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
}

const getMapWeight = (item: Boost | CivPower, mapType: MapType): number => {
    let weight = 1.0;
    const name = item.name.toLowerCase();
    const cat = 'category' in item ? item.category : '';

    // Hard Exclusions & Strong Preferences
    if (mapType === 'Land') {
        if (cat === 'Ships' || name.includes('fishing')) return 0;
        if (cat.includes('Infantry') || cat.includes('Economy') || cat.includes('Buildings')) weight = 1.5;
    }
    else if (mapType === 'Water') {
        if (cat === 'Ships' || name.includes('fishing')) weight = 3.0;
        if (cat.includes('Cavalry')) weight = 0.5;
    }
    else if (mapType === 'Islands') {
        if (cat === 'Ships' || cat === 'Aircraft' || name === 'Expansionism') weight = 2.0;
        if (cat.includes('Cavalry')) weight = 0.8;
    }
    else if (mapType === 'Space') {
        if (cat === 'Aircraft' || cat === 'Tanks' || cat === 'Cyber') weight = 2.5;
        if (name.includes('farming') || name.includes('hunting')) weight = 0.1;
        if (cat === 'Ships') return 0;
    }
    else if (mapType === 'Coastal' || mapType === 'Rivers') {
        if (cat === 'Ships') weight = 1.2; // Balanced water
        if (name.includes('fishing')) weight = 1.2;
    }

    return weight;
};

// Bias weights based on user preference
const getArchetypeBias = (item: Boost | CivPower, archetype: Archetype): number => {
    if (!archetype || archetype === 'Random') return 1.0;

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
    config: AppConfig, 
    playerName: string, 
    playerIndex: number,
    forceSeed?: string,
    ensurePower: boolean = false
): PlayerCiv => {
    // Unique seed per player based on main seed + name + index
    const seedString = forceSeed || `${config.seed}-${playerName}-${playerIndex}`;
    const rng = new SeededRNG(seedString);
    const archetype = config.playerArchetypes[playerIndex] || 'Random';
    
    let points = 100;
    const items: GeneratedItem[] = [];
    const categoryCounts: Record<string, number> = {};
    const takenItems = new Set<string>();
    const warnings: string[] = [];

    // Map vs Archetype Warnings (Generated once)
    if (archetype === 'Naval' && (config.mapType === 'Land' || config.mapType === 'Space')) {
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

    // Pre-selection Logic for ensurePower
    if (ensurePower) {
        // Filter powers that fit map/epoch and cost <= 100
        const affordablePowers = validPowers.filter(p => {
             if (getMapWeight(p, config.mapType) === 0) return false;
             return p.cost <= points;
        });

        if (affordablePowers.length > 0) {
             const weights = affordablePowers.map(p => getMapWeight(p, config.mapType) * getArchetypeBias(p, archetype));
             const p = rng.pickWeighted(affordablePowers, weights);
             
             items.push({
                name: p.name,
                cost: p.cost,
                originalCost: p.cost,
                type: 'power',
             });
             points -= p.cost;
             takenItems.add(p.name);
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
            if (getMapWeight(b, config.mapType) === 0) return false; // Map Exclusion
            return getBoostCost(b) <= points;
        });

        const affordablePowers = validPowers.filter(p => {
            if (takenItems.has(p.name)) return false;
            if (getMapWeight(p, config.mapType) === 0) return false; // Map Exclusion
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
            let w = getMapWeight(o.item, config.mapType);
            
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

            return w;
        });

        const selection = rng.pickWeighted(candidateOptions, weights);

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
                inflationApplied: count * heading.bonusCost
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
            });
            points -= p.cost;
            takenItems.add(p.name);
        }
    }

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
            if(t === GamePhase.EARLY) ratings.early += item.cost;
            if(t === GamePhase.MID) ratings.mid += item.cost;
            if(t === GamePhase.LATE) ratings.late += item.cost;
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
    const synergyBonus = Object.values(categoryCounts).reduce((acc, c) => acc + (c > 1 ? (c-1)*5 : 0), 0);
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
    if (archetype !== 'Random') reasoning += ` ${archetype} archetype preference influenced choices.`;
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
        rerollUsed: false
    };
};
