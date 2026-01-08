<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Epoch Forge

**Randomized Civilization Builder for Empire Earth**

**Created & Designed by Djon-Luc**  
[https://www.youtube.com/@Djonluc](https://www.youtube.com/@Djonluc)

A fan-made, standalone tool inspired by *Empire Earth* and *Empire Earth: The Art of Conquest*.  
Not affiliated with or endorsed by the original developers or publishers.

---

## Quick Start (Windows)

Simply double-click the `PLAY_EPOCH_FORGE.bat` file in this folder to start the app.
It will automatically launch in your default web browser.

## Run Locally (Manual)

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`



---

## 1. PURPOSE

Epoch Forge generates fully valid, buildable civilization setups using the exact rules of the Empire Earth Civilization Builder, enhanced with clarity, balance indicators, and multiplayer quality-of-life features.

The output is meant to be manually recreated in-game.

## 2. PLATFORM (CONFIRMED)

*   HTML + Vanilla JavaScript / React (Browser-only)
*   No backend
*   No database
*   Works offline
*   Easily shareable

## 3. EPOCH SYSTEM (CANONICAL)

Empire Earth has 15 playable epochs.

```yaml
epochs:
  1: Stone Age
  2: Tool Age
  3: Copper Age
  4: Bronze Age
  5: Dark Age
  6: Middle Ages
  7: Renaissance
  8: Imperial Age
  9: Enlightenment Age
  10: Industrial Age
  11: Atomic Age
  12: Information Age
  13: Nano Age
  14: Space Age
  15: Digital Age
```

**Epoch Rule (Hard Constraint)**
Any boost or civilization power whose starting epoch is higher than the selected ending epoch MUST be excluded from generation.

## 4. USER INPUTS (UI)

```yaml
inputs:
  number_of_players: 2–10
  player_names: editable
  starting_epoch: default 1
  ending_epoch: 1–15
  civ_point_cap: 100 (fixed)
  generation_seed: optional
  preset_mode:
    - Tournament
    - Casual (default)
    - Chaos
    - Historical
```

## 5. DEFAULT PLAYER NAMES

Pre-filled placeholders (editable, valid if unchanged):

```yaml
default_names:
  - Taco
  - Pierd
  - Djon-Luc
  - Scully
  - Naldo
  - Pash
  - Pasharos
```

Fallback for extra players: Player 8, Player 9, etc.

## 6. CIV POINT SYSTEM

*   Each player starts with **100 Civ Points**
*   Points are deducted immediately upon selection
*   A selection is blocked if cost > remaining points
*   Negative points are impossible

## 7. COST CALCULATION (EXACT GAME LOGIC)

### 7.1 Multiple Bonus Cost System

Each Heading (Category) has:
*   A **Multiple Bonus Cost** (flat integer)
*   Boosts with **Base Costs**

**Final Cost Formula**
`final_cost = base_cost + (number_of_boosts_already_taken_in_that_heading × multiple_bonus_cost)`

✔ Flat additive
✔ Applies only within the same heading
✔ Recalculated before every selection

## 8. POINT DEDUCTION RULE

`remaining_points = remaining_points − final_cost`
`taken_count[heading] += 1`

All remaining boosts in that heading become more expensive.

## 9. STANDARD BOOST HEADINGS (BASE COSTS)

**Civ – Economy** (Multiple Bonus Cost: 6)
*   20% Farming: 9
*   20% Fishing: 9
*   15% Gold Mining: 11
*   20% Hunting & Foraging: 11
*   15% Iron Mining: 11
*   20% Stone Mining: 9
*   15% Wood Cutting: 13

**Civ – Buildings, Walls & Towers** (Multiple Bonus Cost: 3)
*   20% Attack: 3
*   30% Build Time Decrease: 4
*   15% Cost Reduction: 11
*   50% Hit Points: 11
*   20% Range: 4

**Civ – General** (Multiple Bonus Cost: 0)
*   50% Conversion Resistance: 10
*   20% Mountain Combat Bonus: 4
*   15% Population Cap: 9

**Citizens & Fishing Boats** (Multiple Bonus Cost: 2)
*   30% Attack: 1
*   10% Build Time Decrease: 20
*   20% Cost Reduction: 25
*   30% Hit Points: 3
*   35% Range: 2
*   20% Speed: 4

**Infantry – Ranged** (Multiple Bonus Cost: 5)
*   20% Armor: 3
*   20% Attack: 5
*   30% Build Time Decrease: 4
*   20% Cost Reduction: 9
*   25% Hit Points: 5
*   20% Range: 6
*   20% Speed: 5

**Infantry – Sword / Spear** (Multiple Bonus Cost: 3)
*   20% Armor: 2
*   20% Attack: 3
*   30% Build Time Decrease: 2
*   20% Cost Reduction: 7
*   25% Hit Points: 3
*   20% Range: 3
*   20% Speed: 3

**Cavalry – Ranged** (Multiple Bonus Cost: 4)
*   20% Armor: 2
*   20% Attack: 4
*   30% Build Time Decrease: 3
*   20% Cost Reduction: 8
*   25% Hit Points: 4
*   20% Range: 5
*   20% Speed: 4

**Siege Weapons & Mobile AA** (Multiple Bonus Cost: 2)
*   20% Area Effect: 5
*   20% Armor: 1
*   20% Attack: 2
*   30% Build Time Decrease: 1
*   20% Cost Reduction: 3
*   25% Hit Points: 2
*   20% Range: 2
*   25% Rate of Fire: 2
*   20% Speed: 2

*(Ships, Aircraft, Tanks, Cybers, Religion follow the same confirmed structure and costs.)*

## 10. ART OF CONQUEST CIVILIZATION POWERS

(Flat cost, no inflation, epoch-restricted)

| Power | Cost | Epoch |
| :--- | :--- | :--- |
| Expansionism | 30 | All |
| Advanced Mining | 25 | All |
| Just-In-Time Manufacturing | 20 | All |
| Market | 20 | 10–15 |
| Missile Base | 15 | 13–15 |
| Adaptation | 15 | 3–15 |
| Slavery | 10 | All |
| Priest Tower | 30 | All |
| Pathfinding | 25 | All |
| SAS Commando | 15 | 10–15 |

## 11. RANDOM GENERATION LOOP (PER PLAYER)

```
points = 100
taken_count = {}

WHILE exists any item with final_cost ≤ points:
  recalc final_costs
  select random valid item
  deduct points
  increment taken_count
  record selection
END
```

## 12. CIV SUMMARY

Each generated civ receives an auto-generated summary:
*“Strong early economy with durable infantry, but weaker late-game air power.”*

Generated using selected boosts and powers.

## 13. EARLY / MID / LATE GAME RATINGS

Each civ displays:
*   Early Game: ★★★★☆
*   Mid Game: ★★★☆☆
*   Late Game: ★★☆☆☆

Calculated from:
*   Economy & build speed → Early
*   Infantry & cavalry → Mid
*   Tanks, aircraft, AoC powers → Late

## 14. COST CHANGE EXPLANATIONS

When a cost increases, the UI explains why:
*“Cost increased by +6 because 2 Civ–Economy bonuses were already selected.”*

## 15. REROLL CONTROLS

Buttons:
*   Reroll Entire Civ (Deterministic sub-seed)
*   (Locked in Tournament Mode)

Player name remains unchanged unless edited.

## 16. SEEDED GENERATION

Each generation produces a seed:
*   Seed: EF-48291

Entering the same seed reproduces identical civs.

## 17. PRESET MODES

| Mode | Behavior |
| :--- | :--- |
| **Tournament** | Tight balance, low variance, no rerolls |
| **Casual** | Default |
| **Chaos** | Allows extreme builds (Momentum) |
| **Historical** | Fewer AoC powers, more stat boosts |

## 18. TEAM BALANCE HELPER

Each civ receives a Power Score (0–100).

## 19. EXPORT & SHARING

Supported outputs:
*   Copy as text (Checklist format)
*   Export JSON
*   **Shared Session Link** (Encodes seed & config into URL)

---

## 🟣 LONG-TERM / STRETCH IDEAS (Optional Future)

*Only consider these if the app gains traction.*

**1. “House Rules” Profiles**
Save presets like: “No Navy Night”, “Early Rush Chaos”.

**2. Post-Game Reflection**
After the match: How did your civ perform? (Better/Worse/Same).
