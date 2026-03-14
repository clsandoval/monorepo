# Toast Re-Entry and Session Boundary Detection After Snooze

**Aspect:** 4.69e-i-a-vi — Toast re-entry and session boundary detection after snooze: when does "session" end — tab close, game close, 30min idle? Browser sessionStorage vs. explicit game session tracking; edge cases with multiple tabs

**Parent:** 4.69e-i-a-i — "Don't show again" placement decision (Two-Tier Dismissal recommendation)
**Grandparent:** 4.69e-i-a — Sample size warning threshold
**Great-grandparent:** 4.69e-i — Match-scope filter UI design
**Siblings:** 4.69e-i-a-vii (footer text maintainability); 4.69e-i-a-viii (CTA persistence after suppression); 4.69e-i-a-ix (onboarding exemption)
**Related:** 4.69e-i-a-ii (N threshold in history log); 4.69e-i-a-v (path-to-30 suggestion accuracy)

---

## The Problem Being Solved

The Two-Tier Dismissal model (4.69e-i-a-i, Option 4) gives the sample-size warning toast a `[Snooze for this session]` affordance. The player clicks it, the toast goes away for "this session," and returns at the start of the next session.

This is elegant in the abstract. It becomes a design and implementation puzzle the moment you ask: **what is a session?**

In a native desktop game, this is trivially obvious: session = one game launch. In a web-based game (Robot Uprising uses React + Pixi.js, no backend, browser-native), the question becomes genuinely hard. The browser does not have a strong notion of "session" that maps cleanly onto what the player would intuitively call a session.

**The player mental model of "session" is:**
> "I sat down to play for a while, then stopped. The next time I sit down to play is a new session."

**The browser's available mechanisms are:**
- `sessionStorage`: cleared when the tab is closed (not when the tab is hidden, backgrounded, or navigated away from, but closed)
- `localStorage`: persistent across everything, cleared only when manually wiped or when the game itself clears it
- Explicit timestamp-based expiration in `localStorage`: "snoozed at T, snooze expires after D minutes/hours"
- Explicit game session model: the game itself tracks "session started" events and increments a session counter

Each mechanism produces a different behavioral contract — a different answer to what the player experiences as "session boundaries."

This matters because the session snooze is a **promise made to the player**: "I'll let you work in peace today." If the snooze expires too aggressively, the player feels betrayed (they snoozed this earlier today — why is the toast back?). If it expires too conservatively, the game misses genuine reconsideration moments (the player who snoozed two weeks ago and has since forgotten the warning system exists).

---

## The Core Design Tension

**Aggressive expiry (short session = tab-close or short idle):**
- + Toast recurs frequently, reminding players of epistemic context
- + "Session" matches intuition for casual players (close tab = done for today)
- − Feels spammy for power users who close and reopen tabs constantly
- − Multi-tab workflows get unexpected re-entries

**Conservative expiry (long session = 24h timestamp, daily expiry):**
- + "I snoozed it earlier today and it's still snoozed" — player expectation met
- + Clean semantics: one snooze per calendar day
- − Misses genuine return-from-break moments
- − Players may forget they snoozed and wonder why the warning never appears

**Explicit game session model:**
- + Full control over what "session" means in game terms
- + Can be tuned per-genre expectations
- − Requires implementing session lifecycle in a no-backend web game
- − Coordination with tab lifecycle gets complex

---

## The Four Session Boundary Models

### Model A: Browser Tab — "Tab-Close Session"

**Mechanism:** `sessionStorage`. The snooze flag is written to `sessionStorage` when the player clicks `[Snooze for this session]`. `sessionStorage` is automatically cleared by the browser when the tab is closed.

**Behavioral contract:**
- Snooze is active as long as the tab is open
- Close the tab → snooze expires
- Reload the page (F5) → snooze **persists** (sessionStorage survives reloads in all major browsers)
- Open a new tab to the same game → new sessionStorage context → toast not snoozed in new tab
- Duplicate tab → inherited sessionStorage → toast IS snoozed in duplicate

**What the player experiences:**
- Close and reopen the browser → toast returns on first N<15 analysis
- Switch away and come back to the same tab (even after hours) → still snoozed
- Open a second tab to explore a different career scenario → toast fires in new tab as if snooze never happened

**Strengths:**
- Zero implementation cost beyond a single `sessionStorage.setItem` call
- Well-understood browser API, no custom session logic
- "Session = tab lifetime" is a reasonable mental model for non-technical players who close tabs when they're done
- Naturally handles browser crashes (sessionStorage cleared on crash/restart in most browsers)

**Weaknesses:**
- Power users who work with multiple tabs simultaneously will find the snooze doesn't transfer. Opening "game tab 2" to look at an alternate scenario requires a separate snooze click.
- Players who refresh the page (common in web games when something glitches) find the snooze survived — which is actually correct behavior but might confuse players who expected "reload = fresh start"
- No idle timeout: the player who opens the game Monday morning, snoozes the toast, then comes back Thursday (same tab still pinned in a browser session) is still snoozed — potentially four days later

**The four-day-pinned-tab edge case** is real and benign in practice (the player isn't running analyses while their computer is sleeping) but philosophically odd. The snooze is semantically infinite as long as the tab stays open.

---

### Model B: Calendar Day — "Daily Snooze"

**Mechanism:** `localStorage` with a timestamp. When the player clicks `[Snooze for this session]`, write `{ snoozedAt: Date.now() }` to `localStorage`. On every toast-check, compare `snoozedAt` against `Date.now()` with a daily boundary:

```js
function isToastSnoozed() {
  const entry = localStorage.getItem('sampleSizeToastSnooze');
  if (!entry) return false;
  const { snoozedAt } = JSON.parse(entry);
  const snoozedDay = new Date(snoozedAt).toDateString();
  const today = new Date().toDateString();
  return snoozedDay === today; // same calendar day = still snoozed
}
```

**Behavioral contract:**
- Snooze is active for the rest of the calendar day (midnight local time)
- Close and reopen the browser same day → still snoozed
- Open a new tab → still snoozed (localStorage is shared across tabs)
- Come back the next day → snooze expired, toast returns on first N<15 analysis

**What the player experiences:**
- Snooze it at 2pm → still snoozed at 9pm when they return for an evening session
- Next morning → toast returns on first small-N analysis, grounding them in epistemic context
- Multiple tabs open simultaneously → all share the snooze (consistent experience)

**Strengths:**
- Matches the most common player intuition about "session": "I'll play a bit today, come back tomorrow"
- Multi-tab consistent: snooze in one tab = snooze in all tabs
- Clean reconsideration cadence: toast returns daily, which is the right frequency for a game played occasionally
- Simple implementation, no session lifecycle required
- No four-day-pinned-tab anomaly: the snooze expires at midnight regardless of tab state

**Weaknesses:**
- Players who play across midnight (common for night-owl gamers) experience a slightly jarring toast re-entry mid-session. Playing from 11pm to 1am = snooze expires at midnight.
- Midnight expiry is timezone-dependent. If the game doesn't correctly use local time (easy to get wrong when mixing UTC and local timestamps), the expiry fires at the wrong time.
- "Calendar day" isn't exactly "session." A player who plays twice in one day (lunch and evening) gets a single combined snooze. The evening session doesn't get an independent snooze decision.

**The midnight problem** is the biggest weakness. A player deeply engaged in late-night analysis work who hits midnight and suddenly sees the toast re-appear will find it disorienting. Mitigation: treat "past midnight but less than 6 hours since snooze" as still snoozed — a minimum snooze duration of 6 hours regardless of calendar day.

---

### Model C: Idle Timeout — "Active Play Session"

**Mechanism:** `localStorage` with a timestamp + rolling idle detection. Snooze is active as long as the player has been "active" recently (made a UI interaction within N minutes). If the player is idle for 30+ minutes, the session expires.

```js
// On any significant interaction, update last-active
document.addEventListener('click', () => {
  localStorage.setItem('lastActive', Date.now());
});

function isToastSnoozed() {
  const entry = localStorage.getItem('sampleSizeToastSnooze');
  if (!entry) return false;
  const { snoozedAt } = JSON.parse(entry);
  const lastActive = parseInt(localStorage.getItem('lastActive') || '0');
  const thirtyMin = 30 * 60 * 1000;
  // If idle for 30min since snooze, consider session expired
  return (Date.now() - Math.max(snoozedAt, lastActive)) < thirtyMin;
}
```

Wait — this logic doesn't work as written. The idle timeout approach requires tracking session lifecycle explicitly:

```
SNOOZE CLICKED at T=0
  → write snoozeSessionId = currentSessionId to localStorage

SESSION TRACKING:
  → "session starts" when game loads (tab opens)
  → "session ends" (effectively) when idle > 30min
  → increment sessionId on load if lastIdle > 30min

TOAST CHECK:
  → if snoozeSessionId === currentSessionId → snoozed
  → else → not snoozed
```

**Behavioral contract:**
- Session = continuous active engagement within 30-minute idle windows
- Playing for 2 hours with breaks < 30min = single session
- Step away for lunch (45 min) → new session → toast returns

**What the player experiences:**
- Snooze at the start of an analysis session, work intensively for 2 hours → never see it again that session
- Walk away, come back after a meal → toast returns on first N<15 analysis as a gentle "welcome back" cue
- Multi-tab: both tabs share the same sessionId (stored in localStorage) → consistent behavior

**Strengths:**
- Matches the most *behavioral* definition of session: what the player would naturally call "sitting down to play"
- 30-minute idle as session boundary matches conventions in analytics (Google Analytics, etc.) and player expectation
- Reconsideration cadences are natural: short breaks don't break the snooze, long breaks do

**Weaknesses:**
- Substantially more complex to implement correctly in a no-backend web game
- The idle clock runs even when the player is *passively observing* the battlefield (watching an execution play out) — they're still engaged, but no click events fire. Requires distinguishing "passive observation" from "genuinely idle"
- Edge cases: player pauses the battle, watches it for 35 minutes, game thinks session ended, comes back to planning phase and sees toast fire mid-observation
- Multi-tab coordination: which tab's idle events count? If tab 1 is active and tab 2 is in the background, tab 2's idle clock would falsely expire

**The passive-observation problem** is the biggest challenge. Robot Uprising explicitly designs for players who watch their agents execute — sometimes for extended periods. An idle timeout that doesn't account for active-but-non-clicking states will incorrectly expire sessions during the most important gameplay moments.

---

### Model D: Explicit Game Session — "First Analysis of Session"

**Mechanism:** The game maintains an explicit session ID that increments each time the game is loaded (tab opened or reloaded). Snooze stores the session ID at the time of click. Toast fires if current session ID ≠ snoozed session ID.

```js
function initSession() {
  // On load: if no sessionId, or if we detect "new session" conditions, increment
  const stored = localStorage.getItem('gameSession');
  const { id: lastId, lastLoadedAt } = stored ? JSON.parse(stored) : { id: 0, lastLoadedAt: 0 };

  const hoursSinceLoad = (Date.now() - lastLoadedAt) / (1000 * 60 * 60);
  const isNewSession = hoursSinceLoad > 4; // new session if 4+ hours since last load

  const newId = isNewSession ? lastId + 1 : lastId;
  localStorage.setItem('gameSession', JSON.stringify({ id: newId, lastLoadedAt: Date.now() }));
  return newId;
}
```

**Behavioral contract:**
- Snooze = snoozed for this session ID
- New tab (different sessionStorage → same localStorage session ID) → toast snoozed
- Reload within 4 hours → same session ID → still snoozed
- Reload after 4+ hours → new session ID → toast returns
- 4-hour threshold tunable without UI changes

**What the player experiences:**
- Close the game and open it again within the same evening → probably same session → still snoozed
- Come back next day → new session → toast returns
- Accidentally close and immediately reopen → same session → snooze preserved (no punishment for accidental close)
- Multiple tabs → same session ID → consistent behavior

**Strengths:**
- Full design control over what "session" means
- Multi-tab consistency (all tabs share the localStorage session ID)
- The threshold (4h default) is a tuneable constant — can be adjusted based on playtesting without changing the architecture
- Survives tab close and reopen (unlike Model A), so accidental closes don't punish players
- Can be extended: session metadata can carry other state (onboarding step, current mission context, etc.)

**Weaknesses:**
- More complex than Models A and B
- The 4-hour threshold is arbitrary. Different players have different session patterns. A casual player who plays for 20 minutes every evening might never trigger a new session if they always reload within 4 hours (unlikely but possible if they keep the tab open)
- "Session ID" in localStorage means it's shared across all game saves on the same browser. If the game has multiple profiles (a later design consideration), profile-switching could get confusing
- Requires the game to be architected with session initialization early in the load lifecycle

---

## Comparison Matrix

| Model | Mechanism | Multi-tab | Survives reload | Expiry | Complexity | Midnight problem |
|-------|-----------|-----------|-----------------|--------|------------|-----------------|
| A: Tab-close | `sessionStorage` | No | Yes | Tab close | Trivial | None (tab-scoped) |
| B: Calendar day | `localStorage` + date | Yes | Yes | Midnight | Low | Yes |
| C: Idle timeout | `localStorage` + idle events | Partial | Yes | 30min idle | High | None (behavior-scoped) |
| D: Explicit session ID | `localStorage` + threshold | Yes | Yes | 4h after load | Medium | No (hour-based) |

---

## The Midnight Variant of Model B

Model B's calendar-day expiry with a **minimum 6-hour floor** solves the midnight problem cleanly:

```js
function isToastSnoozed() {
  const entry = localStorage.getItem('sampleSizeToastSnooze');
  if (!entry) return false;
  const { snoozedAt } = JSON.parse(entry);
  const snoozedDay = new Date(snoozedAt).toDateString();
  const today = new Date().toDateString();
  const minDurationMs = 6 * 60 * 60 * 1000; // 6 hours minimum
  const enoughTimePassed = (Date.now() - snoozedAt) >= minDurationMs;
  // Snoozed = same calendar day OR not yet 6 hours
  return snoozedDay === today || !enoughTimePassed;
}
```

This means:
- Snooze at 2pm → expires at midnight (8 hours later — past the 6h minimum)
- Snooze at 10pm → doesn't expire at midnight (only 2h, below minimum); expires at 4am instead
- Snooze at 11:30pm → expires at 5:30am

The late-night player is protected. The next-morning player sees the toast return at their natural wake-up time. This is Model B with a small patch.

---

## Recommended Model: B with Midnight Floor (Model B+)

**Implementation:**
```js
const SNOOZE_KEY = 'sampleSizeToast_snooze';
const MIN_SNOOZE_MS = 6 * 60 * 60 * 1000; // 6 hours

function snoozeToast() {
  localStorage.setItem(SNOOZE_KEY, JSON.stringify({ snoozedAt: Date.now() }));
}

function isToastSnoozed() {
  const raw = localStorage.getItem(SNOOZE_KEY);
  if (!raw) return false;
  const { snoozedAt } = JSON.parse(raw);
  const now = Date.now();
  const elapsed = now - snoozedAt;
  if (elapsed < MIN_SNOOZE_MS) return true; // floor: never expire in under 6h
  const snoozedDay = new Date(snoozedAt).toDateString();
  const today = new Date().toDateString();
  return snoozedDay === today; // expire at calendar-day boundary (past the 6h floor)
}

function clearSnooze() { // called when permanent suppress is enabled
  localStorage.removeItem(SNOOZE_KEY);
}
```

**Why Model B+ wins:**
1. **Multi-tab consistency** — all tabs share localStorage. Snooze in the analysis tab = snoozed in the review tab you open to cross-reference. No surprise toast re-entries when switching windows.
2. **Survives accidental close** — the most common source of player frustration with tab-scoped Model A. Closing and reopening the tab while in the middle of an analysis session means the snooze is preserved.
3. **Natural reconsideration cadence** — daily feels right for a game about career-level pattern analysis. The player comes back the next morning, runs an analysis, sees the warning, and is reminded of the epistemic context. This is the intended function of the toast: not just to warn once, but to periodically re-ground the player.
4. **Minimal implementation cost** — `localStorage` with two date comparisons. No session lifecycle management, no idle detection, no event listeners beyond the snooze click itself.
5. **No midnight problem with the floor** — the 6-hour minimum protects late-night sessions without any UX complexity visible to the player.

---

## Multi-Tab Deep Dive

Even with Model B+ (localStorage-based, multi-tab consistent), specific multi-tab workflows need examination:

**Scenario 1: Analysis in Tab 1, Career history review in Tab 2**
- Player snoozes in Tab 1 while running opponent-filtered analyses
- Opens Tab 2 to cross-reference match history without running analysis
- Returns to Tab 1, continues analysis
- Behavior: Toast snoozed in both tabs. Correct — the player is in one continuous work session.

**Scenario 2: Two independent analysis sessions, different profiles**
- Player running analyses in Tab 1 for their main profile
- Opens Tab 2 to help a friend understand their career stats (loading the game with a different save)
- Player hasn't snoozed yet (this is early in their session)
- Tab 2 opens fresh — toast will fire in Tab 2 if the friend's data has N<15 filtered analyses
- But wait: the friend's data is different. The snooze key is profile-agnostic.
- If the player snoozed in Tab 1 (for their own data), Tab 2 (friend's data) is also snoozed.
- The friend's small-N analysis won't generate the warning toast, even though they probably want it.
- **Edge case behavior:** Arguably wrong. The snooze should probably be profile-aware if the game has multiple profiles.

**Profile-aware snooze key:**
```js
const SNOOZE_KEY = `sampleSizeToast_snooze_${currentProfileId}`;
```

If the game ships without profile support, use a single key. When/if profiles are added, make the key profile-scoped. This is a forward-compatible choice.

**Scenario 3: Player opens the game in a private/incognito window**
- localStorage is isolated per incognito session
- Snooze in regular window → no effect in incognito
- Correct behavior: incognito sessions are effectively "fresh" — the toast fires as expected

**Scenario 4: Player clears browser data**
- localStorage cleared → snooze state gone → toast returns
- Correct behavior: storage clear = fresh state. No special handling needed.

---

## The Competing Demand: Permanent Suppression Clearing the Snooze

When the player navigates to Settings and enables the permanent suppress toggle, what happens to the active snooze state?

**Option 1: Snooze key is irrelevant** — when the suppress toggle is on, the toast-check function returns false before even checking the snooze key. The snooze key stays in localStorage but is ignored.

```js
function shouldShowToast(n) {
  if (isPermanentlySuppressed()) return false; // permanent wins
  if (isToastSnoozed()) return false; // snooze second
  return n < SAMPLE_SIZE_THRESHOLD;
}
```

**Option 2: Enabling permanent suppression clears the snooze key** — keeps localStorage clean, prevents ambiguous state if permanent suppression is later disabled.

```js
function enablePermanentSuppress() {
  localStorage.setItem('sampleSizeToast_permanentSuppress', 'true');
  localStorage.removeItem(SNOOZE_KEY); // clean up snooze state
}
```

**Option 3: Disabling permanent suppression checks if snooze is still active** — if the player briefly enables and then disables permanent suppression, and there's a recent snooze (same day), they should still be snoozed.

Option 1 is cleanest. Option 3 handles an edge case (brief enable/disable of permanent suppression) in the most user-friendly way but requires slightly more logic. For the scope of this system, Option 1 is recommended: permanent suppress wins, state layering is simple and auditable.

---

## Player Journeys

#### Journey: Priya, 27, Product Manager who plays on lunch breaks

**Context:** Priya plays Robot Uprising in her browser during lunch. She opens the game tab at 12:00, works through three career analyses (two full-scope, one opponent-filtered with N=12), snoozes the toast at 12:08. She plays until 12:45, then closes her laptop for afternoon meetings. She reopens the laptop at 5:30pm and the game tab is still open from lunch.

**Minute 0:00 — Return After Afternoon Meetings**
Priya opens her laptop at 5:30pm. The Robot Uprising tab is still open from lunch. She clicks into it.
The game resumes where she left off — the career analysis debrief screen with her Ravenhorn-filtered results visible.
She clicks `[Run Analysis]` again with a new filter: Ravenhorn + Parallax_9 combined (N=9 combined).
The sample-size toast does NOT appear. She's still in the snoozed state from 12:08pm — 5 hours later, same calendar day, above the 6-hour minimum? No — 5 hours is *below* the 6-hour minimum, so the floor kicks in.

**Wait — let's check:** snoozed at 12:08, current time 17:30. Elapsed = 5h22m. Minimum = 6h. 5h22m < 6h. **Toast is still snoozed** due to the floor.

Priya works without interruption. She gets her N=9 result with the amber reliability band visible.
She's slightly comforted by the band — she remembers learning about reliability zones when the toast originally appeared.

**Minute 5:00 — End of Evening Session**
Priya is happy with her analyses. She closes the tab at 6:15pm.
The snooze state remains in localStorage.

**Next morning, 9:00am:** Priya opens the game in a new tab. It's a new day (new `toDateString()`). She runs a full-scope analysis (N=200, no toast needed). Then she runs a filtered analysis with N=11.
The toast fires. She's back from overnight. The warning reappears.
She glances at it, recognizes it, and clicks `[Snooze for this session]` immediately.
Total toast interactions: 2 (one yesterday, one today). Toast is doing its job — periodic re-grounding without being obnoxious.

**UI Annotations:**
- Reliability band: always visible in amber for N < 15 even when toast is snoozed. Band is the passive reminder, toast is the active one.
- Toast does not fire on first run of a new tab if full-scope (N > 30) analysis is the first thing run.
- Snooze click response: immediate 200ms fade-out of toast, no confirmation dialog.

---

#### Journey: Tomasz, 19, College Student, Marathon Session

**Context:** Tomasz plays Robot Uprising obsessively on Friday nights. He opens the game at 8pm and plays until 2am. He snoozes the sample-size toast at 8:12pm (first opponent-filtered analysis of the evening, N=7 against a particularly elusive opponent).

**Minute 0:00 — Opening Session**
8pm. Tomasz boots the game. Opens career analysis.
First filtered analysis of the evening: Ravenhorn only, N=7. Toast appears.
He reads it quickly, clicks `[Snooze for this session]`.
The snooze is stored: `{ snoozedAt: 8:12pm Friday }`.

**Midnight — Session Continues**
12:00am, Saturday. Tomasz is deep in an intricate opponent pattern analysis.
The calendar day flips. Under plain Model B, the toast would re-appear on his next N<15 analysis.
Under Model B+: snoozedAt = 8:12pm Friday. Elapsed = 3h48m. Minimum floor = 6h. **Still snoozed.**
Tomasz doesn't notice midnight. The game doesn't interrupt him. He runs analyses at 12:15, 12:30, 12:47 — all snoozed.

**2:14am — End of Session**
Tomasz closes the laptop. Session ends naturally.
The snooze key in localStorage: `{ snoozedAt: 8:12pm Friday }`.
Elapsed at time of close: 6h2m. Just past the 6h floor.
On Saturday's same-day check: snoozedAt is Friday, today is Saturday → different days → snooze expired.

**Saturday afternoon:**
Tomasz opens the game. Runs a filtered analysis at 3pm. Toast fires — it's been 19 hours since the snooze, different calendar day.
He's back from sleep. The reminder is appropriate. He glances at the amber band without needing the toast text and snoozes it again.

**UI Annotations:**
- The floor protection is invisible to Tomasz. He never experienced a midnight re-entry. This is correct.
- Toast text on Saturday afternoon re-entry: same text as the first occurrence. No "you snoozed this yesterday" language — keep it simple.

---

#### Journey: Ouray, 34, Competitive Player, Heavy Multi-Tab Workflow

**Context:** Ouray (established in the parent analysis as the power-user archetype, 890 career matches) works with 2-4 browser tabs open during deep analysis sessions: one for current career analysis, one for match history review, one for the game wiki, one for his personal notes. He uses `[Snooze for this session]` rather than permanent suppression because he wants to be reminded after a long break (he works in sprints and values the "welcome back" context-setting function of the toast).

**Minute 0:00 — Session Start**
Ouray opens a fresh game tab. Begins a filtered analysis on Cluster 7 opponent group (N=11). Toast fires.
He clicks `[Snooze for this session]`. Written to localStorage.
He opens a second tab (Ctrl+T → navigates to game URL) for cross-reference.

**Minute 1:30 — Second Tab Behavior**
In the second tab, Ouray runs a quick analysis of the same Cluster 7 but with a slightly different date filter (N=9).
No toast. The snooze state is shared via localStorage. ✓
Ouray doesn't notice this — it just works. He gets his N=9 result, sees the amber band, moves on.

**Minute 45:00 — Third Tab, Different Cluster**
Ouray opens a third tab to analyze a different cluster (Cluster 3, N=6). No toast. Same snooze.
He sees the amber band on the result. He's operating fully on band-reading, not toast-reading. The toast was informative once today; now the band is his signal.

**End of session — Next day:**
Ouray opens the game the next morning. It's a new calendar day. His first analysis fires the toast.
He immediately clicks `[Snooze for this session]`. Total per-session toast interactions: 1.
Total per-session toast interactions over 10 sessions: 10 clicks.
Ouray finds this acceptable. He's considered permanent suppression but prefers the daily re-grounding.

**UI Annotations:**
- Multi-tab consistency (localStorage) is invisible to Ouray but foundational to his workflow feeling seamless
- His usage reveals a key insight: for experienced players, the toast migrates from "informative interrupt" to "session initialization ritual" — one click at session start, then forgotten
- The band becomes the real ongoing signal; the toast becomes a calibration cue
- Implication for design: toast phrasing could shift on subsequent occurrences ("Analysis on N=11 matches — directional only" → less explanatory, more terse) but this is a separate aspect (4.69e-i-a-vi-b?)

---

## New Aspects Discovered

The analysis of session boundary mechanics surfaces several downstream design questions:

- **4.69e-i-a-vi-a — Profile-scoped vs. global snooze key:** If Robot Uprising ships with multiple save profiles, should the snooze key be profile-scoped (`snooze_profileId`) or global? Global snooze means helping a friend with their data in a second tab inherits your snooze state, potentially masking their warnings. Profile-scoping requires knowing `currentProfileId` during toast-check initialization.

- **4.69e-i-a-vi-b — Toast text adaptation on repeat encounters:** Should the toast text become more terse after the player has seen it N times? First encounter: full explanatory text with "what does this mean?" context. Subsequent encounters: "N=11 matches — directional zone only" with no explanation. Adapts to the player's learned vocabulary.

- **4.69e-i-a-vi-c — Snooze expiry as session re-entry hook:** The morning toast re-entry (calendar day expiry) is a small "welcome back" ritual for the sample-size warning specifically. Could the same session-boundary detection be reused for other contextual reminders — e.g., "coverage score hasn't been updated in 3 days" or "you have 3 unreviewed career analysis flags"? A generalized session-boundary notification system vs. per-notification custom logic.

- **4.69e-i-a-vi-d — Snooze state visibility in Settings:** If the player opens Settings while a snooze is active, the Notifications panel might show "Sample size warning: snoozed until midnight" vs. just "enabled/disabled." Does exposing snooze expiry time add useful transparency or unnecessary complexity?

- **4.69e-i-a-vi-e — What happens to snooze state when the game is reset/cleared:** If the player initiates a "clear all progress" reset, should localStorage notification states (snooze, permanent suppress) also be cleared? Arguments for: clean slate. Arguments against: notification preferences are independent of game progress — a player who cleared their career history doesn't necessarily want the toast to start pestering them again.

---

## Sensory Description

The session boundary machinery is invisible — and that's the point. The sensory experience of a correctly-implemented Model B+ is:

**Day 1, first snooze:** The toast slides in from the top-right, warm amber against the dark debrief background. The player clicks `[Snooze for this session]` — a crisp, immediate 150ms fade-out. No confirmation. No animation beyond the disappearance. The toast was there; now it isn't. Clean.

**Day 1, subsequent analyses:** No toast. The amber reliability band glows quietly at the top of the results panel — a narrow horizontal bar, warm amber, about the weight of a single UI line. A number in the band: "N=11 · Directional". The band does the ambient reminding. It doesn't pulse or animate. It just sits there, the color doing the work.

**Day 2, first N<15 analysis:** The toast reappears. It doesn't slam in — it slides in from the top with the same gentle entrance as yesterday. For the returning player, it's familiar. For the new-to-morning player, it's context-setting: "oh right, I'm running small-sample data." They click snooze without reading the full text. Two seconds. Gone.

The total sensory footprint of the session boundary system is: one amber band (always), one toast per day (until permanent suppression). Everything else is silence.

---

## Recommendation Summary

**Implement Model B+ (Calendar Day with 6-Hour Minimum Floor):**

1. **Storage:** `localStorage` (multi-tab consistent, survives accidental close)
2. **Key:** `sampleSizeToast_snooze` (profile-scope when multi-profile ships: `sampleSizeToast_snooze_${profileId}`)
3. **Expiry logic:** Same calendar day OR elapsed < 6 hours, whichever is later
4. **On snooze click:** Write `{ snoozedAt: Date.now() }`, no confirmation, immediate toast fade-out
5. **On permanent suppress enable:** Ignore snooze key (permanent wins); optionally clear snooze key for cleanliness
6. **Multi-tab behavior:** Shared via localStorage — all tabs snoozed when any tab snoozes

**Implementation cost:** ~20 lines of JavaScript, two localStorage keys, zero backend calls.

**Player experience:** One toast per session (daily), consistent across tabs, immune to accidental close, immune to midnight boundary disruption for late-night players.
