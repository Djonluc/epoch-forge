# Civilization Generator System Audit: Epoch Forge

## 1. Executive Summary
**Current Classification:** Weighted-Random / Heuristic-Driven (Non-Contextual)
The system operates on a "Greedy Sequential Selection" model, picking the next best item based on current weights without a long-term strategic plan or "Doctrine" awareness.

---

## 2. Architectural Analysis

### Build Generation Flow
The current flow in `services/generator.ts` is sequential and point-exhaustion based:
1.  **Context Resolution:** Maps and archetypes are resolved from 'Random' states.
2.  **Pool Pruning:** Items are filtered by Epoch constraints.
3.  **Mandatory Power Selection:** High-cost powers are prioritized if the "Ensure Power" flag is set.
4.  **The Weighted Loop:**
    *   **Match Weights:** Map affinity multipliers (e.g., Land vs Water).
    *   **Archetype Bias:** Player-selected style multipliers.
    *   **Momentum Bias:** Increases weight for categories already selected to encourage "Themed" builds.
5.  **Inflation:** Costs increase dynamically as more items from the same category are picked.
6.  **Validation:** A post-process pass to ensure the final build doesn't violate hard constraints.

### Current Generator Type
| Feature | Implementation |
| :--- | :--- |
| **Randomization** | Seeded Weighted Random |
| **Weighting** | Static multipliers based on Map/Archetype |
| **Synergy** | Post-generation detection only (Not proactive) |
| **Map Awareness** | Coarse (Naval vs Non-Naval binary) |
| **State Awareness** | Loop-local (only knows current points/counts) |

---

## 3. Identified Strategic Flaws

### Why builds become "Incoherent"
1.  **Independence of Selection:** The generator picks items one by one. It doesn't know that "Farming" and "Fishing" are often redundant in a 100-point build; it only sees them as "Economy" items.
2.  **Momentum Paradox:** The system uses a "Momentum" heuristic (`count * 0.6`) to encourage specialization. However, because it lacks **Doctrine Tags**, it might specialize in "Infantry - Ranged" and "Infantry - Melee" simultaneously, leading to a build that is "Infantry Heavy" but lacks supporting economic or siege depth.
3.  **Map Awareness Gaps:** `getMatchWeight` handles naval/land well but fails on "Mixed" maps. It might assign heavy naval bonuses to a map that is 90% land simply because `navalSupport` is true.
4.  **Lack of Anti-Synergy:** There is no mechanism to prevent conflicting doctrines (e.g., "Defensive Buildings" combined with "Aggressive Cavalry Rush").

---

## 4. Metadata & Data Structures

### Current State
*   **Tags:** Limited to `GamePhase` (Early, Mid, Late).
*   **Categories:** Broad strings used for UI and inflation logic.
*   **Strategic Metadata:** **Missing**. Bonuses do not have tags for `offensive`, `defensive`, `booming`, `raiding`, or terrain affinity beyond specific hardcoded examples.

---

## 5. Future Architecture Recommendation: "Doctrine-Driven"

To transform Epoch Forge into an intelligent strategy-aware builder, the architecture should move to a **Template-First** approach:

### New Architecture Components:
*   **Strategic Doctrines:** Instead of picking items, first pick a **Doctrine** (e.g., "Steppe Raiders", "Iron Turtle", "Maritime Traders").
*   **Tag-Based Weighting:** Items should be tagged with strategic identifiers. The Doctrine provides the "Target Weights" for these tags.
*   **Proactive Synergy:** The generator should scan the `SYNERGIES` list. If 50% of a synergy is picked, the remaining items should jump to 100x weight.
*   **Conflict Filters:** Implement "Incompatibility Groups" to prevent nonsensical pairings.

---

## 6. Priority Improvements Roadmap

### Phase 1: Metadata Enrichment (Immediate)
- [ ] Add `strategyTags: string[]` to `Boost` and `CivPower` interfaces.
- [ ] Move hardcoded map weights into `MAP_TYPES_INFO` in `constants.ts`.
- [ ] Define "Doctrine Templates" as a new data structure.

### Phase 2: Logic Refactor (Short Term)
- [ ] Replace "Category Momentum" with "Tag-Based Affinity".
- [ ] Implement a **Pre-Selection Phase** where the generator "commits" to a primary and secondary strategy.
- [ ] Add **Anti-Synergy** checks to the affordable items filter.

### Phase 3: Advanced Systems (Long Term)
- [ ] **Adaptive Priorities:** Weights that change as points decrease (e.g., "If 70 points spent and no Eco, set Eco weight to 5.0x").
- [ ] **Strategy Identity Generation:** Dynamically name the civ based on the resulting tag density (e.g., "The [Adjective] [Noun]").

---

## 7. Concrete Code Examples of Weaknesses

### Hardcoded Weight Logic (`generator.ts:128`)
```typescript
if (mapInfo.category === 'land') {
    if (cat.includes('Infantry') || cat.includes('Buildings')) weight = 1.4;
}
```
*Critique:* This makes adding new categories or map types require a refactor of the generator service itself.

### Loop-Local Decision Making (`generator.ts:384`)
```typescript
const selection = rng.pickWeighted(candidateOptions, weights);
```
*Critique:* The system makes the "best choice for now" rather than the "best choice for the build."
