# Robot Uprising Phase 1: Core Engine + Mission 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core game engine and get Mission 1 ("Boot — Buffer Discovery") fully playable with all three screens (Plan → Sealed Watch → Inspector).

**Architecture:** React app with Pixi.js canvas for the 8x8 board, Zustand for game state, custom deterministic tick scheduler. The board is rendered in Pixi.js (Canvas, screenshottable); all UI chrome is React DOM (Playwright-inspectable). Game logic is pure TypeScript with no framework dependency — testable without React/Pixi.

**Tech Stack:** TypeScript, React 18, Pixi.js 8, Zustand, Vite, Vitest, Playwright

**Specs:**
- Roguelike redesign: `docs/superpowers/specs/2026-03-19-robot-uprising-roguelike-redesign.md`
- First playable: `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md`
- Game design: `docs/superpowers/specs/2026-03-13-robot-uprising-game-design.md`

**Scope:** This plan covers ONLY:
- Vite + React + Pixi.js project scaffold
- Core game engine (tick system, units, buffers, rules, perception)
- Board renderer (6x6 for Mission 1, configurable)
- Three-screen loop (Plan, Sealed Watch, Inspector) — minimal UI
- Mission 1 playable: 2 pre-placed units, buffers pre-filled with noise, player configures context filters to unfreeze units, objective tile to reach

**Important: Mission 1 has NO enemies and NO combat.** It is purely about filtering noise from buffers so frozen units can pathfind to an objective. See first-playable spec "Mission 1: Wake Up" for details.

**Out of scope for this plan (future phases):**
- Hooks/channels (Mission 3)
- Factory/production queue (Mission 5)
- Command agent (Mission 7)
- Roguelike meta-game (map, rewards, doctrines, runs)
- Audio
- Boot log narrative
- Polish, animations, transitions

---

## File Structure

```
apps/robot-uprising/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Top-level: routes between screens
│   │
│   ├── engine/                           # Pure TS game logic (no React/Pixi)
│   │   ├── types.ts                      # All game types (Unit, Buffer, Rule, Tile, etc.)
│   │   ├── buffer.ts                     # Buffer (context window) logic
│   │   ├── rules.ts                      # Rule evaluation (condition → action)
│   │   ├── perception.ts                 # Perception radius, what units see
│   │   ├── movement.ts                   # Grid movement, pathfinding
│   │   ├── combat.ts                     # One-shot-one-kill adjacency check
│   │   ├── tick.ts                       # Single tick execution (perceive → act → transmit)
│   │   ├── game-loop.ts                  # Multi-tick runner with speed control
│   │   └── mission1.ts                   # Mission 1 scenario setup
│   │
│   ├── store/                            # Zustand stores
│   │   └── game-store.ts                 # Game state (board, units, tick, phase)
│   │
│   ├── board/                            # Pixi.js board renderer
│   │   ├── Board.tsx                     # React wrapper for Pixi canvas
│   │   ├── create-board.ts              # Pixi stage setup (grid, tiles, labels)
│   │   └── render-units.ts             # Unit sprite rendering + buffer bars
│   │
│   ├── screens/                          # React screen components
│   │   ├── PlanScreen.tsx               # Board left, config panel right, EXECUTE button
│   │   ├── SealedWatch.tsx              # Board center, tick clock, no controls
│   │   ├── Inspector.tsx                # Board center, timeline scrubber, click-to-inspect
│   │   └── ContextConfigPanel.tsx       # Listen/ignore toggles for Mission 1
│   │
│   └── test/
│       ├── engine/
│       │   ├── buffer.test.ts
│       │   ├── rules.test.ts
│       │   ├── perception.test.ts
│       │   ├── movement.test.ts
│       │   ├── combat.test.ts
│       │   ├── tick.test.ts
│       │   └── mission1.test.ts
│       └── e2e/
│           └── mission1.spec.ts          # Playwright: full Mission 1 flow
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `apps/robot-uprising/package.json`
- Create: `apps/robot-uprising/tsconfig.json`
- Create: `apps/robot-uprising/vite.config.ts`
- Create: `apps/robot-uprising/index.html`
- Create: `apps/robot-uprising/src/main.tsx`
- Create: `apps/robot-uprising/src/App.tsx`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "robot-uprising",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd apps/robot-uprising
npm install react react-dom pixi.js zustand
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react vitest @playwright/test
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": "src",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
});
```

- [ ] **Step 5: Create index.html and entry point**

`index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Robot Uprising</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #091833; color: #e0e0e0; font-family: 'IBM Plex Mono', monospace; }
    #root { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

`src/main.tsx`:
```tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

`src/App.tsx`:
```tsx
export function App() {
  return <div>Robot Uprising</div>;
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
cd apps/robot-uprising && npm run dev
```
Expected: Vite dev server running, browser shows "Robot Uprising"

- [ ] **Step 7: Commit**

```bash
git add apps/robot-uprising/package.json apps/robot-uprising/tsconfig.json apps/robot-uprising/vite.config.ts apps/robot-uprising/index.html apps/robot-uprising/src/
git commit -m "feat(robot-uprising): project scaffold with React + Pixi.js + Vite"
```

---

### Task 2: Core Types

**Files:**
- Create: `apps/robot-uprising/src/engine/types.ts`

- [ ] **Step 1: Define all core game types**

```ts
// === Grid ===
export type Position = { x: number; y: number }; // 0-7 for 8x8

// === Buffer (Context Window) ===
export type SignalType = 'threat' | 'position' | 'terrain' | 'comms' | 'noise';

export type BufferEntry = {
  type: SignalType;
  value: string;       // human-readable description
  source: string;      // unit ID or 'environment'
  age: number;         // ticks since entry was added
  tick: number;        // tick when entry was created
};

export type Buffer = {
  slots: (BufferEntry | null)[];
  capacity: number;
  listenFilter: Set<SignalType>;    // which types to accept
  evictionPriority: SignalType[];   // lowest priority first (evicted first)
};

// === Rules ===
export type Condition =
  | { type: 'buffer_has'; signalType: SignalType }
  | { type: 'buffer_empty' }
  | { type: 'buffer_full' }
  | { type: 'always' };

export type Action =
  | { type: 'move_toward'; target: 'nearest_threat' | 'nearest_unknown' }
  | { type: 'patrol' }
  | { type: 'evade' }
  | { type: 'idle' };

export type Rule = {
  condition: Condition;
  action: Action;
  priority: number; // lower = higher priority
};

// === Units ===
export type UnitType = 'scout' | 'striker' | 'relay' | 'specialist' | 'command';
export type Team = 'player' | 'enemy';

export type UnitStats = {
  bufferSize: number;
  hookSlots: number;
  perception: number;
  speed: number;       // tiles per tick
  cost: number;        // material cost
};

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  scout:      { bufferSize: 6,  hookSlots: 2, perception: 5, speed: 2, cost: 3 },
  striker:    { bufferSize: 8,  hookSlots: 2, perception: 2, speed: 1, cost: 8 },
  relay:      { bufferSize: 12, hookSlots: 4, perception: 0, speed: 0, cost: 5 },
  specialist: { bufferSize: 10, hookSlots: 2, perception: 3, speed: 1, cost: 7 },
  command:    { bufferSize: 14, hookSlots: 6, perception: 0, speed: 0, cost: 10 },
};

export type Unit = {
  id: string;
  type: UnitType;
  team: Team;
  position: Position;
  buffer: Buffer;
  rules: Rule[];
  alive: boolean;
  stunned: boolean;   // context overload → 1 tick stun
};

// === Board ===
export type TileType = 'ground' | 'obstacle' | 'objective';

export type Tile = {
  position: Position;
  type: TileType;
};

export type Board = {
  width: number;   // always 8
  height: number;  // always 8
  tiles: Tile[][];
};

// === Game State ===
export type GamePhase = 'plan' | 'watch' | 'inspect';

export type TickState = {
  tick: number;
  units: Unit[];
  events: TickEvent[];
};

export type TickEvent =
  | { type: 'perceive'; unitId: string; entry: BufferEntry }
  | { type: 'act'; unitId: string; action: Action; reason: string }
  | { type: 'combat'; attackerId: string; targetId: string }
  | { type: 'buffer_full'; unitId: string }
  | { type: 'overload'; unitId: string }
  | { type: 'move'; unitId: string; from: Position; to: Position }
  | { type: 'objective_reached'; unitId: string }
  | { type: 'noise'; unitId: string; entry: BufferEntry };

export type GameState = {
  phase: GamePhase;
  board: Board;
  units: Unit[];
  currentTick: number;
  tickHistory: TickState[];
  missionComplete: boolean;
  missionResult: 'pending' | 'victory' | 'defeat';
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/robot-uprising/src/engine/types.ts
git commit -m "feat(robot-uprising): core game types"
```

---

### Task 3: Buffer Logic

**Files:**
- Create: `apps/robot-uprising/src/engine/buffer.ts`
- Create: `apps/robot-uprising/src/test/engine/buffer.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { createBuffer, addEntry, isOverloaded } from '../../engine/buffer';
import type { BufferEntry, SignalType } from '../../engine/types';

const makeEntry = (type: SignalType, tick = 0): BufferEntry => ({
  type, value: `${type}-data`, source: 'test', age: 0, tick,
});

describe('buffer', () => {
  it('creates a buffer with given capacity', () => {
    const buf = createBuffer(6);
    expect(buf.capacity).toBe(6);
    expect(buf.slots.filter(s => s !== null)).toHaveLength(0);
  });

  it('adds an entry to the first empty slot', () => {
    const buf = createBuffer(6);
    const result = addEntry(buf, makeEntry('threat'));
    expect(result.slots.filter(s => s !== null)).toHaveLength(1);
    expect(result.slots[0]?.type).toBe('threat');
  });

  it('filters out entries not in listenFilter', () => {
    const buf = createBuffer(6, new Set<SignalType>(['threat']));
    const result = addEntry(buf, makeEntry('noise'));
    expect(result.slots.filter(s => s !== null)).toHaveLength(0);
  });

  it('evicts lowest priority entry when full', () => {
    const buf = createBuffer(2, new Set(['threat', 'noise'] as SignalType[]), ['noise', 'threat']);
    const b1 = addEntry(buf, makeEntry('noise'));
    const b2 = addEntry(b1, makeEntry('threat'));
    // buffer full with [noise, threat]
    const b3 = addEntry(b2, makeEntry('threat', 1));
    // noise should be evicted (lowest priority)
    expect(b3.slots.every(s => s?.type === 'threat')).toBe(true);
  });

  it('marks overloaded when full and new entry arrives', () => {
    const buf = createBuffer(1);
    const b1 = addEntry(buf, makeEntry('threat'));
    expect(isOverloaded(b1, makeEntry('threat', 1))).toBe(true);
  });

  it('does not mark overloaded when there is space', () => {
    const buf = createBuffer(6);
    expect(isOverloaded(buf, makeEntry('threat'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/buffer.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement buffer.ts**

```ts
import type { Buffer, BufferEntry, SignalType } from './types';

export function createBuffer(
  capacity: number,
  listenFilter?: Set<SignalType>,
  evictionPriority?: SignalType[],
): Buffer {
  return {
    slots: new Array(capacity).fill(null),
    capacity,
    listenFilter: listenFilter ?? new Set(['threat', 'position', 'terrain', 'comms', 'noise']),
    evictionPriority: evictionPriority ?? ['noise', 'terrain', 'position', 'comms', 'threat'],
  };
}

export function addEntry(buffer: Buffer, entry: BufferEntry): Buffer {
  if (!buffer.listenFilter.has(entry.type)) return buffer;

  const slots = [...buffer.slots];
  const emptyIdx = slots.findIndex(s => s === null);

  if (emptyIdx !== -1) {
    slots[emptyIdx] = entry;
    return { ...buffer, slots };
  }

  // Buffer full — evict lowest priority
  let evictIdx = -1;
  let lowestPriority = Infinity;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const priority = buffer.evictionPriority.indexOf(slot.type);
    if (priority < lowestPriority) {
      lowestPriority = priority;
      evictIdx = i;
    }
  }

  if (evictIdx !== -1) {
    slots[evictIdx] = entry;
  }
  return { ...buffer, slots };
}

export function isOverloaded(buffer: Buffer, incoming: BufferEntry): boolean {
  if (!buffer.listenFilter.has(incoming.type)) return false;
  return buffer.slots.every(s => s !== null);
}

export function ageEntries(buffer: Buffer): Buffer {
  const slots = buffer.slots.map(s => s ? { ...s, age: s.age + 1 } : null);
  return { ...buffer, slots };
}

export function getOccupied(buffer: Buffer): BufferEntry[] {
  return buffer.slots.filter((s): s is BufferEntry => s !== null);
}

export function getFillRatio(buffer: Buffer): number {
  return getOccupied(buffer).length / buffer.capacity;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/buffer.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/buffer.ts apps/robot-uprising/src/test/engine/buffer.test.ts
git commit -m "feat(robot-uprising): buffer (context window) logic with tests"
```

---

### Task 4: Perception Logic

**Files:**
- Create: `apps/robot-uprising/src/engine/perception.ts`
- Create: `apps/robot-uprising/src/test/engine/perception.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { getVisibleUnits, generatePerceptions } from '../../engine/perception';
import type { Unit } from '../../engine/types';
import { createBuffer } from '../../engine/buffer';

function makeUnit(id: string, x: number, y: number, perception: number, team: 'player' | 'enemy' = 'player'): Unit {
  return {
    id, type: 'scout', team, position: { x, y },
    buffer: createBuffer(6), rules: [], alive: true, stunned: false,
  };
}

describe('perception', () => {
  it('detects units within perception radius', () => {
    const scout = { ...makeUnit('s1', 0, 0, 5), type: 'scout' as const };
    const enemy = makeUnit('e1', 3, 0, 2, 'enemy');
    const visible = getVisibleUnits(scout, [enemy], 5);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('e1');
  });

  it('does not detect units outside perception radius', () => {
    const scout = makeUnit('s1', 0, 0, 5);
    const enemy = makeUnit('e1', 7, 7, 2, 'enemy');
    const visible = getVisibleUnits(scout, [enemy], 5);
    expect(visible).toHaveLength(0);
  });

  it('does not detect self', () => {
    const scout = makeUnit('s1', 0, 0, 5);
    const visible = getVisibleUnits(scout, [scout], 5);
    expect(visible).toHaveLength(0);
  });

  it('generates buffer entries from perceived units', () => {
    const scout = { ...makeUnit('s1', 0, 0, 5), type: 'scout' as const };
    const enemy = makeUnit('e1', 3, 0, 2, 'enemy');
    const entries = generatePerceptions(scout, [enemy], 5, 1);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].source).toBe('e1');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/perception.test.ts
```

- [ ] **Step 3: Implement perception.ts**

```ts
import type { Unit, BufferEntry, Position } from './types';
import { UNIT_STATS } from './types';

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function getVisibleUnits(observer: Unit, allUnits: Unit[], perceptionRadius: number): Unit[] {
  return allUnits.filter(u =>
    u.id !== observer.id &&
    u.alive &&
    distance(observer.position, u.position) <= perceptionRadius
  );
}

export function generatePerceptions(observer: Unit, allUnits: Unit[], perceptionRadius: number, tick: number): BufferEntry[] {
  const visible = getVisibleUnits(observer, allUnits, perceptionRadius);
  return visible.map(u => ({
    type: u.team !== observer.team ? 'threat' as const : 'position' as const,
    value: `${u.type} at (${u.position.x},${u.position.y})`,
    source: u.id,
    age: 0,
    tick,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/perception.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/perception.ts apps/robot-uprising/src/test/engine/perception.test.ts
git commit -m "feat(robot-uprising): perception logic with tests"
```

---

### Task 5: Rule Evaluation

**Files:**
- Create: `apps/robot-uprising/src/engine/rules.ts`
- Create: `apps/robot-uprising/src/test/engine/rules.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../../engine/rules';
import { createBuffer, addEntry } from '../../engine/buffer';
import type { Rule, Unit } from '../../engine/types';

function makeUnit(rules: Rule[], bufferEntries: Array<{ type: 'threat' | 'noise' }> = []): Unit {
  let buf = createBuffer(6);
  for (const e of bufferEntries) {
    buf = addEntry(buf, { type: e.type, value: 'test', source: 'test', age: 0, tick: 0 });
  }
  return {
    id: 'u1', type: 'scout', team: 'player',
    position: { x: 0, y: 0 }, buffer: buf, rules, alive: true, stunned: false,
  };
}

describe('rules', () => {
  it('returns the highest priority matching rule action', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 1 },
    ], [{ type: 'threat' }]);
    const result = evaluateRules(unit);
    expect(result?.action.type).toBe('evade');
  });

  it('skips non-matching conditions', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 1 },
    ]);
    const result = evaluateRules(unit);
    expect(result?.action.type).toBe('patrol');
  });

  it('returns null if no rules match', () => {
    const unit = makeUnit([
      { condition: { type: 'buffer_has', signalType: 'threat' }, action: { type: 'evade' }, priority: 0 },
    ]);
    const result = evaluateRules(unit);
    expect(result).toBeNull();
  });

  it('returns null for stunned units', () => {
    const unit = { ...makeUnit([
      { condition: { type: 'always' }, action: { type: 'patrol' }, priority: 0 },
    ]), stunned: true };
    const result = evaluateRules(unit);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/rules.test.ts
```

- [ ] **Step 3: Implement rules.ts**

```ts
import type { Unit, Rule, Action, Condition } from './types';
import { getOccupied } from './buffer';

function matchesCondition(unit: Unit, condition: Condition): boolean {
  const entries = getOccupied(unit.buffer);
  switch (condition.type) {
    case 'buffer_has':
      return entries.some(e => e.type === condition.signalType);
    case 'buffer_empty':
      return entries.length === 0;
    case 'buffer_full':
      return entries.length >= unit.buffer.capacity;
    case 'always':
      return true;
  }
}

export type RuleResult = { action: Action; rule: Rule; reason: string } | null;

export function evaluateRules(unit: Unit): RuleResult {
  if (unit.stunned) return null;

  const sorted = [...unit.rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (matchesCondition(unit, rule.condition)) {
      return {
        action: rule.action,
        rule,
        reason: `Rule ${rule.priority}: ${rule.condition.type} → ${rule.action.type}`,
      };
    }
  }
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/rules.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/rules.ts apps/robot-uprising/src/test/engine/rules.test.ts
git commit -m "feat(robot-uprising): rule evaluation logic with tests"
```

---

### Task 6: Movement Logic

**Files:**
- Create: `apps/robot-uprising/src/engine/movement.ts`
- Create: `apps/robot-uprising/src/test/engine/movement.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { moveToward, patrol, getNextPatrolPosition } from '../../engine/movement';
import type { Position, Board, Tile } from '../../engine/types';

function makeBoard(): Board {
  const tiles: Tile[][] = [];
  for (let y = 0; y < 8; y++) {
    tiles[y] = [];
    for (let x = 0; x < 8; x++) {
      tiles[y][x] = { position: { x, y }, type: 'ground' };
    }
  }
  return { width: 8, height: 8, tiles };
}

describe('movement', () => {
  it('moves one step toward target', () => {
    const from: Position = { x: 0, y: 0 };
    const target: Position = { x: 3, y: 0 };
    const result = moveToward(from, target, 1, makeBoard());
    expect(result.x).toBe(1);
    expect(result.y).toBe(0);
  });

  it('moves up to speed tiles toward target', () => {
    const from: Position = { x: 0, y: 0 };
    const target: Position = { x: 5, y: 0 };
    const result = moveToward(from, target, 2, makeBoard());
    expect(result.x).toBe(2);
  });

  it('does not move past target', () => {
    const from: Position = { x: 0, y: 0 };
    const target: Position = { x: 1, y: 0 };
    const result = moveToward(from, target, 3, makeBoard());
    expect(result.x).toBe(1);
  });

  it('stays in bounds', () => {
    const from: Position = { x: 7, y: 7 };
    const target: Position = { x: 10, y: 10 };
    const result = moveToward(from, target, 2, makeBoard());
    expect(result.x).toBeLessThanOrEqual(7);
    expect(result.y).toBeLessThanOrEqual(7);
  });

  it('generates a patrol path', () => {
    const pos = getNextPatrolPosition({ x: 0, y: 0 }, 0, makeBoard());
    expect(pos.x >= 0 && pos.x <= 7).toBe(true);
    expect(pos.y >= 0 && pos.y <= 7).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/movement.test.ts
```

- [ ] **Step 3: Implement movement.ts**

```ts
import type { Position, Board } from './types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function moveToward(from: Position, target: Position, speed: number, board: Board): Position {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return from;

  const steps = Math.min(speed, Math.ceil(dist));
  const nx = from.x + Math.round((dx / dist) * steps);
  const ny = from.y + Math.round((dy / dist) * steps);

  return {
    x: clamp(nx, 0, board.width - 1),
    y: clamp(ny, 0, board.height - 1),
  };
}

// Simple patrol: cycle through cardinal directions
const PATROL_DIRS: Position[] = [
  { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
];

export function getNextPatrolPosition(from: Position, tick: number, board: Board): Position {
  const dir = PATROL_DIRS[tick % PATROL_DIRS.length];
  return {
    x: clamp(from.x + dir.x, 0, board.width - 1),
    y: clamp(from.y + dir.y, 0, board.height - 1),
  };
}

export function patrol(from: Position, speed: number, tick: number, board: Board): Position {
  const target = getNextPatrolPosition(from, tick, board);
  return moveToward(from, target, speed, board);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/movement.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/movement.ts apps/robot-uprising/src/test/engine/movement.test.ts
git commit -m "feat(robot-uprising): movement logic with tests"
```

---

### Task 7: Combat Logic

**Files:**
- Create: `apps/robot-uprising/src/engine/combat.ts`
- Create: `apps/robot-uprising/src/test/engine/combat.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { resolveCombat } from '../../engine/combat';
import { createBuffer } from '../../engine/buffer';
import type { Unit } from '../../engine/types';

function makeUnit(id: string, x: number, y: number, type: 'scout' | 'striker', team: 'player' | 'enemy'): Unit {
  return {
    id, type, team, position: { x, y },
    buffer: createBuffer(6), rules: [], alive: true, stunned: false,
  };
}

describe('combat', () => {
  it('striker eliminates adjacent enemy', () => {
    const striker = makeUnit('s1', 3, 3, 'striker', 'player');
    const enemy = makeUnit('e1', 3, 4, 'scout', 'enemy');
    const events = resolveCombat([striker, enemy]);
    expect(events).toHaveLength(1);
    expect(events[0].targetId).toBe('e1');
  });

  it('does not attack non-adjacent units', () => {
    const striker = makeUnit('s1', 0, 0, 'striker', 'player');
    const enemy = makeUnit('e1', 5, 5, 'scout', 'enemy');
    const events = resolveCombat([striker, enemy]);
    expect(events).toHaveLength(0);
  });

  it('does not attack friendly units', () => {
    const s1 = makeUnit('s1', 3, 3, 'striker', 'player');
    const s2 = makeUnit('s2', 3, 4, 'scout', 'player');
    const events = resolveCombat([s1, s2]);
    expect(events).toHaveLength(0);
  });

  it('mutual elimination when two strikers are adjacent', () => {
    const s1 = makeUnit('s1', 3, 3, 'striker', 'player');
    const s2 = makeUnit('s2', 3, 4, 'striker', 'enemy');
    const events = resolveCombat([s1, s2]);
    expect(events).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/combat.test.ts
```

- [ ] **Step 3: Implement combat.ts**

```ts
import type { Unit, TickEvent, Position } from './types';

function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && (a.x !== b.x || a.y !== b.y);
}

export function resolveCombat(units: Unit[]): Array<{ type: 'combat'; attackerId: string; targetId: string }> {
  const events: Array<{ type: 'combat'; attackerId: string; targetId: string }> = [];
  const strikers = units.filter(u => u.type === 'striker' && u.alive && !u.stunned);

  for (const striker of strikers) {
    const targets = units.filter(u =>
      u.alive &&
      u.team !== striker.team &&
      isAdjacent(striker.position, u.position)
    );
    for (const target of targets) {
      events.push({ type: 'combat', attackerId: striker.id, targetId: target.id });
    }
  }

  return events;
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/combat.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/combat.ts apps/robot-uprising/src/test/engine/combat.test.ts
git commit -m "feat(robot-uprising): one-shot-one-kill combat logic with tests"
```

---

### Task 8: Tick Execution

**Files:**
- Create: `apps/robot-uprising/src/engine/tick.ts`
- Create: `apps/robot-uprising/src/test/engine/tick.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { executeTick } from '../../engine/tick';
import { createBuffer } from '../../engine/buffer';
import type { Unit, Board, Tile, GameState } from '../../engine/types';

function makeBoard(): Board {
  const tiles: Tile[][] = [];
  for (let y = 0; y < 8; y++) {
    tiles[y] = [];
    for (let x = 0; x < 8; x++) {
      tiles[y][x] = { position: { x, y }, type: 'ground' };
    }
  }
  return { width: 8, height: 8, tiles };
}

function makeScout(id: string, x: number, y: number, team: 'player' | 'enemy' = 'player'): Unit {
  return {
    id, type: 'scout', team, position: { x, y },
    buffer: createBuffer(6),
    rules: [{ condition: { type: 'always' }, action: { type: 'patrol' }, priority: 0 }],
    alive: true, stunned: false,
  };
}

describe('tick', () => {
  it('advances tick count', () => {
    const state: GameState = {
      phase: 'watch', board: makeBoard(),
      units: [makeScout('s1', 4, 4)],
      currentTick: 0, tickHistory: [],
      missionComplete: false, missionResult: 'pending',
    };
    const next = executeTick(state);
    expect(next.currentTick).toBe(1);
  });

  it('records tick state in history', () => {
    const state: GameState = {
      phase: 'watch', board: makeBoard(),
      units: [makeScout('s1', 4, 4)],
      currentTick: 0, tickHistory: [],
      missionComplete: false, missionResult: 'pending',
    };
    const next = executeTick(state);
    expect(next.tickHistory).toHaveLength(1);
  });

  it('scout perceives nearby enemy and adds to buffer', () => {
    const state: GameState = {
      phase: 'watch', board: makeBoard(),
      units: [makeScout('s1', 4, 4), makeScout('e1', 6, 4, 'enemy')],
      currentTick: 0, tickHistory: [],
      missionComplete: false, missionResult: 'pending',
    };
    const next = executeTick(state);
    const scout = next.units.find(u => u.id === 's1')!;
    expect(scout.buffer.slots.some(s => s !== null)).toBe(true);
  });

  it('stunned unit recovers after one tick', () => {
    const stunned = { ...makeScout('s1', 4, 4), stunned: true };
    const state: GameState = {
      phase: 'watch', board: makeBoard(),
      units: [stunned],
      currentTick: 0, tickHistory: [],
      missionComplete: false, missionResult: 'pending',
    };
    const next = executeTick(state);
    expect(next.units[0].stunned).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests, verify fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/tick.test.ts
```

- [ ] **Step 3: Implement tick.ts**

```ts
import type { GameState, Unit, TickState, TickEvent, Action } from './types';
import { UNIT_STATS } from './types';
import { generatePerceptions } from './perception';
import { addEntry, isOverloaded, ageEntries } from './buffer';
import { evaluateRules } from './rules';
import { moveToward, patrol } from './movement';
import { resolveCombat } from './combat';

function executeAction(unit: Unit, action: Action, state: GameState): { unit: Unit; events: TickEvent[] } {
  const events: TickEvent[] = [];
  let updated = { ...unit };
  const stats = UNIT_STATS[unit.type];

  switch (action.type) {
    case 'patrol': {
      const newPos = patrol(unit.position, stats.speed, state.currentTick, state.board);
      events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
      updated = { ...updated, position: newPos };
      break;
    }
    case 'move_toward': {
      const threats = state.units.filter(u => u.team !== unit.team && u.alive);
      if (threats.length > 0) {
        const nearest = threats.reduce((a, b) => {
          const da = Math.hypot(a.position.x - unit.position.x, a.position.y - unit.position.y);
          const db = Math.hypot(b.position.x - unit.position.x, b.position.y - unit.position.y);
          return da < db ? a : b;
        });
        const newPos = moveToward(unit.position, nearest.position, stats.speed, state.board);
        events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
        updated = { ...updated, position: newPos };
      }
      break;
    }
    case 'evade': {
      const threats = state.units.filter(u => u.team !== unit.team && u.alive);
      if (threats.length > 0) {
        const nearest = threats[0];
        const awayX = unit.position.x + (unit.position.x - nearest.position.x);
        const awayY = unit.position.y + (unit.position.y - nearest.position.y);
        const target = { x: awayX, y: awayY };
        const newPos = moveToward(unit.position, target, stats.speed, state.board);
        events.push({ type: 'move', unitId: unit.id, from: unit.position, to: newPos });
        updated = { ...updated, position: newPos };
      }
      break;
    }
    case 'idle':
      break;
  }

  events.push({ type: 'act', unitId: unit.id, action, reason: `executed ${action.type}` });
  return { unit: updated, events };
}

export function executeTick(state: GameState): GameState {
  const tick = state.currentTick + 1;
  const events: TickEvent[] = [];
  let units = state.units.map(u => ({ ...u }));

  // 1. Recover stunned units (unstun if buffer is no longer full)
  units = units.map(u => {
    if (!u.stunned) return u;
    const isFull = u.buffer.slots.every(s => s !== null);
    return isFull ? u : { ...u, stunned: false };
  });

  // 2. Age buffer entries
  units = units.map(u => u.alive ? { ...u, buffer: ageEntries(u.buffer) } : u);

  // 3. Perceive
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u.alive) continue;
    const stats = UNIT_STATS[u.type];
    const perceptions = generatePerceptions(u, units, stats.perception, tick);
    for (const entry of perceptions) {
      if (isOverloaded(u.buffer, entry)) {
        units[i] = { ...units[i], stunned: true, buffer: addEntry(units[i].buffer, entry) };
        events.push({ type: 'overload', unitId: u.id });
      } else {
        units[i] = { ...units[i], buffer: addEntry(units[i].buffer, entry) };
      }
      events.push({ type: 'perceive', unitId: u.id, entry });
    }
  }

  // 4. Act (evaluate rules and execute)
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u.alive || u.stunned) continue;
    const result = evaluateRules(u);
    if (result) {
      const { unit: updated, events: actionEvents } = executeAction(u, result.action, { ...state, units, currentTick: tick });
      units[i] = updated;
      events.push(...actionEvents);
    }
  }

  // 5. Combat
  const combatEvents = resolveCombat(units);
  events.push(...combatEvents);
  const killed = new Set(combatEvents.map(e => e.targetId));
  units = units.map(u => killed.has(u.id) ? { ...u, alive: false } : u);

  // 6. Check victory/defeat
  let missionComplete = state.missionComplete;
  let missionResult = state.missionResult;

  // Victory: all player units on objective tiles
  const objectiveTiles = new Set<string>();
  for (const row of state.board.tiles) {
    for (const tile of row) {
      if (tile.type === 'objective') objectiveTiles.add(`${tile.position.x},${tile.position.y}`);
    }
  }
  const playerUnits = units.filter(u => u.team === 'player' && u.alive);
  if (objectiveTiles.size > 0 && playerUnits.length > 0) {
    const allOnObjective = playerUnits.every(u => objectiveTiles.has(`${u.position.x},${u.position.y}`));
    if (allOnObjective) {
      missionComplete = true;
      missionResult = 'victory';
    }
  }

  // Defeat: all player units dead (for future missions with combat)
  if (playerUnits.length === 0) {
    missionComplete = true;
    missionResult = 'defeat';
  }

  const tickState: TickState = { tick, units: units.map(u => ({ ...u })), events };

  return {
    ...state,
    units,
    currentTick: tick,
    tickHistory: [...state.tickHistory, tickState],
    missionComplete,
    missionResult,
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/tick.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/tick.ts apps/robot-uprising/src/test/engine/tick.test.ts
git commit -m "feat(robot-uprising): tick execution engine with tests"
```

---

### Task 9: Game Loop (Multi-Tick Runner)

**Files:**
- Create: `apps/robot-uprising/src/engine/game-loop.ts`

- [ ] **Step 1: Implement game-loop.ts**

This is a controller that runs ticks at configurable speed and exposes start/stop/speed controls.

```ts
import type { GameState } from './types';
import { executeTick } from './tick';

export type GameLoopCallbacks = {
  onTick: (state: GameState) => void;
  onComplete: (state: GameState) => void;
};

export class GameLoop {
  private state: GameState;
  private callbacks: GameLoopCallbacks;
  private running = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private speed = 1; // 1 = 1s/tick, 2 = 0.5s/tick, 0.5 = 2s/tick

  constructor(initialState: GameState, callbacks: GameLoopCallbacks) {
    this.state = initialState;
    this.callbacks = callbacks;
  }

  start() {
    this.running = true;
    this.scheduleTick();
  }

  stop() {
    this.running = false;
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  getState(): GameState {
    return this.state;
  }

  private scheduleTick() {
    if (!this.running) return;
    const delay = 1000 / this.speed;
    this.timeoutId = setTimeout(() => this.tick(), delay);
  }

  private tick() {
    this.state = executeTick(this.state);
    this.callbacks.onTick(this.state);

    if (this.state.missionComplete) {
      this.running = false;
      this.callbacks.onComplete(this.state);
      return;
    }

    this.scheduleTick();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/robot-uprising/src/engine/game-loop.ts
git commit -m "feat(robot-uprising): game loop with speed control"
```

---

### Task 10: Mission 1 Scenario

**Files:**
- Create: `apps/robot-uprising/src/engine/mission1.ts`
- Create: `apps/robot-uprising/src/test/engine/mission1.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createMission1 } from '../../engine/mission1';

describe('mission1', () => {
  it('creates a valid game state with 6x6 grid', () => {
    const state = createMission1();
    expect(state.phase).toBe('plan');
    expect(state.board.width).toBe(6);
    expect(state.board.height).toBe(6);
  });

  it('has two player units', () => {
    const state = createMission1();
    const playerUnits = state.units.filter(u => u.team === 'player');
    expect(playerUnits).toHaveLength(2);
  });

  it('has NO enemies', () => {
    const state = createMission1();
    const enemies = state.units.filter(u => u.team === 'enemy');
    expect(enemies).toHaveLength(0);
  });

  it('units start with buffers full of noise', () => {
    const state = createMission1();
    for (const unit of state.units) {
      const filled = unit.buffer.slots.filter(s => s !== null);
      expect(filled.length).toBe(unit.buffer.capacity);
      expect(filled.every(s => s!.type === 'noise')).toBe(true);
    }
  });

  it('units start stunned (frozen from noise)', () => {
    const state = createMission1();
    expect(state.units.every(u => u.stunned)).toBe(true);
  });

  it('has an objective tile on the board', () => {
    const state = createMission1();
    const hasObjective = state.board.tiles.some(row => row.some(t => t.type === 'objective'));
    expect(hasObjective).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/mission1.test.ts
```

- [ ] **Step 3: Implement mission1.ts**

Mission 1: "Wake Up" — 6x6 grid, 2 pre-placed units frozen with buffers full of noise, 1 objective tile. No enemies. Player filters noise from buffers so units unfreeze and pathfind to the objective.

```ts
import type { GameState, Unit, Board, Tile, BufferEntry } from './types';
import { createBuffer, addEntry } from './buffer';

function createBoard(width: number, height: number, objectivePos: { x: number; y: number }): Board {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      const isObjective = x === objectivePos.x && y === objectivePos.y;
      tiles[y][x] = { position: { x, y }, type: isObjective ? 'objective' : 'ground' };
    }
  }
  return { width, height, tiles };
}

const NOISE_TYPES = [
  'floor vibration', 'EM hum', 'dust count',
  'thermal variance', 'acoustic echo', 'power fluctuation',
];

function fillBufferWithNoise(capacity: number): ReturnType<typeof createBuffer> {
  let buf = createBuffer(capacity);
  for (let i = 0; i < capacity; i++) {
    buf = addEntry(buf, {
      type: 'noise',
      value: NOISE_TYPES[i % NOISE_TYPES.length],
      source: 'environment',
      age: 0,
      tick: 0,
    });
  }
  return buf;
}

export function createMission1(): GameState {
  const objectivePos = { x: 4, y: 1 };
  const board = createBoard(6, 6, objectivePos);

  const unit1: Unit = {
    id: 'unit-1',
    type: 'scout',
    team: 'player',
    position: { x: 1, y: 4 },
    buffer: fillBufferWithNoise(6),
    rules: [
      { condition: { type: 'always' }, action: { type: 'move_toward', target: 'nearest_unknown' }, priority: 0 },
    ],
    alive: true,
    stunned: true, // frozen from noise
  };

  const unit2: Unit = {
    id: 'unit-2',
    type: 'scout',
    team: 'player',
    position: { x: 1, y: 2 },
    buffer: fillBufferWithNoise(6),
    rules: [
      { condition: { type: 'always' }, action: { type: 'move_toward', target: 'nearest_unknown' }, priority: 0 },
    ],
    alive: true,
    stunned: true, // frozen from noise
  };

  return {
    phase: 'plan',
    board,
    units: [unit1, unit2],
    currentTick: 0,
    tickHistory: [],
    missionComplete: false,
    missionResult: 'pending',
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd apps/robot-uprising && npx vitest run src/test/engine/mission1.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/engine/mission1.ts apps/robot-uprising/src/test/engine/mission1.test.ts
git commit -m "feat(robot-uprising): mission 1 scenario setup with tests"
```

---

### Task 11: Zustand Game Store

**Files:**
- Create: `apps/robot-uprising/src/store/game-store.ts`

- [ ] **Step 1: Implement game-store.ts**

```ts
import { create } from 'zustand';
import type { GameState, GamePhase, SignalType } from '../engine/types';
import { executeTick } from '../engine/tick';
import { createMission1 } from '../engine/mission1';

type GameStore = GameState & {
  // Actions
  initMission1: () => void;
  setPhase: (phase: GamePhase) => void;
  runTick: () => void;
  setInspectorTick: (tick: number) => void;
  inspectorTick: number;
  toggleListenFilter: (unitId: string, signalType: SignalType) => void;
  speed: number;
  setSpeed: (speed: number) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  phase: 'plan',
  board: { width: 8, height: 8, tiles: [] },
  units: [],
  currentTick: 0,
  tickHistory: [],
  missionComplete: false,
  missionResult: 'pending',
  inspectorTick: 0,
  speed: 1,

  initMission1: () => {
    const state = createMission1();
    set({ ...state });
  },

  setPhase: (phase) => set({ phase }),

  runTick: () => {
    const state = get();
    const next = executeTick(state);
    set({
      units: next.units,
      currentTick: next.currentTick,
      tickHistory: next.tickHistory,
      missionComplete: next.missionComplete,
      missionResult: next.missionResult,
    });
  },

  setInspectorTick: (tick) => set({ inspectorTick: tick }),

  toggleListenFilter: (unitId, signalType) => {
    set(state => ({
      units: state.units.map(u => {
        if (u.id !== unitId) return u;
        const filter = new Set(u.buffer.listenFilter);
        if (filter.has(signalType)) filter.delete(signalType);
        else filter.add(signalType);
        return { ...u, buffer: { ...u.buffer, listenFilter: filter } };
      }),
    }));
  },

  setSpeed: (speed) => set({ speed }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add apps/robot-uprising/src/store/game-store.ts
git commit -m "feat(robot-uprising): Zustand game store"
```

---

### Task 12: Pixi.js Board Renderer

**Files:**
- Create: `apps/robot-uprising/src/board/Board.tsx`
- Create: `apps/robot-uprising/src/board/create-board.ts`
- Create: `apps/robot-uprising/src/board/render-units.ts`

- [ ] **Step 1: Implement create-board.ts**

```ts
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';

const TILE_SIZE = 64;
// Board size is configurable per mission (6x6 for Mission 1, 8x8 later)
const COLORS = {
  tileDark: 0x1a1a2e,
  tileLight: 0x16213e,
  gridLine: 0x2a2a4a,
  labelColor: 0x4a4a6a,
};

export async function createBoardGraphics(app: Application, boardWidth = 8, boardHeight = 8): Promise<Container> {
  const container = new Container();

  // Draw tiles
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const tile = new Graphics();
      const color = (x + y) % 2 === 0 ? COLORS.tileDark : COLORS.tileLight;
      tile.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      tile.fill(color);
      tile.stroke({ color: COLORS.gridLine, width: 1 });
      container.addChild(tile);
    }
  }

  // Axis labels
  const labelStyle = new TextStyle({ fontSize: 10, fill: COLORS.labelColor, fontFamily: 'monospace' });
  const cols = 'ABCDEFGH';
  for (let x = 0; x < BOARD_SIZE; x++) {
    const label = new Text({ text: cols[x], style: labelStyle });
    label.x = x * TILE_SIZE + TILE_SIZE / 2 - 3;
    label.y = BOARD_SIZE * TILE_SIZE + 4;
    container.addChild(label);
  }
  for (let y = 0; y < BOARD_SIZE; y++) {
    const label = new Text({ text: String(y + 1), style: labelStyle });
    label.x = -14;
    label.y = y * TILE_SIZE + TILE_SIZE / 2 - 5;
    container.addChild(label);
  }

  return container;
}

export { TILE_SIZE, BOARD_SIZE };
```

- [ ] **Step 2: Implement render-units.ts**

```ts
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Unit } from '../engine/types';
import { getFillRatio } from '../engine/buffer';
import { TILE_SIZE } from './create-board';

const UNIT_ICONS: Record<string, string> = {
  scout: '👁',
  striker: '⚔',
  relay: '📡',
  specialist: '🔧',
  command: '🤖',
};

const TEAM_COLORS = {
  player: 0x00ccff,
  enemy: 0xff4444,
};

export function renderUnits(container: Container, units: Unit[], opts?: { ghostOpacity?: number }) {
  container.removeChildren();
  const opacity = opts?.ghostOpacity ?? 1;

  for (const unit of units) {
    if (!unit.alive) continue;

    const unitContainer = new Container();
    unitContainer.x = unit.position.x * TILE_SIZE;
    unitContainer.y = unit.position.y * TILE_SIZE;
    unitContainer.alpha = opacity;

    // Unit background circle
    const bg = new Graphics();
    bg.circle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE * 0.35);
    bg.fill({ color: TEAM_COLORS[unit.team], alpha: 0.3 });
    bg.stroke({ color: TEAM_COLORS[unit.team], width: 2 });
    unitContainer.addChild(bg);

    // Unit icon
    const icon = new Text({
      text: UNIT_ICONS[unit.type] ?? '?',
      style: new TextStyle({ fontSize: 24 }),
    });
    icon.x = TILE_SIZE / 2 - 12;
    icon.y = TILE_SIZE / 2 - 14;
    unitContainer.addChild(icon);

    // Buffer bar
    const fill = getFillRatio(unit.buffer);
    const barWidth = TILE_SIZE - 8;
    const barHeight = 4;
    const barBg = new Graphics();
    barBg.rect(4, TILE_SIZE - 8, barWidth, barHeight);
    barBg.fill(0x333333);
    unitContainer.addChild(barBg);

    const barFg = new Graphics();
    const barColor = fill < 0.5 ? 0x00cc88 : fill < 0.8 ? 0xccaa00 : 0xff4444;
    barFg.rect(4, TILE_SIZE - 8, barWidth * fill, barHeight);
    barFg.fill(barColor);
    unitContainer.addChild(barFg);

    container.addChild(unitContainer);
  }
}
```

- [ ] **Step 3: Implement Board.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { Application, Container } from 'pixi.js';
import { createBoardGraphics, TILE_SIZE, BOARD_SIZE } from './create-board';
import { renderUnits } from './render-units';
import type { Unit } from '../engine/types';

type BoardProps = {
  units: Unit[];
  ghostOpacity?: number;
  onClick?: (x: number, y: number) => void;
};

export function Board({ units, ghostOpacity, onClick }: BoardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const unitLayerRef = useRef<Container | null>(null);

  useEffect(() => {
    const app = new Application();
    const init = async () => {
      await app.init({
        width: TILE_SIZE * BOARD_SIZE + 20,
        height: TILE_SIZE * BOARD_SIZE + 20,
        background: 0x091833,
      });
      if (!canvasRef.current) return;
      canvasRef.current.appendChild(app.canvas);

      const boardContainer = await createBoardGraphics(app);
      boardContainer.x = 16;
      boardContainer.y = 4;
      app.stage.addChild(boardContainer);

      const unitLayer = new Container();
      unitLayer.x = 16;
      unitLayer.y = 4;
      app.stage.addChild(unitLayer);
      unitLayerRef.current = unitLayer;

      appRef.current = app;
    };
    init();

    return () => {
      app.destroy(true);
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (unitLayerRef.current) {
      renderUnits(unitLayerRef.current, units, { ghostOpacity });
    }
  }, [units, ghostOpacity]);

  const handleClick = (e: React.MouseEvent) => {
    if (!onClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 16) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top - 4) / TILE_SIZE);
    if (x >= 0 && x < 8 && y >= 0 && y < 8) onClick(x, y);
  };

  return <div ref={canvasRef} onClick={handleClick} style={{ display: 'inline-block' }} />;
}
```

- [ ] **Step 4: Verify board renders in dev server**

Update `App.tsx` temporarily to render the board:
```tsx
import { useEffect } from 'react';
import { Board } from './board/Board';
import { useGameStore } from './store/game-store';

export function App() {
  const { units, initMission1 } = useGameStore();

  useEffect(() => { initMission1(); }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: '#00ccff', marginBottom: 16 }}>Robot Uprising</h1>
      <Board units={units} />
    </div>
  );
}
```

```bash
cd apps/robot-uprising && npm run dev
```
Expected: 8x8 grid with unit icons visible

- [ ] **Step 5: Commit**

```bash
git add apps/robot-uprising/src/board/ apps/robot-uprising/src/App.tsx
git commit -m "feat(robot-uprising): Pixi.js board renderer with unit sprites and buffer bars"
```

---

### Task 13: Plan Screen

**Files:**
- Create: `apps/robot-uprising/src/screens/PlanScreen.tsx`
- Create: `apps/robot-uprising/src/screens/ContextConfigPanel.tsx`

- [ ] **Step 1: Implement ContextConfigPanel.tsx**

```tsx
import type { SignalType } from '../engine/types';
import { useGameStore } from '../store/game-store';

const SIGNAL_TYPES: SignalType[] = ['threat', 'position', 'terrain', 'comms', 'noise'];
const SIGNAL_LABELS: Record<SignalType, string> = {
  threat: 'Threats',
  position: 'Unit Positions',
  terrain: 'Terrain Data',
  comms: 'Communications',
  noise: 'Background Noise',
};

export function ContextConfigPanel({ unitId }: { unitId: string }) {
  const { units, toggleListenFilter } = useGameStore();
  const unit = units.find(u => u.id === unitId);
  if (!unit) return null;

  return (
    <div style={{ padding: 12, background: '#1a1a2e', borderRadius: 8 }}>
      <h3 style={{ color: '#00ccff', marginBottom: 8, fontSize: 14 }}>Context Filters</h3>
      <p style={{ color: '#666', fontSize: 11, marginBottom: 12 }}>
        Toggle what your scout pays attention to. Ignoring noise frees buffer space for threats.
      </p>
      {SIGNAL_TYPES.map(type => {
        const active = unit.buffer.listenFilter.has(type);
        return (
          <label key={type} style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
            color: active ? '#e0e0e0' : '#555', cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={active}
              onChange={() => toggleListenFilter(unitId, type)}
            />
            <span style={{ fontSize: 13 }}>{SIGNAL_LABELS[type]}</span>
            <span style={{ fontSize: 11, color: active ? '#00cc88' : '#444', marginLeft: 'auto' }}>
              {active ? 'LISTEN' : 'IGNORE'}
            </span>
          </label>
        );
      })}
      <div style={{ marginTop: 12, padding: 8, background: '#0d0d1a', borderRadius: 4, fontSize: 11, color: '#4a4a6a' }}>
        Buffer: {unit.buffer.slots.filter(s => s !== null).length}/{unit.buffer.capacity} slots used
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement PlanScreen.tsx**

```tsx
import { Board } from '../board/Board';
import { ContextConfigPanel } from './ContextConfigPanel';
import { useGameStore } from '../store/game-store';

export function PlanScreen() {
  const { units, setPhase } = useGameStore();
  const playerUnits = units.filter(u => u.team === 'player');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Board — left 50% */}
      <div style={{ flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Board units={units} ghostOpacity={0.7} />
      </div>

      {/* Workbench — right 50% */}
      <div style={{ flex: '0 0 50%', padding: 20, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ color: '#00ccff', margin: 0 }}>Mission 1: Boot</h2>
            <p style={{ color: '#4a4a6a', fontSize: 12, margin: 0 }}>Configure your scout's attention filters</p>
          </div>
          <button
            onClick={() => setPhase('watch')}
            style={{
              padding: '12px 32px', background: '#00ccff', color: '#091833',
              border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 'bold',
              cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            EXECUTE
          </button>
        </div>

        {playerUnits.map(u => (
          <ContextConfigPanel key={u.id} unitId={u.id} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/robot-uprising/src/screens/PlanScreen.tsx apps/robot-uprising/src/screens/ContextConfigPanel.tsx
git commit -m "feat(robot-uprising): Plan screen with context config panel"
```

---

### Task 14: Sealed Watch Screen

**Files:**
- Create: `apps/robot-uprising/src/screens/SealedWatch.tsx`

- [ ] **Step 1: Implement SealedWatch.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { Board } from '../board/Board';
import { useGameStore } from '../store/game-store';

export function SealedWatch() {
  const { units, currentTick, missionComplete, missionResult, runTick, setPhase, speed } = useGameStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const delay = 1000 / speed;
    intervalRef.current = setInterval(() => {
      const state = useGameStore.getState();
      if (state.missionComplete) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      state.runTick();
    }, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed]);

  // Max ticks safety valve
  useEffect(() => {
    if (currentTick >= 60) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      useGameStore.setState({ missionComplete: true, missionResult: 'defeat' });
    }
  }, [currentTick]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
      {/* Tick clock */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: 2,
            background: i < currentTick ? '#ccaa00' : '#1a1a2e',
            border: '1px solid #2a2a4a',
          }} />
        ))}
      </div>

      {/* Board */}
      <Board units={units} />

      {/* Status */}
      <div style={{ marginTop: 16, color: '#4a4a6a', fontSize: 14, fontFamily: 'monospace' }}>
        Tick {currentTick}
        {missionComplete && (
          <span style={{ color: missionResult === 'victory' ? '#00cc88' : '#ff4444', marginLeft: 12 }}>
            {missionResult === 'victory' ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          </span>
        )}
      </div>

      {/* Proceed to inspector after completion */}
      {missionComplete && (
        <button
          onClick={() => setPhase('inspect')}
          style={{
            marginTop: 16, padding: '8px 24px', background: '#00ccff', color: '#091833',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          INSPECT
        </button>
      )}

      {/* Speed controls */}
      {!missionComplete && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {[0.5, 1, 2].map(s => (
            <button key={s} onClick={() => useGameStore.setState({ speed: s })} style={{
              padding: '4px 12px', background: speed === s ? '#00ccff' : '#1a1a2e',
              color: speed === s ? '#091833' : '#4a4a6a', border: '1px solid #2a2a4a',
              borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 12,
            }}>
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/robot-uprising/src/screens/SealedWatch.tsx
git commit -m "feat(robot-uprising): Sealed Watch screen with tick clock and speed controls"
```

---

### Task 15: Inspector Screen

**Files:**
- Create: `apps/robot-uprising/src/screens/Inspector.tsx`

- [ ] **Step 1: Implement Inspector.tsx**

```tsx
import { useState } from 'react';
import { Board } from '../board/Board';
import { useGameStore } from '../store/game-store';
import type { Unit, TickEvent } from '../engine/types';

export function Inspector() {
  const { tickHistory, missionResult, setPhase, units: currentUnits } = useGameStore();
  const [inspectTick, setInspectTick] = useState(tickHistory.length - 1);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const tickState = tickHistory[inspectTick];
  const displayUnits = tickState?.units ?? currentUnits;
  const events = tickState?.events ?? [];
  const selectedUnit = selectedUnitId ? displayUnits.find(u => u.id === selectedUnitId) : null;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Board — left */}
      <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Timeline scrubber */}
        <div style={{ marginBottom: 16, width: '80%' }}>
          <input
            type="range"
            min={0}
            max={tickHistory.length - 1}
            value={inspectTick}
            onChange={e => setInspectTick(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4a6a', fontSize: 11 }}>
            <span>Tick 0</span>
            <span style={{ color: '#00ccff' }}>Tick {inspectTick + 1}</span>
            <span>Tick {tickHistory.length}</span>
          </div>
        </div>

        <Board
          units={displayUnits}
          onClick={(x, y) => {
            const clicked = displayUnits.find(u => u.position.x === x && u.position.y === y);
            setSelectedUnitId(clicked?.id ?? null);
          }}
        />

        <div style={{ marginTop: 16, color: missionResult === 'victory' ? '#00cc88' : '#ff4444', fontSize: 16 }}>
          {missionResult === 'victory' ? 'VICTORY' : 'DEFEAT'}
        </div>
      </div>

      {/* Sidebar — right */}
      <div style={{ flex: '0 0 50%', padding: 20, overflowY: 'auto' }}>
        {selectedUnit ? (
          <UnitInspector unit={selectedUnit} events={events} />
        ) : (
          <div>
            <h3 style={{ color: '#00ccff' }}>Inspector</h3>
            <p style={{ color: '#4a4a6a', fontSize: 13 }}>Click a unit on the board to inspect its state at tick {inspectTick + 1}.</p>
            <h4 style={{ color: '#666', marginTop: 16 }}>Events this tick:</h4>
            <EventLog events={events} />
          </div>
        )}

        <button
          onClick={() => {
            useGameStore.getState().initMission1();
            setPhase('plan');
          }}
          style={{
            marginTop: 24, padding: '8px 24px', background: '#1a1a2e', color: '#00ccff',
            border: '1px solid #00ccff', borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          REDESIGN
        </button>
      </div>
    </div>
  );
}

function UnitInspector({ unit, events }: { unit: Unit; events: TickEvent[] }) {
  const unitEvents = events.filter(e => 'unitId' in e && e.unitId === unit.id);

  return (
    <div>
      <h3 style={{ color: '#00ccff' }}>{unit.id} ({unit.type})</h3>
      <p style={{ color: unit.alive ? '#00cc88' : '#ff4444', fontSize: 12 }}>
        {unit.alive ? 'ALIVE' : 'DESTROYED'} {unit.stunned ? '(STUNNED)' : ''}
      </p>

      <h4 style={{ color: '#666', marginTop: 12 }}>Context Window ({unit.buffer.slots.filter(s => s !== null).length}/{unit.buffer.capacity})</h4>
      <div style={{ background: '#0d0d1a', padding: 8, borderRadius: 4, fontSize: 12 }}>
        {unit.buffer.slots.map((slot, i) => (
          <div key={i} style={{ color: slot ? '#e0e0e0' : '#333', padding: '2px 0' }}>
            [{i}] {slot ? `${slot.type}: ${slot.value} (age: ${slot.age})` : '— empty —'}
          </div>
        ))}
      </div>

      <h4 style={{ color: '#666', marginTop: 12 }}>Decision Trace</h4>
      <EventLog events={unitEvents} />
    </div>
  );
}

function EventLog({ events }: { events: TickEvent[] }) {
  return (
    <div style={{ background: '#0d0d1a', padding: 8, borderRadius: 4, fontSize: 11, maxHeight: 300, overflowY: 'auto' }}>
      {events.length === 0 && <div style={{ color: '#333' }}>No events</div>}
      {events.map((e, i) => (
        <div key={i} style={{ color: '#4a4a6a', padding: '1px 0' }}>
          {formatEvent(e)}
        </div>
      ))}
    </div>
  );
}

function formatEvent(e: TickEvent): string {
  switch (e.type) {
    case 'perceive': return `${e.unitId} perceived ${e.entry.type} from ${e.entry.source}`;
    case 'act': return `${e.unitId} → ${e.action.type} (${e.reason})`;
    case 'combat': return `${e.attackerId} eliminated ${e.targetId}`;
    case 'move': return `${e.unitId} moved (${e.from.x},${e.from.y})→(${e.to.x},${e.to.y})`;
    case 'overload': return `${e.unitId} CONTEXT OVERLOAD — stunned 1 tick`;
    case 'buffer_full': return `${e.unitId} buffer full`;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/robot-uprising/src/screens/Inspector.tsx
git commit -m "feat(robot-uprising): Inspector screen with timeline scrubber and unit inspection"
```

---

### Task 16: Wire Three-Screen Loop in App.tsx

**Files:**
- Modify: `apps/robot-uprising/src/App.tsx`

- [ ] **Step 1: Wire screens together**

```tsx
import { useEffect } from 'react';
import { useGameStore } from './store/game-store';
import { PlanScreen } from './screens/PlanScreen';
import { SealedWatch } from './screens/SealedWatch';
import { Inspector } from './screens/Inspector';

export function App() {
  const { phase, initMission1, units } = useGameStore();

  useEffect(() => {
    if (units.length === 0) initMission1();
  }, []);

  switch (phase) {
    case 'plan': return <PlanScreen />;
    case 'watch': return <SealedWatch />;
    case 'inspect': return <Inspector />;
  }
}
```

- [ ] **Step 2: Verify full loop works in dev server**

```bash
cd apps/robot-uprising && npm run dev
```
Expected: Plan screen → click EXECUTE → watch ticks play out → click INSPECT → timeline scrubber + unit inspection → click REDESIGN → back to plan

- [ ] **Step 3: Commit**

```bash
git add apps/robot-uprising/src/App.tsx
git commit -m "feat(robot-uprising): wire three-screen loop (Plan → Watch → Inspector)"
```

---

### Task 17: Playwright E2E Test

**Files:**
- Create: `apps/robot-uprising/src/test/e2e/mission1.spec.ts`
- Create: `apps/robot-uprising/playwright.config.ts`

- [ ] **Step 1: Create playwright config**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/test/e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 2: Write E2E test**

```ts
import { test, expect } from '@playwright/test';

test('Mission 1: full three-screen loop', async ({ page }) => {
  await page.goto('/');

  // Plan screen loads
  await expect(page.locator('text=Mission 1')).toBeVisible();
  await expect(page.locator('text=EXECUTE')).toBeVisible();

  // Context filter toggles are visible
  await expect(page.locator('text=Threats')).toBeVisible();
  await expect(page.locator('text=Background Noise')).toBeVisible();

  // Toggle off noise
  const noiseCheckbox = page.locator('text=Background Noise').locator('..').locator('input');
  await noiseCheckbox.uncheck();

  // Execute
  await page.locator('text=EXECUTE').click();

  // Sealed watch — tick clock visible
  await expect(page.locator('text=Tick')).toBeVisible({ timeout: 5000 });

  // Wait for mission to complete (max 60 ticks at 1s each, but we speed it up)
  await expect(page.locator('text=INSPECT')).toBeVisible({ timeout: 120000 });

  // Enter inspector
  await page.locator('text=INSPECT').click();
  await expect(page.locator('text=Inspector')).toBeVisible();

  // Timeline scrubber present
  await expect(page.locator('input[type="range"]')).toBeVisible();

  // Redesign button
  await expect(page.locator('text=REDESIGN')).toBeVisible();
});
```

- [ ] **Step 3: Run E2E test**

```bash
cd apps/robot-uprising && npx playwright test
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/robot-uprising/playwright.config.ts apps/robot-uprising/src/test/e2e/mission1.spec.ts
git commit -m "test(robot-uprising): Playwright E2E test for Mission 1 three-screen loop"
```
