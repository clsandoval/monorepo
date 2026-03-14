# Toast Snooze Key Scope: Profile-Level vs. Global

**Aspect:** 4.69e-i-a-vi-a — Profile-scoped vs. global snooze key: if multi-profile ships, snooze key should be profile-scoped to prevent cross-profile snooze inheritance when helping another player in a second tab

**Parent:** 4.69e-i-a-vi — Toast re-entry and session boundary detection after snooze (Model B+ recommendation)
**Grandparent:** 4.69e-i-a-i — "Don't show again" placement decision (Two-Tier Dismissal)
**Great-grandparent:** 4.69e-i-a — Sample size warning threshold
**Siblings:** 4.69e-i-a-vi-b (toast text adaptation); 4.69e-i-a-vi-c (snooze expiry as generalized session hook); 4.69e-i-a-vi-d (snooze state visibility in Settings); 4.69e-i-a-vi-e (snooze state on game reset)
**Cross-references:** 4.69e-i-a-iv (confidence intervals for early career), 4.69e-i-a-iii (minimum N configurability)

---

## The Problem Being Solved

The parent analysis (4.69e-i-a-vi) recommended **Model B+** for session boundary detection: a `localStorage` key (`sampleSizeToast_snooze`) with a calendar-day expiry and a 6-hour minimum floor. The key is shared across all browser tabs because `localStorage` is tab-agnostic.

That's a strength for the single-player case: snooze in Tab 1 = snoozed in Tab 2 = seamless multi-tab workflow.

But it becomes a liability the moment **multiple profiles** enter the picture.

`localStorage` is scoped to the browser origin (`game.domain.com`). Every profile stored in that browser shares the same `localStorage` namespace. If the game ships multiple save profiles (or even just two save slots — "main profile" and "experimental"), the snooze key as currently specified is **shared across all of them**.

The failure mode is specific and underappreciated:

> Player A has been playing all evening. They snoozed the sample-size toast at 7pm. At 9pm, they open a second tab to load Profile B — either to help a friend, try an experimental config, or showcase the game. Profile B's filtered analyses have N=8 matches. The sample-size toast should fire. It doesn't. Player A's 7pm snooze, written for Profile A, has silently suppressed the toast for Profile B.

Profile B's player (or Profile A's player in a different mode) never received the epistemic warning they needed. The toast system has been undermined not by explicit choice but by storage collision.

**This document explores the full design space of how the snooze key should be scoped relative to profiles.**

---

## The Architectural Moment

This analysis assumes the game **might** ship multi-profile support. It hasn't been committed yet. The question is: **what architectural choices made now will be cheapest to extend later, and what choices now will require painful rework?**

The snooze key is a tiny implementation detail. But it sits at the junction of three larger systems:
1. **Notification state** — how the game remembers what the player has acknowledged
2. **Profile isolation** — how multiple save slots are kept separate
3. **Session semantics** — what constitutes "one sitting"

Getting the scope wrong means getting all three wrong simultaneously for multi-tab users.

---

## Option 1: Global Key (The Default, Pre-Profile World)

**Implementation:**
```js
const SNOOZE_KEY = 'sampleSizeToast_snooze';
```

**How it works:** One key, shared across all profiles. The current recommendation. Works perfectly in a single-profile world.

**What the player experiences in a multi-profile world:**
- Snoozed in Profile A → Profile B also snoozed (cross-profile contamination)
- Permanent suppression on Profile A → silent for Profile B too (more problematic: permanent = global)
- Household members sharing a laptop inherit each other's notification states

**The compound failure case:** A player who has permanently suppressed the toast on their expert-level Profile A loads a tutorial profile for onboarding a new player. The new player never sees the sample-size warning across their entire onboarding journey. The epistemic scaffolding that the toast provides is silently absent from their entire early career.

**Strengths:**
- Zero additional complexity
- Trivially correct in the single-profile case
- No profile-loading dependency: toast-check can run before profile is fully loaded

**Weaknesses:**
- Cross-profile snooze contamination in every multi-profile scenario
- Permanent suppress on one profile = suppressed everywhere
- No isolation for shared-device households
- Teaching profile / showcase profile scenarios completely broken

**The TikTok clip for this failure:** A streamer loads their "tutorial profile for viewers" while they have permanent suppress from their main profile. A thousand viewers watch a video about configuring filtered analyses and never see the reliability warning that contextualizes everything. The epistemic system is invisible. Nobody understands what the amber band means. Comments: "what does N=8 mean??" "why is the band yellow??" The toast was supposed to teach this.

---

## Option 2: Profile-Scoped Key

**Implementation:**
```js
const SNOOZE_KEY = `sampleSizeToast_snooze_${currentProfileId}`;
```

**How it works:** Each profile has its own snooze key. Snooze state is completely isolated per profile. Loading Profile B clears any inherited state from Profile A's snooze.

**What the player experiences:**
- Snoozed in Profile A → Profile B gets its own fresh snooze state
- Permanent suppress on Profile A → Profile B unaffected
- Helping a friend on Profile B: they get their appropriate warning toast

**Profile ID design question:** What is `currentProfileId`? Options:
- Auto-generated UUID on profile creation: stable, opaque, collision-free
- Player-set display name ("Freya_Main"): human-readable but mutable (rename = new key = state lost)
- Integer index (0, 1, 2): simple but fragile (if profiles are reordered, index 0 changes meaning)

**Recommendation:** UUID. Stable across renames, forks, and reorders. Profile display name can change; UUID is permanent. Store UUID at profile creation, never change it.

**The initialization timing question:** The snooze check must happen after the profile is loaded (to know `currentProfileId`). If the game shows any analysis UI before profile loading completes, there's a race condition. In practice, you can't run career analyses without a loaded profile, so the snooze check naturally happens post-load.

**Strengths:**
- Complete isolation: each profile behaves as if it's in its own `localStorage` namespace (for notification purposes)
- Permanent suppress is per-profile: expert main profile can suppress, tutorial profile keeps warnings
- Shared-device households work correctly: each family member's profile has independent notification state
- Content creator use case works: main profile (suppress enabled) and showcase profile (suppress disabled, toast active) behave independently

**Weaknesses:**
- Requires `currentProfileId` to be initialized before toast-checks run (minor timing dependency)
- If profiles don't ship, this is premature engineering — but it's trivially simple (one string concatenation)
- N profile keys accumulate in localStorage. For 3 profiles and both snooze + permanent-suppress keys: 6 entries. Negligible but non-zero.
- If a profile is deleted, orphaned keys remain in localStorage. Requires cleanup on profile deletion.

**The key proliferation question:** With 3 profiles and 2 notification states (snooze, permanent suppress):
```
sampleSizeToast_snooze_uuid_A
sampleSizeToast_permanentSuppress_uuid_A
sampleSizeToast_snooze_uuid_B
sampleSizeToast_permanentSuppress_uuid_B
sampleSizeToast_snooze_uuid_C
sampleSizeToast_permanentSuppress_uuid_C
```

If the notification system expands (aspect 4.69e-i-a-vi-c: generalized session re-entry hooks), this could grow to 5-10 keys per profile. A profiles object inside a single key might be cleaner at that scale:

```js
// Flat keys (current approach):
'sampleSizeToast_snooze_uuid_A': '{"snoozedAt": 1234567890}'

// Namespaced alternative (scale-friendly):
'notificationState_uuid_A': '{"sampleSizeSnooze": {"snoozedAt": ...}, "coverageStale": {"snoozedAt": ...}}'
```

The namespaced alternative makes profile cleanup trivial (one key to delete) and makes profile export/import natural (one JSON blob = all notification prefs for this profile). This is worth considering as an architecture for the generalized notification system.

---

## Option 3: Snooze Embeds Profile Context (Hybrid Self-Invalidating)

**Implementation:**
```js
// On snooze click:
localStorage.setItem('sampleSizeToast_snooze', JSON.stringify({
  snoozedAt: Date.now(),
  profileId: currentProfileId  // embed profile at snooze time
}));

// On toast check:
function isToastSnoozed(currentProfileId) {
  const raw = localStorage.getItem('sampleSizeToast_snooze');
  if (!raw) return false;
  const { snoozedAt, profileId } = JSON.parse(raw);
  if (profileId !== currentProfileId) return false;  // wrong profile = not snoozed
  // ... then normal expiry check (Model B+)
}
```

**How it works:** The snooze key remains global (single key), but the value includes the profile ID that snoozed it. When the toast-check runs, it compares the stored profile ID against the current profile. If they differ, the snooze is invalid.

**What the player experiences:**
- Snoozed in Profile A → Profile B runs a check → snooze value has `profileId: 'uuid_A'` → current profile is `uuid_B` → **not snoozed** → toast fires correctly
- Snoozed in Profile A → continue working in Profile A → same profile → snoozed correctly
- Switch back to Profile A after Profile B detour → snooze was written for Profile A → still valid if within the same day and 6h floor

**The elegance of this approach:** There's only ever one snooze entry in localStorage. The profile context is embedded as data, not as key structure. Migrating from single-profile (no profileId in value) to multi-profile (profileId embedded) requires only a null-check:

```js
// Backward-compatible version:
function isToastSnoozed(currentProfileId) {
  const raw = localStorage.getItem('sampleSizeToast_snooze');
  if (!raw) return false;
  const { snoozedAt, profileId } = JSON.parse(raw);
  // If no profileId stored (old format), treat as valid for current profile
  // (graceful upgrade from single-profile era)
  if (profileId && profileId !== currentProfileId) return false;
  // ... expiry check
}
```

This is **forward-compatible with zero breaking change**: old snooze entries (no `profileId` field) continue working as global snoozes until they expire naturally. New snooze entries embed the profile ID. No migration required.

**Strengths:**
- Single global key (minimal localStorage footprint)
- Backward compatible: single-profile era entries self-expire without code changes
- Cross-profile contamination prevented for the critical case (Profile A snooze doesn't affect Profile B)
- No orphaned keys on profile deletion (single key)

**Weaknesses:**
- Only one profile can have an "active" snooze state at a time. If Profiles A and B both have active snoozes in a multi-tab session, only the most recently written one is in localStorage. The other is silently expired.
- The multi-profile multi-tab power-user scenario: Ouray has Tab 1 (Profile A) and Tab 2 (Profile B) both running analyses simultaneously. He snoozed Tab 1's toast at 9am (Profile A). He opens Tab 2 (Profile B) and runs an analysis — toast fires (Profile B, different from stored profileId A). He snoozes Tab 2's toast. Now localStorage has Profile B's snooze. He runs another analysis in Tab 1 (Profile A) — snooze is for Profile B now — toast fires again in Tab 1.
- In the simultaneous multi-tab multi-profile case, snooze state thrashes. Each profile overwrites the other's snooze.

**When Option 3 is preferred over Option 2:**
- If profiles are a later feature and you want zero rework: start with Option 3's backward-compatible structure. When profiles ship, it just works.
- If storage footprint is a real concern (unlikely for web game).
- If the multi-tab multi-profile scenario is extremely rare (probably is — who opens two game profiles in parallel tabs?).

---

## Option 4: Notification Preferences as Part of Profile Save Data

**Implementation:**
Rather than a standalone `localStorage` key, notification state is stored inside the profile's save data object.

```js
// Profile save structure (conceptual):
{
  profileId: 'uuid_A',
  displayName: 'Freya',
  careerData: { ... },
  notificationPrefs: {
    sampleSizeToast: {
      permanentlySuppressed: false,
      snoozeHistory: [{ snoozedAt: 1234567890 }]
    }
  }
}
```

**How it works:** When a profile is loaded, its `notificationPrefs` are read. When the toast is snoozed, the profile's save data is updated. When the profile is exported or backed up, notification preferences come along.

**What the player experiences:**
- Complete profile isolation as a structural guarantee (not a key-naming convention)
- If the game supports profile export (e.g., "share your config"), notification preferences travel with the profile
- Profile switch = complete notification state swap
- Profile deletion = automatic notification state deletion (no orphaned keys)

**Strengths:**
- Structurally clean: profile = all state for that profile, no state leaks
- Enables profile portability: export Profile A with all prefs to another device
- No separate notification state management: profile load/save handles everything
- Future-proofing: any new notification type automatically becomes profile-scoped
- No orphaned keys: lifecycle is tied to profile lifecycle

**Weaknesses:**
- Most complex implementation: requires profile save/load system to exist and be stable
- Profile save writes now include notification preference writes (more frequent saves, or notification state could get out of sync if save is throttled)
- If profiles aren't shipped, this entire architecture is premature
- Toast-check requires profile to be fully deserialized (slight startup cost vs. a direct localStorage key lookup)

**When Option 4 is preferred:**
- When the game commits to shipping profiles with import/export
- When the notification system is expected to grow substantially (many notification types × many profiles)
- When profile portability is a design goal ("my exact config on a new computer")

---

## Option 5: User-Level vs. Profile-Level Distinction

Some games distinguish between **user** (an account, a person) and **profile** (a save slot). Under this model:
- A *user* can have multiple *profiles* (save slots, experimental configs, difficulty variations)
- Notification preferences belong to the *user*, not the *profile*

**What this means for snooze:**
- A user who has permanently suppressed the sample-size toast is an expert who doesn't need the warning regardless of which profile they're running
- Snooze state (temporary) could still be profile-scoped (different analysis sessions) but permanent suppress is user-scoped (reflects the player's understanding)

**The two-tier scope model:**
| State | Scope | Rationale |
|-------|-------|-----------|
| Snooze (temporary) | Profile-scoped | "I'm in an analysis session on THIS profile today" |
| Permanent suppress | User-scoped | "I understand small-N analysis; I don't need the warning anywhere" |

This is architecturally coherent but requires the game to have a user/profile distinction. Robot Uprising currently has no backend (no backend = no user accounts in the traditional sense). Implementing "user-level" state in a no-backend web game means either:
- A "default user" per browser with user-level localStorage (effectively global for single-user)
- A user selection screen before profile selection (two-tier navigation adds friction)

For the no-backend architecture, user-level scoping collapses to global scoping. The two-tier scope model only applies if accounts are added.

**Recommendation:** Table this for the account-era. For now, treat both snooze and permanent suppress as profile-scoped under Option 2 or Option 3.

---

## Comparison Matrix

| Option | Footprint | Profile isolation | Multi-tab multi-profile | Backward compat | Complexity |
|--------|-----------|-------------------|--------------------------|-----------------|------------|
| 1: Global key | 1 key | None | Thrashes (last writer wins) | Trivial | None |
| 2: Profile-scoped key | N×1 keys | Complete | Each profile has own key | Requires cleanup | Low |
| 3: Self-invalidating embedded profileId | 1 key | Partial (cross-profile checked) | Thrashes under true parallel multi-profile tabs | Zero (null-check) | Low |
| 4: Profile save data | 0 keys (embedded in save) | Complete | Profile load handles it | Requires profile system | High |
| 5: User/profile distinction | 2 tiers | Partial (permanent = global) | Depends on user system | No-backend collapse | High |

---

## Recommendation

**Ship with Option 3 (Self-Invalidating Embedded ProfileId) as a stepping stone to Option 2.**

**Phase 1 (no multi-profile):**
```js
// profileId = null when profiles don't exist
const SNOOZE_KEY = 'sampleSizeToast_snooze';

function snoozeToast(profileId = null) {
  localStorage.setItem(SNOOZE_KEY, JSON.stringify({
    snoozedAt: Date.now(),
    profileId  // null in single-profile era
  }));
}

function isToastSnoozed(profileId = null) {
  const raw = localStorage.getItem(SNOOZE_KEY);
  if (!raw) return false;
  const { snoozedAt, profileId: storedProfile } = JSON.parse(raw);
  // Cross-profile invalidation (no-op when both are null)
  if (storedProfile !== null && profileId !== null && storedProfile !== profileId) return false;
  // Expiry check (Model B+ logic)
  const now = Date.now();
  if ((now - snoozedAt) < MIN_SNOOZE_MS) return true;
  return new Date(snoozedAt).toDateString() === new Date(now).toDateString();
}
```

**Phase 2 (multi-profile ships):** Switch to Option 2 (profile-scoped key). Existing single-profile snooze entries either: (a) are expired by then, or (b) use the null-profile handling in the null-check to remain valid until their natural expiry. Zero migration work.

**The permanent suppress key should follow the same phase plan:**
- Phase 1: `sampleSizeToast_permanentSuppress` (global)
- Phase 2: `sampleSizeToast_permanentSuppress_${profileId}` (profile-scoped)
- Or in Phase 2, move both into Option 4 (profile save data) if profiles have import/export.

---

## Player Journeys

#### Journey: Freya, 28, Product Designer, Helping Her Partner

**Context:** Freya has been playing Robot Uprising for three weeks. Her profile ("Freya_Main") has 156 career matches and she's permanently suppressed the sample-size toast — she knows the system well. Her partner Kai (who uses the same laptop) has just started playing with Profile "Kai_Learn" — 12 career matches, no suppressions set.

Freya finishes her evening session at 9pm. Kai wants to see what the career analysis feature looks like. Freya offers to walk him through it.

**Minute 0:00 — The Setup**
The screen shows Freya's career analysis debrief — full-scope, N=156, A-tier coverage grade.
Freya opens a new tab and navigates to the game URL.
The game loads the profile selector (Phase 2: profiles exist).
She selects "Kai_Learn."
Kai's career analysis loads — 12 total matches, debrief showing N=12.

**Minute 1:30 — The Filtered Analysis (Global Key Failure Mode)**
*(Without profile-scoping — what would happen with Option 1)*
Kai says: "I heard there's a filter where you can look at just one opponent?"
Freya clicks `[Filter by Opponent]` → selects "Ragnar_VII" → Kai's data: N=4 matches vs. Ragnar.
`[Run Analysis]` → filtered result loads.
**No toast appears.** Freya's permanent suppress (from Kai's perspective: a global key) silently blocks the warning.
The amber reliability band glows in the results — but Kai doesn't know what it means. No toast explains it.
Kai: "Why is there a yellow bar?"
Freya: "Oh that means... actually that means it's not very reliable, we should run more matches."
Kai: "How do you know that?"
Freya: "There was a warning when I first saw it."
Kai: "I didn't see any warning."
*(The ghost of the suppressed toast haunts this moment. The feature that should have introduced Kai to reliability zones is silently absent because of Freya's permanent suppress.)*

**Minute 1:30 — The Filtered Analysis (Profile-Scoped Key — Correct Behavior)**
*(With profile-scoping — what happens with Option 2/3)*
Kai says: "I heard there's a filter where you can look at just one opponent?"
Freya clicks `[Filter by Opponent]` → selects "Ragnar_VII" → Kai's data: N=4 matches vs. Ragnar.
`[Run Analysis]` → filtered result loads.
**Toast fires.** Amber, top-right corner, slides in gently.
*"You're analyzing N=4 matches — this result is exploratory. Small samples can reflect noise, not opponent strategy."*
Two buttons: `[Snooze for this session]` and a text link `[Don't show again →]`.
Kai reads it fully. Freya points: "See that? That's what I mean. Yellow band, small N, take it with a grain of salt."
Kai: "Oh that makes total sense. So the yellow means 'be careful'?"
Freya: "Exactly."

**The difference is everything.** The toast isn't just a warning — it's an introduction to the reliability vocabulary. Without it, that vocabulary has to come from another player who happens to remember when they learned it. With it, the game teaches itself.

**Minute 3:00 — Kai Snoozes**
Kai reads the toast and clicks `[Snooze for this session]`.
Snooze written to localStorage with `profileId: 'uuid_KaiLearn'`.
Subsequent analyses in this tab: toast snoozed for Kai's profile.
Freya's tab (open in background): Freya's permanent suppress (keyed to `uuid_FreyaMain`) unchanged.

**Minute 10:00 — Return to Freya's Profile**
Kai closes the second tab. Freya returns to her tab.
Her career analysis (N=156) is visible. She runs a filtered analysis (N=67) — no toast (permanent suppress).
The two profiles are fully isolated. No cross-contamination in either direction.

**UI Annotations:**
- Profile selector screen: appears on game load if no active session profile; name + career grade shown for each slot
- Tab 2 toast behavior: correct firing based on Kai's profile state, not Freya's
- Toast in Tab 2: full text (first encounter for Kai's profile)
- Amber band: always visible regardless of toast suppression

---

#### Journey: Marcus, 16, Sharing a Gaming Laptop with His Brother Jaime

**Context:** Marcus and Jaime share a laptop. Marcus is competitive — 340 career matches, has seen the toast dozens of times, snoozed it at 8am this morning before his school-day session. Jaime, 14, just started last week — 22 career matches, no suppressions. It's now 4pm; school's out.

Jaime opens the laptop and loads the game. The profile selector shows "Marcus_Competitive" (last used) and "Jaime_Casual." Jaime clicks his profile.

**Minute 0:00 — Jaime's First Filtered Analysis**
Jaime has been curious about the career analysis after seeing Marcus run it. He navigates there.
Full-scope career analysis first: N=22. No toast (not a filtered analysis, sample size acceptable).
He sees a filtered analysis tutorial hint: "Try filtering by opponent to see targeted patterns."
He clicks it. Filter: "GiggleSniper99" — his most-played opponent. N=6.
`[Run Analysis]`.

**Minute 0:30 — The Toast Decision Point**
*(With profile-scoped key — correct behavior)*
Toast fires: amber, sliding in from top-right.
*"Analyzing N=6 matches — exploratory reliability. Results may not reflect stable patterns."*
Jaime reads it. He's 14. He squints. "What does exploratory mean?"

The toast has a `[?]` help link. He clicks it. A small tooltip slides in: "With fewer than 15 matches, one unusual game can skew the whole result. More matches = more reliable patterns."

Jaime: "Oh. So I need more games against GiggleSniper99?"
*(He's just had the exact learning moment the toast was designed to produce.)*

He clicks `[Snooze for this session]`. Toast fades.

*(Without profile-scoped key — broken behavior)*
Marcus snoozed at 8am. It's 4pm — same calendar day, 8 hours elapsed, above the 6h floor.
Model B+ check: elapsed = 8h > 6h minimum floor. Same calendar day: yes. **Toast snoozed.**
Jaime gets no warning. The N=6 result appears with the amber band and no explanation.
He stares at the yellow bar. Runs two more filtered analyses. All appear with amber bands. No context.
He concludes: "The yellow bar probably means something good? Like it's highlighted?"

*(Marcus's snooze has actively taught Jaime the wrong thing.)*

**Minute 5:00 — Later in the Session**
Jaime runs three more filtered analyses during his session. All snoozed (his own snooze from minute 0:30).
Amber bands are visible on all of them. He's starting to associate "amber band = small opponent sample."
He feels like he's learning the vocabulary.

**Minute 60:00 — Marcus Returns**
Marcus opens a new tab (Jaime's session is still in the background tab).
Loads his own profile ("Marcus_Competitive").
Runs a filtered analysis — permanent suppress off (he never enabled it), but snooze check:
His snooze from 8am: `profileId: 'uuid_Marcus', snoozedAt: 8am`. Current time: 5pm. Same day. Toast snoozed.
No toast for Marcus — correct. His own snooze is still active.
The two brothers' snooze states are completely independent. Neither has affected the other.

**UI Annotations:**
- Profile selector: clear name display, last-played timestamp, career tier badge
- Jaime's toast: full first-encounter text; help link `[?]` opens contextual tooltip (not a new screen)
- `[?]` tooltip: slides in as a small floating card below the toast, same amber color family; dismisses on next click anywhere
- After snooze: amber band the only visual reminder; no toast for rest of session
- Marcus's separate session: unaffected; his snooze key is profile-namespaced

---

#### Journey: Cleo, 31, Content Creator, Main vs. Showcase Profile

**Context:** Cleo streams Robot Uprising twice a week. She has two profiles: "Cleo_Main" (903 career matches, permanent suppress enabled — she's an expert and finds the toast patronizing) and "Cleo_Tutorial" (48 career matches, no suppressions — this profile is designed to demonstrate the learning experience for viewers who are new to the game).

Today's stream: "Explaining the career analysis system for new players."

**Minute 0:00 — Stream Setup**
Cleo opens the game and loads "Cleo_Tutorial."
The profile shows 48 career matches. Career grade: C (she's designed this profile with deliberately mediocre configs to create teaching moments).
She navigates to career analysis.

**Minute 2:00 — First Filtered Analysis On Stream**
Cleo explains to viewers: "So the first thing you'll notice when you filter down to specific opponents is this warning that appears..."
She clicks `[Filter by Opponent]` → "StreamerEnemy_01" (a dedicated testing account, N=9 matches against it).
`[Run Analysis]`.

**Minute 2:15 — Toast Fires (Profile-Scoped: Correct)**
The toast fires. Live. On camera.
Amber card, top-right, sliding in.
*"Analyzing N=9 matches — directional reliability. A useful signal, but verify with more matches before major config changes."*
Chat erupts: "omg I've seen that before!" / "what does directional mean" / "AMBER GANG" / "TOAST POG"

Cleo: "There it is. This is the reliability warning. N=9 means nine matches. You need 15 for 'directional', 30 for 'reliable'. This is teaching you to read sample size context."
She lets the toast sit for 30 seconds while explaining. Then snoozes it.
*"I'm going to snooze it so I'm not interrupted during the rest of the analysis, but normally this would fire once per day."*

**What would have happened with global suppress (Option 1 failure):**
Cleo's "Cleo_Main" profile has permanent suppress enabled. Under global key, this suppress would apply to "Cleo_Tutorial" too.
The toast would not fire on stream.
Cleo: "So the first thing you'll notice when you filter..."
*[no toast]*
Cleo: "...hm. It didn't appear. It might be because — actually I think I accidentally turned off the notification on this profile. Let me check Settings real quick."
*[30 seconds of awkward Settings navigation on stream]*
*[Can't find the setting because permanent suppress is on Cleo_Main, not Tutorial — different concept, same key]*
*[Chat: "she broke it lol"]*

Cleo explains: "I think I accidentally globally suppressed it. It should appear for new players — you'll see this when you first play."
The intended teaching moment is replaced by confusion. The stream doesn't show the feature it was meant to demonstrate. Ten thousand viewers don't see the reliability system introduced properly.

**Minute 15:00 — Later in the Stream**
Cleo runs 6 more filtered analyses. Toast snoozed for this session (she snoozed 13 minutes ago).
The amber band is visible on all results. She references it repeatedly: "See the amber band? That's the reliability context. The toast already told you what it means."
Viewers who saw the toast fire at minute 2 now understand the band. The toast seeded the vocabulary; the band reinforces it.

**End-of-Stream (3 Hours Later)**
Cleo ends the stream and opens "Cleo_Main" in a new tab.
She runs full-scope analysis (N=903). No toast (permanent suppress for Main profile).
"Cleo_Tutorial" snooze state: `{ snoozedAt: 2:15pm, profileId: 'uuid_Tutorial' }`.
"Cleo_Main" permanent suppress: `{ suppressed: true, profileId: 'uuid_Main' }`.
Completely isolated. Each profile exactly as configured.

**UI Annotations:**
- Profile selector on load: prominent, clear; shows "Last used: 3 days ago · C tier · 48 matches" for Tutorial profile
- Toast on stream: same amber animation as all other journeys; no special "first stream encounter" treatment (consistency is key)
- Permanent suppress visibility: Settings → Notifications shows per-profile state when profiles exist; "Sample size warning: Off (Cleo_Main) | On (Cleo_Tutorial)"

---

## Strengths and Weaknesses Summary

**Profile-Scoped Key (Option 2/3 hybrid):**

**Strengths:**
- Supports all legitimate multi-profile use cases: sharing, helping, teaching, content creation
- Each profile functions as if it's the only profile in the game
- Permanent suppress is a per-profile expert setting, not a global override
- Clean lifecycle: key creation on profile creation, deletion on profile deletion
- The toast teaches the reliability vocabulary to every new profile that encounters it, independent of what other profiles have suppressed

**Weaknesses:**
- Requires profile initialization before toast-check (minor timing dependency)
- Key proliferation for large numbers of profiles (addressable with namespaced profile save data)
- Simultaneous multi-profile multi-tab sessions produce independent snooze states (each profile manages itself independently — which is correct but means the player can't "snooze for all profiles" in one click)

---

## Interaction Effects

**4.69e-i-a-vi-c — Generalized session re-entry hook:** If snooze becomes a generalized notification mechanism (coverage score stale, unreviewed flags), the profile-scope decision here becomes the foundation for the entire generalized system. Getting profile scope right now means all future notifications inherit the correct architecture automatically. Getting it wrong means a retrofit across N notification types.

**4.69e-i-a-vi-d — Snooze state visibility in Settings:** The Settings → Notifications panel will need to be profile-aware. In a multi-profile world, "snooze state: until midnight" should clarify *which profile's* snooze is being shown. If Settings is global (all profiles), there's an argument for showing per-profile notification state in a table. If Settings is profile-scoped (loads within an active profile session), the current profile's state is shown naturally.

**4.69e-i-a-vi-e — Snooze state on game reset/clear:** If "clear progress" clears a specific profile, profile-scoped snooze keys should be cleared with that profile. Global keys would require the reset to enumerate and clear all notification state globally, which is harder to define precisely in a multi-profile world.

**4.69e-i-a-iii — Min N configurability:** If players can configure the N threshold per-profile (or per-account), the snooze key's profile scope must align with the configuration scope. Inconsistency would produce: Profile A has N threshold = 20 (stricter), Profile B has N threshold = 10 (looser). Profile A's snooze (if global) would suppress warnings for Profile B even when Profile B's 10-match threshold has been crossed.

**4.69h (profile-level vs. global analytics settings — not yet explored):** Any analytics configuration system (thresholds, heuristic weights per aspect 4.63) should follow the same scope decision as notification state. If analytics configuration is profile-scoped, notification state should be too. Mismatched scopes produce confusing mental models.

---

## Comparable Games / Media

**Slay the Spire — Run-Level vs. Persistent Unlocks:**
StS distinguishes between run state (which cards you have this run) and persistent state (which cards have been unlocked permanently). A run is isolated; unlocks persist across runs. The profile-scope problem is analogous: within-profile state (snooze) should be isolated from cross-profile state (nothing by default). StS gets this right by design; the run is the unit of isolation.

**Factorio — Separate Save Files:**
Each Factorio save is completely isolated. Notification states ("tutorial hints") are per-save. The reason is simple: each save is an independent world. The profile-scope design for Robot Uprising follows the same principle: each profile is an independent career.

**Steam — Per-Account Cloud Save:**
Steam cloud saves are per-account. If you log into a different account on the same machine, you get that account's saves. The notification prefs travel with the account. For Robot Uprising's no-backend architecture, profile UUID is the closest analog to account ID.

**Discord — Server-Level vs. Global Notification Settings:**
Discord allows you to configure notification preferences per-server, or set global overrides. "All servers: mentions only" with per-server overrides. This is the user/profile distinction from Option 5 applied in practice. Robot Uprising doesn't need this level of granularity currently, but the pattern is worth knowing: the global setting is the fallback, the per-profile setting overrides.

---

## Sensory Description

The profile-scoped snooze is imperceptible to the player who uses one profile and never thinks about it. The snooze behaves exactly as described in the parent analysis: amber card, gentle entrance, clean fade-out. Nothing about the key-naming architecture is visible.

The moment it becomes sensory is when it **correctly fires** for a secondary profile while the primary profile is suppressed. In Cleo's stream journey, the toast sliding in at minute 2:15 is itself the sensory proof that the architecture is working. The amber animation — 350ms ease-in from top-right, warm amber border pulse at arrival, then static — is the visible expression of a correctly isolated profile state. It's the notification saying: "I see you as a new player. I don't know what your other profile knows."

The failure state (global key) is sensory-invisible from the player's perspective — but produces an absence. The amber card doesn't appear. The toast is gone from the room. The space where the toast should be is just... empty. The failure mode of Option 1 is not an error screen or a glitch. It's a silence where there should have been teaching.

That silence — the missing toast that a new player needed — is the most dangerous kind of bug: invisible, unannounced, and only noticed when someone says "wait, why do you know what the amber band means and I don't?"

---

## New Aspects Discovered

- **4.69e-i-a-vi-a-i — Notification state in profile export:** If profiles support import/export (move your career to another device), should notification preferences (snooze, permanent suppress) travel with the export? Arguments for: complete profile portability. Arguments against: notification prefs are device-session state, not career-state; importing a profile shouldn't mean importing "this player already knows what the toast means."

- **4.69e-i-a-vi-a-ii — "Snooze all profiles" global action:** Power users with 3+ profiles who want to work across them in one session may want a single "snooze all profiles today" action rather than clicking snooze once per profile encounter. Design of the affordance: Settings-level toggle vs. toast option, interaction with profile isolation principle.

- **4.69e-i-a-vi-a-iii — Profile creation inherits notification prefs:** When a new profile is created, should notification preferences default to the current profile's state (inherit) or reset to factory defaults? A player creating a "fresh start" profile probably wants factory defaults; a player creating an "experimental variant" of their main might want to inherit suppress settings.

- **4.69e-i-a-vi-a-iv — The notification audit log:** When the Settings panel is profile-aware, should there be a notification history showing "last 5 toast encounters on this profile" with timestamps? Useful for players debugging "why am I seeing this?" or "I thought I snoozed this?"; interaction with profile-scoped snooze visibility (4.69e-i-a-vi-d).

- **4.69e-i-a-vi-a-v — Global suppress as an explicit super-setting:** If a player wants to suppress a notification across ALL profiles (they're an expert across all their playthroughs), should there be a Settings option explicitly labeled "Suppress across all profiles"? Distinguishes "I've learned this on all my profiles" from "I've learned this on my main profile and want fresh warnings on new profiles."
