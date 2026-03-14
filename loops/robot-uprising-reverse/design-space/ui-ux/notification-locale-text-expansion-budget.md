# Text Expansion Budget Per Locale

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-i-1-a — Text expansion budget per locale: for each of 10 target locales, define max character counts per toast string and per import modal item; fallback strategy when a legitimate localized term exceeds the budget

**Parent:** 4.69e-i-a-i-f-i-α-i-A-i-1 — Toast copy localization standards for accessibility notifications (designed the full localization glossary for 5 locales; identified text expansion as a sub-aspect; L1/L2/L3 layout strategies listed but not formally specced per-locale)

**Grandparent chain:** 4.69e-i-a-i-f-i-α-i-A-i → 4.69e-i-a-i-f-i-α-i-A → 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e-i-a → 4.69e-i → 4.69e

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A-i-1 — Toast copy localization standards (parent; L1/L2/L3 strategies introduced)
- 4.69e-i-a-i-f-i-α-i-A-i — Accessibility settings elevation protocol (English layout dimensions, 10s duration)
- 4.69e-i-a-i-f-i-α-i-A-i-1-b — RTL locale toast layout (Arabic/Hebrew, layout mirroring; parallel concern)
- 4.69e-i-a-i-f-i-α-i-A-i-1-c — Screen reader announcement (ARIA copy vs. visual copy; may affect budget model)
- 4.69e-i-a-i-f-i-α-i-A-i-1-d — Ecosystem vocabulary split in settings panel (same vocabulary ecosystem problem from a different surface)
- 4.69e-i-a-i-f-i-α-i-A-v — Notification verbosity vs. display pref distinction (settings panel label copy, same localization pressure)

---

## The Problem Space

The parent analysis (4.69e-i-a-i-f-i-α-i-A-i-1) produced a full localization glossary covering de-DE, fr-FR, ja-JP, ko-KR, and zh-Hans. It observed that German and French expand significantly (~30–40%), Japanese compresses (~20%), Korean is roughly neutral, and Simplified Chinese compresses to roughly 60% of English character count.

But the glossary did not answer a harder question: **what are the actual permitted character budgets per string, per surface?** Without a budget table, localization vendors have no hard constraint to work against. They will expand freely until the layout breaks. Then engineers will notice at QA, cut strings ad hoc, and lose the semantic precision that the parent analysis worked hard to establish.

This aspect builds the budget table and the fallback protocol.

---

## The Three Surfaces

Before defining budgets, name the surfaces. Three distinct layouts are involved, each with different layout constraints:

### Surface A: The Accessibility Toast

From the parent:
```
┌─────────────────────────────────────────────────┐
│  [☑]  Accessibility settings restored           │
│                                                   │
│  From your imported profile.                     │
│                                                   │
│                                [View Settings →] │
└─────────────────────────────────────────────────┘
```

- **Toast width:** 320px fixed (matches the standard notification toast width in the debrief panel family)
- **Font:** 14px body, 15px title, Inter or system-ui
- **Two text rows:** Title (line 1) + Body (line 2) + Action link (line 3, right-aligned)
- **Layout mode:** Title wraps to 2 lines before any other fallback triggers. Body does NOT wrap — single line only. Action link does NOT wrap.
- **Hard constraint:** Toast height is bounded. At 14px line height with 8px padding, a 2-line title + 1-line body + 1-line action = 4 lines = 88px total. This is the maximum height before the toast overflows the bottom-right anchor and clips under the panel edge.

### Surface B: The Import Modal — Accessibility Section Header

From the parent (4.69e-i-a-i-f-i-α-i-A-i), the import modal lists:
```
  Accessibility Settings
  ✓ Reduced motion (imported)
  ✓ Color adjustment mode: Deuteranopia (imported)
  ✓ Font scale: 120% (imported)
```

- The section header "Accessibility Settings" is a category label — 16px medium weight.
- Each item row is an icon + key label + parenthetical status = three text regions.
- The key label (e.g. "Reduced motion") must fit within ~180px before the parenthetical "(imported)" becomes misaligned.
- Parenthetical "(imported)" is localized separately but is a short fixed string — budget is tight.

### Surface C: The Settings Panel — Accessibility Category Items

The Settings → Accessibility panel uses the same vocabulary as the toast (the whole point is vocabulary consistency). It has a wider layout — 400px minimum content width — so budget constraints are less severe here, but the items must still fit without wrapping the key label onto a second line (which breaks the table-scan reading pattern users rely on).

---

## The 10 Target Locales

Building on the 5 glossary locales from the parent, the full 10-locale target list for Robot Uprising (web-based, Steam, global release):

| # | Code | Language | Script | Text Direction |
|---|------|----------|--------|----------------|
| 1 | en-US | English (US) | Latin | LTR |
| 2 | de-DE | German | Latin | LTR |
| 3 | fr-FR | French | Latin | LTR |
| 4 | es-ES | Spanish (Spain) | Latin | LTR |
| 5 | pt-BR | Brazilian Portuguese | Latin | LTR |
| 6 | ja-JP | Japanese | CJK | LTR (vertical optional) |
| 7 | ko-KR | Korean | Hangul | LTR |
| 8 | zh-Hans | Simplified Chinese | CJK | LTR |
| 9 | ar-SA | Arabic (Saudi) | Arabic | **RTL** |
| 10 | ru-RU | Russian | Cyrillic | LTR |

ar-SA and ru-RU are new locales not covered in the parent glossary. They require additional vocabulary decisions documented in Section 6.

---

## Expansion Coefficients: Empirical Baselines

Before building the budget table, establish what expansion/contraction coefficients are typical for software UI strings in each locale. These are widely-published in localization engineering literature (IBM, Apple HIG, Google Material Design L10n guidelines) and confirmed by the parent's text-expansion analysis for de-DE, fr-FR, ja-JP, ko-KR, zh-Hans.

| Locale | Expansion Coefficient | Notes |
|--------|----------------------|-------|
| en-US | 1.00 (baseline) | |
| de-DE | 1.30–1.45 | Compound noun reduction helps for technical terms; plain prose expands more |
| fr-FR | 1.25–1.35 | Articles + grammatical agreement inflate titles |
| es-ES | 1.20–1.30 | Similar to French but without article inflation for most nouns |
| pt-BR | 1.20–1.30 | Slightly shorter than es-ES for some constructions |
| ja-JP | 0.55–0.75 | CJK compression significant; mixed-kana terms expand toward 0.85 |
| ko-KR | 0.90–1.10 | Roughly neutral; subject-object-verb word order sometimes compresses |
| zh-Hans | 0.50–0.65 | Maximum compression; 2-character terms for long English phrases common |
| ar-SA | 1.20–1.35 | Arabic prose expands; RTL adds layout complexity independent of length |
| ru-RU | 1.25–1.40 | Cyrillic characters are wider; case inflection adds tokens; technical terms borrow from English (shorter) |

**Key insight:** The budget table must accommodate the WORST-CASE expander (de-DE at 1.45) without needing a layout fallback. Fallbacks are for legitimate exceptions where a term *requires* more characters for precision, not for routine expansion that a good translator can mitigate through brevity.

---

## Budget Table: Surface A — Accessibility Toast

The English toast strings and their character counts:

| String ID | English text | en-US chars | Soft budget | Hard budget |
|-----------|-------------|-------------|-------------|-------------|
| `toast.a11y.title` | "Accessibility settings restored" | 32 | 46 | 52 |
| `toast.a11y.body` | "From your imported profile." | 28 | 40 | 46 |
| `toast.a11y.action` | "View Settings →" | 16 | 22 | 28 |

**Budget derivation:**

`toast.a11y.title` renders in the title slot at 15px. The toast is 320px wide, with 12px padding each side = 296px usable. At 15px Inter, approximately 8px per character average (conservative; Latin characters average 6–7px but we budget for wide characters). 296 / 8 = **37 characters before soft wrap triggers.** The title slot permits 2-line wrap, so the hard budget is 2×37 = 74 characters — but a 2-line title that is nearly all-consumed (e.g., 70 characters) makes the toast feel dense. The soft budget is set at 46 (single-line maximum with comfortable margin) and the hard budget at 52 (single-line at font compression + 2-line triggers only in extremis).

`toast.a11y.body` renders at 14px and does NOT wrap. 296px / 7.5px = 39 characters maximum before truncation is needed. Soft budget: 40 (comfortable), hard budget: 46 (requires character compression, acceptable for CJK locales where 46 characters would render at ~23px total width anyway).

`toast.a11y.action` is right-aligned at 14px. It must leave at least 16px of empty space to the left so it does not visually merge with the body text. Usable width: ~200px = ~26 characters. Hard budget 28.

**Per-locale soft budget multiplied:**

| String ID | en-US | de-DE | fr-FR | es-ES | pt-BR | ja-JP | ko-KR | zh-Hans | ar-SA | ru-RU |
|-----------|-------|-------|-------|-------|-------|-------|-------|---------|-------|-------|
| `toast.a11y.title` soft | 32 | **46** | 43 | 41 | 41 | 24 | 35 | 21 | 43 | 45 |
| `toast.a11y.title` hard | 52 | 52 | 52 | 52 | 52 | 52 | 52 | 52 | 52 | 52 |
| `toast.a11y.body` soft | 28 | 40 | 37 | 36 | 36 | 21 | 30 | 18 | 37 | 38 |
| `toast.a11y.body` hard | 46 | 46 | 46 | 46 | 46 | 46 | 46 | 46 | 46 | 46 |
| `toast.a11y.action` soft | 16 | 23 | 21 | 20 | 20 | 12 | 17 | 10 | 21 | 22 |
| `toast.a11y.action` hard | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 |

**Reading the table:** Soft budget is the "write to this" target. Hard budget is the "fail QA if exceeded" ceiling. CJK soft budgets are lower in absolute character count but map to the same pixel width because CJK characters render approximately 2× wider than Latin at the same point size.

**Note on ar-SA:** The budget characters are identical to other locales but the layout direction is RTL. The character budget here assumes correct RTL mirroring is handled by the layout engine (see 4.69e-i-a-i-f-i-α-i-A-i-1-b). Budget enforcement is still necessary because Arabic words are individually long and Arabic prose can expand 1.30× in character count even after good translation.

---

## Budget Table: Surface B — Import Modal Accessibility Items

The import modal items have different strings:

| String ID | English text | en-US chars | Soft budget | Hard budget |
|-----------|-------------|-------------|-------------|-------------|
| `modal.a11y.section` | "Accessibility Settings" | 23 | 33 | 40 |
| `modal.a11y.item.reducedmotion` | "Reduced motion" | 14 | 20 | 26 |
| `modal.a11y.item.coloradj` | "Color adjustment mode" | 21 | 30 | 38 |
| `modal.a11y.item.fontscale` | "Font scale" | 10 | 14 | 20 |
| `modal.a11y.status.imported` | "(imported)" | 10 | 14 | 18 |
| `modal.a11y.status.notimported` | "(not in profile)" | 16 | 23 | 28 |

**Budget derivation:**

The modal content panel is 480px wide with 24px padding each side = 432px usable. The accessibility section sits within a structured list. Each item row has: 20px icon + 8px gap + key label + flexible gap + status parenthetical.

The status parenthetical is right-aligned at 12px. It uses approximately 7px/char = 126px maximum (18 chars × 7px = 126px). This leaves 432 - 126 - 28 = **278px for the key label.** At 14px body text (~7.5px/char), that is ~37 characters — comfortable for all locales under normal expansion.

However, the key label should NOT be allowed to wrap. A wrapped key label forces the status parenthetical to jump to a third line, which breaks the modal's vertical rhythm. Hard budget for all item strings is therefore set at the wrap point: **38 characters** (just under 37px × 1.05 safety margin).

The section header `modal.a11y.section` sits on its own line at 16px medium. Full 432px usable. 40-character hard budget is conservative; actual wrap is closer to 55 characters. Hard budget is set at 40 to enforce briefness of section headers.

**Per-locale (item label soft/hard):**

| String ID | en-US | de-DE | fr-FR | es-ES | pt-BR | ja-JP | ko-KR | zh-Hans | ar-SA | ru-RU |
|-----------|-------|-------|-------|-------|-------|-------|-------|---------|-------|-------|
| `modal.a11y.item.reducedmotion` soft | 14 | 20 | 18 | 18 | 17 | 11 | 15 | 9 | 19 | 20 |
| `modal.a11y.item.reducedmotion` hard | 26 | 26 | 26 | 26 | 26 | 26 | 26 | 26 | 26 | 26 |
| `modal.a11y.item.coloradj` soft | 21 | 30 | 28 | 27 | 26 | 16 | 23 | 14 | 28 | 29 |
| `modal.a11y.item.coloradj` hard | 38 | 38 | 38 | 38 | 38 | 38 | 38 | 38 | 38 | 38 |
| `modal.a11y.status.imported` soft | 10 | 14 | 13 | 13 | 12 | 7 | 11 | 7 | 13 | 14 |
| `modal.a11y.status.imported` hard | 18 | 18 | 18 | 18 | 18 | 18 | 18 | 18 | 18 | 18 |

---

## Budget Table: Surface C — Settings Panel Accessibility Items

The Settings → Accessibility panel has more horizontal space but the same vocabulary. Strings are identical to Surface B item labels (shared string IDs). The layout is a form table:

```
  Accessibility
  ─────────────────────────────
  Reduced motion        [ ON  ]
  Color adjustment mode [ Deuteranopia ▾ ]
  Font scale            [ 120%  ▾ ]
```

The label column is fixed at 200px. At 14px, ~27 characters maximum before wrapping. Items must not wrap — wrapping breaks the form table alignment. The soft budget matches the modal soft budget; the hard budget for Settings panel is **27 characters** (tighter than modal because the column is narrower).

This is relevant: `modal.a11y.item.coloradj` = "Color adjustment mode" = 21 characters. Hard budget 27. German expansion could easily produce "Farbanpassungsmodus" = 20 characters — fine. French "Mode d'ajustement de la couleur" = 31 characters — **exceeds hard budget**. The Settings panel therefore represents the tightest constraint and will drive the fallback protocol.

---

## Vocabulary Decisions for New Locales (ar-SA, ru-RU)

The parent analysis covered de-DE, fr-FR, ja-JP, ko-KR, zh-Hans. Two new locales require vocabulary specification:

### ar-SA — Arabic (Saudi Arabia)

**"Accessibility settings" (إعدادات إمكانية الوصول)**
- iOS Arabic: "إمكانية الوصول" (accessibility) — 16 characters, expands significantly vs. English
- Android Arabic: same term, "إمكانية الوصول"
- WCAG 2.1 Arabic: "إمكانية الوصول" (official W3C translation)
- **Consensus term:** إمكانية الوصول — all three sources agree
- Character count: 16 characters for the concept alone; with "إعدادات" (settings, 8 chars) = 25 characters total vs. English 23. Within budget.

**"Reduced motion" (تقليل الحركة)**
- iOS Arabic: "تقليل الحركة" (reduce motion) — 13 characters. Within budget.
- Android Arabic: "تقليل الرسوم المتحركة" (reduce animations) — 22 characters. **Exceeds soft budget 19.**
- Recommendation: Use iOS Arabic term "تقليل الحركة" (13 chars) — shorter, consistent with OS-level vocabulary that Arabic iOS users will recognize; Android Arabic term is unnecessarily long.

**"Color adjustment mode" (وضع ضبط الألوان)**
- No single consensus; nearest: "ضبط الألوان" (12 chars) as the item label, with the mode value (e.g. "عمى الألوان الأخضر والأحمر" = deuteranopia) as a separate dropdown value.
- Recommendation: Use "ضبط الألوان" (12 chars). Within budget.

**Register note:** Arabic accessibility copy defaults to formal (فصحى / MSA) in software UI. Colloquial (عامية) variants differ by dialect and are inappropriate for software accessibility strings. All ar-SA strings should use MSA formal register.

### ru-RU — Russian

**"Accessibility settings" (Настройки специальных возможностей)**
- The full Russian term "Настройки специальных возможностей" = 36 characters. **Exceeds hard budget for Surface A toast title (52 chars WITH "restored" appended, but "Accessibility settings" alone is 36 chars, leaving only 16 for "restored").**
- iOS Russian: "Специальные возможности" (23 chars) — preferred as standalone section name
- Android Russian: "Специальные возможности" (same)
- Russian Windows: "Специальные возможности" (same)
- **Consensus:** Специальные возможности — 23 characters. Within budget.

**"Accessibility settings restored" as toast title:**
"Специальные возможности восстановлены" = 37 characters. Soft budget for de-DE was 46 chars, here it's 37. Within soft budget (45 for ru-RU). ✓

**"Reduced motion" (Уменьшение движения)**
- iOS Russian: "Уменьшение движения" — 19 characters
- Android Russian: "Устранение анимации" — 19 characters
- Both within soft budget (20 for ru-RU). Either is acceptable; iOS term preferred for platform parity (most web-game players with accessibility needs will have encountered it on iOS first).

**"Color adjustment mode" (Режим коррекции цвета)**
- "Режим коррекции цвета" = 21 characters. Within soft budget (29 for ru-RU). ✓

**Register note:** Russian software UI uses standard literary Russian (литературный русский) register. Informal constructions ("крутые настройки") are inappropriate.

---

## Fallback Protocol: When a Legitimate Term Exceeds Budget

A "legitimate term" is one where:
1. The term matches platform consensus (iOS, Android, OS-level vocabulary) AND
2. The term is the shortest accepted translation that preserves semantic precision AND
3. The term still exceeds the hard budget

This is distinct from a translation that is simply too long because the translator chose a verbose phrasing. The fallback protocol only applies to genuine cases where the required vocabulary exceeds the layout budget.

### The Four Fallback Strategies

**Strategy 1: Abbreviation with tooltip (L1 Fallback)**

Use the full term in the import modal and settings panel (where space is more ample), but use an abbreviated form in the toast.

Example:
- Full: "Barrierefreiheitseinstellungen wiederhergestellt" (de-DE, 48 chars)
- Toast abbreviation: "Barrierefreiheit wiederhergestellt" (34 chars) — drops "Einstellungen" since context makes "settings" implicit in "restored"
- Hover/focus tooltip on the toast title shows the full term for screen readers and discoverability

**Condition for applying:** Toast title exceeds 52-character hard budget. Does NOT apply to body or action link.

**L1 is the preferred first option.** Abbreviation-with-tooltip is lossless for screen reader users and only degrades for visual-only players who skip the tooltip.

**Strategy 2: Two-line title wrap (L2 Fallback)**

Allow the toast title to wrap to two lines. The toast height increases from ~76px to ~92px. This was identified in the parent analysis as a layout cost, not a layout failure.

Example:
- Full: "Barrierefreiheitseinstellungen wiederhergestellt" (48 chars, 390px at 15px Inter → wraps naturally)
- Two-line render: "Barrierefreiheitseinstellungen\nwiederhergestellt"
- Toast height: 92px — within the safe range

**Condition for applying:** Toast title exceeds 52 chars AND abbreviation would lose precision (i.e., the semantic content cannot be shortened without changing meaning). NOT for body or action link.

**L2 is acceptable but must be tested.** The two-line toast looks visually distinct from the one-line toast — if it appears inconsistently (some locales one-line, some two-line), it can feel unpolished. Recommendation: if L2 is needed for any locale, evaluate whether all locales should use L2 for visual consistency.

**Strategy 3: Restructure the string (L3 Fallback — last resort)**

Rewrite the string to convey the same meaning more concisely. This is a last-resort because it requires re-approval from the localization reviewer (the registered expert native speaker identified in the parent analysis for each locale).

Example:
- Original de-DE body: "Von Ihrem importierten Profil." (30 chars, within budget)
- If it were longer: restructure to remove article/preposition ("Aus importiertem Profil." = 24 chars)

**Condition for applying:** L1 and L2 both fail (term is irreducible AND two-line is unacceptable). Requires native-speaker reviewer sign-off. Must be documented in the localization changelog with justification.

**Strategy 4: Character font scaling (L4 Fallback — emergency only)**

Reduce the font size of the specific string from 14px to 12px. Legibility is maintained at 12px for Latin, Cyrillic, and CJK scripts at desktop resolution; at 12px on mobile (320px viewport) Latin is at the minimum accessible size per WCAG 2.1 criterion 1.4.4.

**Condition for applying:** Only when L1–L3 all fail AND the locale is not one with accessibility-impaired player populations (do NOT use L4 for the accessibility toast itself — that would be ironic). L4 is explicitly forbidden for `toast.a11y.*` strings. It is permitted for `modal.a11y.*` strings only at modal item labels (not section header, not status strings).

---

## Budget Exceedance Scenarios: Worked Examples

### Scenario A: German toast title

`toast.a11y.title` in de-DE: "Barrierefreiheitseinstellungen wiederhergestellt"

- Character count: 48
- Soft budget: 46 — **exceeded**
- Hard budget: 52 — within range

**Result:** Within hard budget. L1 not triggered. Translator notes that this translation is 48 chars and should attempt abbreviation. If translator cannot reduce below 46 without precision loss, the string enters the QA queue flagged as "soft-exceeding, needs reviewer." Reviewer may approve as-is (within hard budget) or suggest abbreviated form.

### Scenario B: French item label in Settings panel

`modal.a11y.item.coloradj` in fr-FR: "Mode d'ajustement de la couleur" = 31 chars

- Settings panel hard budget: 27 chars — **exceeded by 4**
- Modal hard budget: 38 chars — within range
- Toast is not relevant (this string doesn't appear in toast)

**Result:** L1 fallback applies to Settings panel only. The full term "Mode d'ajustement de la couleur" is used in the import modal (within hard budget 38). The Settings panel label is abbreviated: "Ajustement des couleurs" (23 chars) — within budget, precision retained, approved without restructure.

Note: this creates a vocabulary inconsistency between the import modal and the Settings panel in fr-FR. This is acceptable IF the two surfaces are never shown simultaneously. If they are shown together (e.g., side-by-side in a split-screen review flow), the inconsistency is confusing and L2 restructure should be used instead to reach a single term used everywhere.

### Scenario C: Russian section header

`modal.a11y.section` in ru-RU: "Настройки специальных возможностей" = 34 chars

- Soft budget: 33 — **exceeded by 1**
- Hard budget: 40 — within range

**Result:** Within hard budget. Soft exceedance of 1 char is acceptable without reviewer escalation. The QA automation tool flags it as a yellow warning (within hard budget but over soft) — the translator reviews but does not need the registered reviewer.

### Scenario D: Korean action link

`toast.a11y.action` in ko-KR: "설정 보기 →" = 6 chars

- Soft budget: 17 — **under budget significantly**
- Hard budget: 28

**Result:** CJK compression in action. The action link is very short. Right-aligned, this will appear as a small right-edge element. Consider whether the tap target size is adequate for mobile (minimum 44px touch target). This is a rendering concern, not a budget concern — but note it in the l10n handoff.

### Scenario E: Arabic body text exceeds hard budget

`toast.a11y.body` in ar-SA: "من ملف تعريف المستورد الخاص بك." = 31 chars but renders RTL at full 320px toast width.

- Char count: 31 (within hard budget 46)
- But Arabic glyphs render wider at 15px; the effective render width may exceed the toast width

**Result:** This is a rendering issue, not a budget issue. Budget enforcement uses character count. The rendering engineer must verify pixel width in QA. If the Arabic body text renders wider than 296px, it is a **rendering bug**, not a budget violation — and is handled by the RTL layout aspect (4.69e-i-a-i-f-i-α-i-A-i-1-b) rather than this aspect.

---

## The Budget Enforcement System

### Automated CI Check

All localized strings pass through a CI lint step that:
1. Reads the budget table (stored as `l10n/budget.json`)
2. For each string key, checks character count against hard budget for each locale
3. Outputs: PASS, WARN (soft budget exceeded), FAIL (hard budget exceeded)
4. FAIL blocks merge. WARN produces a PR comment requiring maintainer acknowledgment.

**`l10n/budget.json` structure (excerpt):**

```json
{
  "toast.a11y.title": {
    "soft": { "en-US": 46, "de-DE": 46, "fr-FR": 43, "es-ES": 41, "pt-BR": 41,
              "ja-JP": 24, "ko-KR": 35, "zh-Hans": 21, "ar-SA": 43, "ru-RU": 45 },
    "hard": { "_default": 52 }
  },
  "toast.a11y.body": {
    "soft": { "en-US": 40, "de-DE": 40, "fr-FR": 37, "es-ES": 36, "pt-BR": 36,
              "ja-JP": 21, "ko-KR": 30, "zh-Hans": 18, "ar-SA": 37, "ru-RU": 38 },
    "hard": { "_default": 46 }
  },
  "modal.a11y.item.coloradj": {
    "soft": { "en-US": 30, "de-DE": 30, "fr-FR": 28, "es-ES": 27, "pt-BR": 26,
              "ja-JP": 16, "ko-KR": 23, "zh-Hans": 14, "ar-SA": 28, "ru-RU": 29 },
    "hard": {
      "_default": 38,
      "settings-panel": 27
    }
  }
}
```

Note the `settings-panel` surface key in `modal.a11y.item.coloradj.hard` — the system supports per-surface budget overrides where the same string key renders in multiple surfaces with different constraints.

### Translator Briefing Document

The budget table is delivered to translators as a human-readable PDF alongside the string file. Each string entry shows:
- Source English text + character count
- Soft budget for their locale
- Hard budget (same for all locales)
- Notes on vocabulary consensus (e.g. "Use iOS term, not Android term")
- Flag if soft budget is likely tight given typical expansion coefficients

Translators are explicitly told: soft budget is a target, hard budget is a red line. Exceeding hard budget requires escalation to the locale reviewer. Do not abbreviate precision-critical accessibility terms without reviewer approval.

---

## Interaction Effects with Other Aspects

**4.69e-i-a-i-f-i-α-i-A-i-1-b (RTL layout):** Budget enforcement is character-count based, but RTL locales (ar-SA) also need pixel-width validation. The budget system and the RTL layout system are complementary but separate. A string can be within character budget and still overflow its layout container in RTL — this must be caught by visual QA, not CI lint.

**4.69e-i-a-i-f-i-α-i-A-i-1-c (Screen reader announcements):** ARIA `aria-label` or `aria-live` content is NOT subject to the same visual budget. A screen reader can announce a 100-character string without layout consequences. However, the ARIA copy should be semantically consistent with the visual copy. Budget decisions should not force divergence between visual and ARIA strings.

**4.69e-i-a-i-f-i-α-i-A-i-1-d (Ecosystem vocabulary split in settings panel):** The settings panel has the tightest column width (27-char hard budget for item labels). The vocabulary split decision (which ecosystem term to use) must be made before budget compliance can be verified — if two competing terms have different character counts, the shorter one might appear to win on budget grounds alone, which is wrong. Budget enforcement comes AFTER vocabulary consensus, never before.

**4.69e-i-a-i-f-i-α-i-A-v (Notification verbosity label in notificationPrefs):** The same surface structure (modal items) will apply to notification verbosity settings. The budget table for `modal.notification.*` strings should use the same methodology and the same hard budgets as Surface B above. The `l10n/budget.json` file is the single source of truth for all surfaces.

---

## Sensory Description

**The CI lint failure.** A PR lands with a new de-DE string: "Barrierefreiheitseinstellungen komplett wiederhergestellt." The budget check runs. The terminal flashes red: `FAIL: toast.a11y.title [de-DE] — 57 chars, hard budget 52`. The PR is blocked. In Slack (or wherever the team communicates), the bot posts a concise failure notice. The translator gets a link to the budget doc. They confer with the de-DE locale reviewer. They land on "Barrierefreiheit wiederhergestellt" (34 chars). The PR goes green. No human engineer intervened.

**The translator briefing PDF.** Printed portrait, 2 pages. Page 1: the vocabulary glossary (which terms to use, which to avoid). Page 2: the budget table for their locale. Each row is color-coded: green for comfortable (under soft budget × 0.9), yellow for approaching (between soft and hard), red for over (exceeds hard). It looks like a traffic light grid. Translators navigate it in under 30 seconds.

**The two-line toast.** In German, the toast title wraps. It reads:
```
[☑]  Barrierefreiheitseinstellungen
     wiederhergestellt
     Von Ihrem importierten Profil.
                     [Einstellungen →]
```
The extra height is 16px. On a 1080p monitor, it is imperceptible. On a 375px-wide phone browser, the toast takes up a larger fraction of the screen — which is fine, because this is an important notification. The two-line title actually makes the German toast feel more substantial, more like a system message — which for accessibility settings, feels appropriate.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i — Budget table maintenance as a living artifact:** as new strings are added to the accessibility toast family, how are they added to `l10n/budget.json`? Who owns the budget calculation? Is the derivation (character count from pixel width) automated or manual? What process ensures the budget file stays in sync with actual rendered layout widths when the game's font or layout changes?

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-ii — Pixel-width validation as complementary CI step:** for CJK and Arabic locales, character-count budgets are insufficient — a 20-character Japanese string can render at very different widths depending on which kanji appear. A Playwright-based CI step that renders each localized string in a headless browser and measures pixel width would catch overflow that character-count lint misses. Design of that Playwright CI step.

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-iii — Budget vs. translation memory conflicts:** a translation memory (TM) system stores approved translations for reuse across the game. If an approved TM entry exceeds the budget for a new surface, the TM conflicts with the budget. Design of the conflict resolution workflow: does the TM entry get a surface-scoped override, or is the source string redesigned to produce a shorter TM entry everywhere?

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-iv — Mobile viewport budget adjustment:** the budget table above was derived for 320px toast width (desktop/tablet breakpoint). At mobile 320px viewport (iPhone SE), the toast may occupy different proportions. Should a second budget table exist for mobile, or should all budgets be derived at the minimum supported viewport width (mobile-first)?

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-v — Multi-script mixed strings and budget measurement:** if a string contains both Latin and CJK characters (e.g., a Japanese setting where the brand name "Robot Uprising" is left untranslated in Latin script), the character-count budget metric breaks down because Latin and CJK characters render at different widths. How is the budget measured for mixed-script strings?
