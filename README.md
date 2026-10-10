# Monster Proto 🐾

A browser-playable 2D monster-catching and online turn-based battle game prototype. Built with TypeScript, Phaser 3, Hono on Cloudflare Workers, Cloudflare D1 (SQLite), and Durable Objects.

Live Repository: [MatthieudeLaMettrie/monster-proto](https://github.com/MatthieudeLaMettrie/monster-proto)

---

## 🌟 Key Features

1. **Complete 60-Monster Roster**:
   - 20 evolutionary families with 3 stages each (Base form + 2 Evolutions = 60 species).
   - 8 elemental types: `Fire`, `Water`, `Grass`, `Psy`, `Dark`, `Dragon`, `Fly`, and `Fight`.
   - Distinct base stats (BST 300 / 405 / 510) and archetypes (ATK, DEF, SPD, Balanced, HP).
   - Crisp procedural vector SVG sprites generated per monster with distinctive silhouettes, type palettes, and Stage-3 radiant auras.

2. **2D Tilemap Overworld Exploration**:
   - 40×30 tile map with smooth grid-based player movement and solid collision detection.
   - Dual control schemes: Keyboard (WASD / Arrows) and on-screen **Virtual D-Pad** for touch/mobile devices.
   - Biome zones:
     - **Pallet Plaza (Town)**: Safe haven with an interactive **Heal Spot**.
     - **Route 1**: Meadow path with tall grass encounters.
     - **Lake Shore**: Water obstacle terrain populated by `Water` & `Fly` monsters.
     - **Ember Crags**: Rugged rocky zone featuring `Fire` & rare `Dragon` species.
     - **Old Grove**: Dense woodland with `Grass`, `Psy`, and `Dark` creatures.
     - **Dojo Plateau**: Far-east battle platform with the Champion NPC arena.

3. **Turn-Based 1v1 Battle Arena**:
   - `⚔️ Fight`: Execute elemental moves with Same-Type Attack Bonus (STAB 1.5×) and type effectiveness multipliers.
   - `🎾 Catch`: Throw capture capsules with stage-scaled catch probability formulas. Monsters that break free retaliate!
   - `🏃 Run` & `🔄 Switch`: Tactical disengagement and party swaps.
   - Dynamic animations: Attack lunges, hit shakes, fainted fades, XP gain bars, level-ups, and in-combat evolution morphing.

4. **Multiplayer & Online PvP (Cloudflare Durable Objects)**:
   - **Lobby Durable Object (`/ws/lobby`)**: Real-time player presence, movement broadcasting, direct trainer challenges, and automated quick-match pairing.
   - **Battle Durable Object (`/ws/battle/:id`)**: Server-authoritative 3v3 PvP matches. Normalizes monster stats to Level 15 while retaining natural evolved forms and learnsets. Seeded RNG prevents damage tampering or client desyncs.

5. **Cloudflare D1 (SQLite) Cloud Saves**:
   - Automatic guest token provisioning with SHA-256 password hashing.
   - Saves trainer coordinates, party members, storage box, and discovered Pokedex records.
   - Integrated in-game `PartyScene` tab viewing team stats and caught Pokedex catalog.

---

## 🏗️ Project Architecture

```
monster-proto/
├── apps/
│   ├── api/            # Hono Cloudflare Worker (REST + WebSocket Durable Objects)
│   └── web/            # Phaser 3 + Vite 2D frontend
├── packages/
│   └── shared/         # Roster data, type chart, moves, battle math & Zod protocols
├── migrations/         # Cloudflare D1 SQLite database migrations
├── tools/              # Sprite generation, map synthesis, and 10k-round balance sim
└── .github/workflows/  # Automated CI workflow
```

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Run Balance Simulation (10,000 Rounds)
```bash
npx tsx tools/sim.ts
```

### 4. Start Local Development
```bash
# Terminal 1: Web Frontend
npm run dev:web

# Terminal 2: API Worker
npm run dev:api
```
