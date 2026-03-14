# Toast Copy Localization Standards for Accessibility Notifications

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-i-1 — Toast copy localization standards for accessibility notifications: "reduced motion" and "color adjustment" are plain-English terms; localization standards for accessibility copy differ by language (formal register in some languages, legal register in others); what is the localization decision process for accessibility toast text?

**Parent:** 4.69e-i-a-i-f-i-α-i-A-i — Accessibility settings elevation protocol (designed the English-language toast as Option C: "Accessibility settings restored / From your imported profile. / View Settings →"; identified localization as a sub-aspect but did not design the localization process)

**Grandparent chain:** 4.69e-i-a-i-f-i-α-i-A → 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e-i-a → 4.69e-i → 4.69e

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A-i — Accessibility settings elevation protocol (parent, English-language design)
- 4.69e-i-a-i-f-i-α-i-A — Display preferences as general export category (established accessibility/display boundary)
- 4.69e-i-a-i-f-i-α-i-A-i-2 — First-launch OS preferences integration (shares the "what OS vocabulary do we use?" question)
- 4.69e-i-a — Don't-show-again placement decision (toast design patterns, same toast family)
- 4.69e-i-a-vi — Session boundary detection (toast lifecycle)

---

## The Problem Space

The parent analysis produced a fully-specified English toast:

```
┌─────────────────────────────────────────────────┐
│  [☑]  Accessibility settings restored           │
│                                                   │
│  From your imported profile.                     │
│                                                   │
│                          View Settings →         │
└─────────────────────────────────────────────────┘
```

And an import modal accessibility section:
```
Accessibility settings
  Reduce flashing effects · No animation · Large text (140%)
```

These look like simple strings. They are not. Each string carries:

1. **A vocabulary ecosystem problem** — "reduced motion" is an Apple term; "reduce animations" is a Windows term; "accessibility" itself has two competing Korean translations depending on device ecosystem. Which vocabulary does Robot Uprising follow?
2. **A register problem** — accessibility copy in German, French, and Japanese must match the formal register required by national accessibility frameworks (Germany's BGG, France's RGAA); casual game-UI copy may feel disrespectful to the user's access need in those locales
3. **A text expansion problem** — English "Accessibility settings restored" (31 chars) becomes German "Barrierefreiheitseinstellungen wiederhergestellt" (47 chars); the fixed-width toast layout from the parent design may not hold
4. **A content authority problem** — who decides what the German term for "deuteranopia" is in this game's UI? The localization team? A contractor? A community reviewer who happens to be deuteranopic and speaks German?
5. **An ecosystem split problem** — the same user playing on iOS, Android, and desktop will have seen three different official terms for accessibility settings in their language; the game needs a single canonical term that causes the least dissonance across all three

---

## The Vocabulary Ecosystem Problem in Detail

### English: No Problem (But Sets the Wrong Expectation)

English terms in the parent design:
- "Reduced motion" — matches macOS "Reduce Motion", iOS "Reduce Motion", Windows "Reduce animations" (near-miss), WCAG "animation" category
- "Reduce flashing effects" — game-specific (WCAG has "three flashes or below threshold", but that's not a UI label)
- "Color adjustment: Deuteranopia (red-green)" — game-specific display of `colorblindMode: deuteranopia`
- "Large text (140%)" — game-specific
- "Spacious layout" — game-specific

The English terms are a mix of adapted-OS-vocabulary and game-specific labels. The localization challenge: this inconsistency will compound in each locale.

### German: Register and Text Expansion

**OS vocabulary:**
- macOS German: "Bewegung reduzieren" (reduce motion), "Barrierefreiheit" (accessibility)
- Windows German: "Barrierefreiheit" for the category; "Animationen reduzieren" for the specific setting

**Official accessibility law vocabulary (BGG/BITV 2.0):**
- The German Federal Disability Equality Act (BGG) mandates "barrierefreie Informationstechnik" and uses "Barrierefreiheit" as the umbrella term
- "Barrierefreiheitseinstellungen" (accessibility settings) is grammatically correct but 32 characters — the full phrase

**Text expansion analysis:**

| English (chars) | German candidate (chars) | Expansion |
|-----------------|--------------------------|-----------|
| "Accessibility settings restored" (31) | "Barrierefreiheitseinstellungen wiederhergestellt" (47) | +52% |
| "From your imported profile." (28) | "Aus Ihrem importierten Profil." (31) | +11% |
| "View Settings →" (16) | "Einstellungen anzeigen →" (24) | +50% |

The title line expands by 52%, almost certainly causing a two-line wrap in the fixed-width toast layout. German localization of UI copy almost always requires an expansion budget.

**Register question:** "Aus Ihrem importierten Profil" uses the formal "Ihrem" (polite "your"). Should Robot Uprising use formal (Sie) or informal (du) register in German? Games typically use "du" to feel approachable, but accessibility notifications may warrant "Sie" to signal seriousness. Recommendation: match the game's overall German register choice consistently — do not switch to formal just for accessibility toasts. A game using "du" throughout should use "du" here.

### French: RGAA Vocabulary

France has the RGAA (Référentiel Général d'Amélioration de l'Accessibilité) as its official accessibility framework, maintained by the government. The RGAA uses specific vocabulary.

**OS vocabulary:**
- macOS French: "Accessibilité", "Réduire les animations", "Filtre de couleur"
- iOS French: "Accessibilité", "Réduire les animations", "Daltonisme" (colorblindness)

**RGAA vocabulary:**
- "Accessibilité" — consistent with OS
- "Daltonisme" (generic) vs. "Deutéranopie" (specific medical term for red-green colorblindness)
- "Haute contraste" — not a standard French OS term; macOS French uses "Augmenter le contraste"

**Key tension:** French macOS uses "Daltonisme" as the category name but the specific filter types are labeled "Protanopie", "Deutéranopie", "Tritanopie" in French OS settings. The import modal showing "Filtre couleur: Deutéranopie (rouge-vert)" matches the macOS French model. Text expansion from English is moderate (French typically runs +15–25%).

### Japanese: Katakana vs. Native Terms

Japanese accessibility vocabulary is dominated by katakana imports from English:
- "アクセシビリティ" (Accessibility — from English, katakana)
- "視差効果を減らす" (Reduce motion — native Japanese phrase, literally "reduce parallax effect"; this is the iOS Japanese term)
- "カラーフィルタ" (Color filter — katakana)
- "色覚" (color vision — native Japanese) vs. "色盲" (colorblindness — native, but considered slightly clinical/blunt) vs. "色覚多様性" (color vision diversity — modern preferred term by advocates)

The "色覚多様性" / "色盲" distinction in Japanese is a live social question, analogous to person-first vs. identity-first language debates in English. A game localized with "色盲" may read as dated or disrespectful to some players; "色覚多様性対応" (color vision diversity support) may read as overly clinical or hedging. Current Japanese accessibility advocates and organizations (notably the NPO Color Universal Design Organization, CUDO) use "色覚多様性" in advocacy contexts but "色覚異常" in medical contexts.

**Recommendation for Japanese:** Use "カラーフィルタ" as the import modal label (matching macOS Japanese and minimizing cognitive dissonance) and "色覚サポート" (color vision support) as an alternative in Settings — brief, non-clinical, reflects the game's tone.

**Text length:** Japanese is often more compact than English in character count but renders at wider per-character pixel widths; the net effect on toast layout depends on font metrics. Japanese typically requires testing at larger font sizes due to its character density.

### Korean: Ecosystem Split

Korean has a well-documented accessibility vocabulary split between iOS and Android/Windows:
- **iOS/macOS Korean:** "손쉬운 사용" (literally "easy to use" — Apple's coined term, widely recognized but not universal)
- **Android/Windows Korean:** "접근성" (literally "accessibility/reachability" — the standard term for the concept)

A Korean player using Chrome on Windows will have heard "접근성" throughout their OS accessibility settings. The same player using Safari on iPhone will have heard "손쉬운 사용." Robot Uprising is a web game playable on both platforms in the same session.

**Decision required:** Which Korean term does Robot Uprising use?
- Option A: "접근성" — used by Android, Windows, web standards (WCAG Korean translation), and most Korean government accessibility frameworks; broader ecosystem coverage
- Option B: "손쉬운 사용" — iOS term; feels warmer (literally "easy to use") but may confuse non-iOS users
- Option C: Use both: "접근성 (손쉬운 사용)" on first reference in the import modal; "접근성" in the toast

**Recommendation:** "접근성" — it is the government-standard term, used in the Korean WCAG translation, and covered in Korean accessibility law (장애인 차별금지법 / Act on the Prohibition of Discrimination against Persons with Disabilities). The iOS branding should not determine game vocabulary.

---

## The Three Localization Strategy Options

### Option 1 — OS Vocabulary Matching Per Locale

**What it is:** For each target locale, use the same accessibility setting names that the dominant OS for that locale uses. Identify the dominant OS by market share data (e.g., iOS-dominant in Japan, Windows-dominant in Germany) and follow its vocabulary.

**Implementation:**
- Research phase: for each of 10 target locales, identify dominant OS + the accessibility setting names in that OS
- Localization phase: create a mapping table: `setting_key → display_name[locale][os]`
- When localizing the toast and modal: use the dominant-OS name

**Strengths:**
- Players already know these terms from their device
- Cognitive overhead of learning new terms is eliminated
- Particularly powerful for settings that directly correspond to OS-level settings (reduced motion, colorblind filters)

**Weaknesses:**
- Does not account for players on non-dominant OS (the German Linux user who doesn't use Windows vocabulary)
- Market share shifts over time; the vocabulary mapping needs maintenance
- Some settings are game-specific (reducedFlash, spacious density) with no OS analog — those require custom localization anyway
- Creates a two-tier system: some settings use OS vocabulary, others use custom vocabulary

**Suitability for Robot Uprising:** Partial. Good for settings that have clear OS analogs (animationIntensity → "Reduce Motion" / "Reduce animations"). Not sufficient for game-specific settings. This option should be combined with another.

---

### Option 2 — WCAG/Official Framework Vocabulary

**What it is:** Use the official W3C WCAG translations for each locale as the vocabulary source. WCAG 2.1 and 2.2 have been officially translated into several languages including French, German, Chinese (Simplified), Japanese, Korean, Portuguese (Brazilian), and others.

**Implementation:**
- Download WCAG official translations; extract relevant terms
- Map WCAG terms to game setting display names
- For settings without WCAG equivalents, derive from WCAG vocabulary style

**Strengths:**
- Authoritative and legally credible (helpful in EU markets where accessibility laws reference WCAG)
- Consistent with what accessibility professionals know
- Translations are already done by W3C

**Weaknesses:**
- WCAG vocabulary is aimed at developers and accessibility auditors, not end users. Terms like "non-text contrast", "reflow", "pointer cancellation" are correct but not appropriate for a game UI
- WCAG translations are sometimes years behind the current WCAG version
- The "how it reads" problem: WCAG German is correct but bureaucratic in register. Playing a game should not feel like filling out a government form.
- Coverage gap: WCAG does not have terms for game-specific concepts (reducedFlash, spacious layout)

**Suitability for Robot Uprising:** Low as primary vocabulary source. WCAG terms are too technical for a game audience. Valuable as a consistency-check against the localized copy, not as the source of truth.

---

### Option 3 — Custom Localization with Accessibility Reviewer Approval Gate (Recommended)

**What it is:** The game's localization team (translators for each locale) produces a first-pass translation. Before shipping, each accessibility-related string in each locale goes through an approval gate: a native-speaker accessibility reviewer who themselves uses at least one accessibility feature confirms the copy is appropriate.

**Implementation:**
1. **English terms are documented** in a localization glossary with: the setting key, the English display name, the intended meaning, the register note ("casual game UI, friendly but precise"), and a link to the OS term in the two dominant OSes for that locale
2. **Localization team produces first-pass translations** using the glossary as context
3. **Accessibility reviewer gate**: a native-speaker reviewer for each locale (community volunteer, professional contractor, or staff) confirms:
   - Register is appropriate (not too clinical, not too casual, not offensive)
   - Terms match the vocabulary the player would already know from their OS/OS accessibility settings
   - Text does not expand in a way that breaks the toast layout
4. **Setting-specific approval**: the reviewer approves or requests revision for each individual accessibility setting name (not just the toast as a unit)
5. **Lock**: approved terms are locked; new accessibility settings require re-review before shipping

**Key artifacts produced:**
- A locale-specific accessibility term glossary (living document, updated with each new setting)
- A review record per term per locale (who approved, when, reviewer credentials)
- A changelog for when terms change between versions

**Strengths:**
- Catches register problems that a professional translator without accessibility experience might miss
- Creates accountability (who approved the German deuteranopia term and when)
- Builds a lexicon for future settings
- The review gate forces documentation of every accessibility string — useful for audit

**Weaknesses:**
- Requires finding qualified accessibility reviewers for each locale (not trivial for rare locales)
- Slower than direct translation; adds a review cycle to accessibility copy pipeline
- Risk: if the reviewer is not representative (e.g., a colorblind German player reviewing motion reduction copy, or vice versa), the review may miss register issues for conditions they don't personally use
- Reviewer fatigue for high-string-count locales

**Suitability for Robot Uprising:** High. This is the minimum viable localization process for a game making an explicit claim to accessibility. The accessibility terms glossary also serves as documentation for when the game is eventually ported to native platforms.

---

### Option 4 — Community-Sourced Accessibility Term Registry

**What it is:** Rather than relying on a small set of reviewers, open the accessibility term registry to community contribution. Players who use accessibility features can propose and vote on the correct localized terms for their language. The localization team accepts community consensus proposals after a minimum review period.

**Implementation:**
- Create a public accessibility term registry (could be a GitHub repo or community wiki)
- For each locale, list all accessibility setting display names with "proposed" or "accepted" status
- Players can open PRs/issues proposing alternative terms with rationale
- The localization team reviews and accepts/rejects community proposals

**Strengths:**
- The people with the most informed opinions on "what does deuteranopia sound like in German UI copy to a German person with deuteranopia" are exactly the players who would contribute to this registry
- Builds community ownership of accessibility
- Self-correcting: if a term gets outdated (like "色盲" in Japanese), community members will notice and propose an update

**Weaknesses:**
- The community for a niche strategy game will have very few contributors for any given accessibility feature in any given locale, especially at launch
- Risk of enthusiastic but unrepresentative contributors (a player who is not themselves deuteranopic but thinks they know the "correct" German term)
- Slower than top-down localization
- Requires maintenance infrastructure (the registry, contribution guidelines, review process)

**Suitability for Robot Uprising:** Good as a supplement to Option 3, not as a replacement. Use Option 3 (professional accessibility reviewer gate) for the initial release; open the community term registry as a post-launch feedback mechanism.

---

## Resolving the Text Expansion Problem

The toast layout from the parent analysis is a fixed-width card at the bottom-right of the viewport. When the title "Accessibility settings restored" expands to 47 characters in German, two problems emerge:

**Problem A — Title wraps.** The 32px-tall single-line toast becomes a 48px-tall two-line toast. This is fine for readability but changes the layout geometry of the toast tray. Every other toast assumes a fixed height.

**Problem B — "View Settings →" link pushes to a third line.** If the title is two lines and the body is one line, the action link may be pushed to a fourth row, making the overall toast 64–80px tall in German.

**Three layout strategies:**

**Layout Strategy L1 — Flexible height toast**
The toast expands vertically to fit its content. Height is content-driven, not fixed. The toast tray accommodates variable-height toasts by stacking them with natural spacing.

- Pro: Clean; text never truncates; German users see the full string
- Con: Toast height becomes unpredictable; a locale with especially long strings (German, Finnish, Polish) may produce very tall toasts; the "this is a brief notification" affordance is lost if the toast becomes half the screen in some languages

**Layout Strategy L2 — Abbreviated variants for long locales**
The localization glossary includes both a "full" term and an "abbreviated" term for each string. The full term is used in Settings; the abbreviated term is used in the toast. Example:
- German full: "Barrierefreiheitseinstellungen"
- German abbreviated: "Barrierefreiheit" (can refer to the settings by the category name)

The toast would then say: "Barrierefreiheit wiederhergestellt" (33 chars — almost matching English).

- Pro: Maintains the fixed-height toast geometry across locales; abbreviations can be correct and natural in each language
- Con: Requires two strings per term per locale; "abbreviated" term must be reviewed for correctness (can't just truncate)
- Implementation: the localization glossary has `display_name_full` and `display_name_short` fields; UI code uses `display_name_short` in toast, `display_name_full` in Settings and import modal

**Layout Strategy L3 — Toast title is a fixed-string, not localizing the setting names**
The toast title is always a generic string ("Accessibility settings restored" in each locale) without enumerating specific setting names. Only the import modal shows the specific names. The toast is always brief because it doesn't enumerate.

This is already the recommended design from the parent (Option C, not Option B). The toast title doesn't include "Reduced motion · Color adjustment" — those appear only in the import modal, which has more layout flexibility.

- Pro: Toast remains simple and short in all locales; text expansion is manageable because the toast copy is generic
- Con: Toast is less informative; but this is already the trade-off the parent design accepted

**Recommendation: L3 as the primary layout strategy, L2 as a supplementary approach.**

Since the recommended toast copy from the parent is already generic ("Accessibility settings restored" / "From your imported profile."), the toast title does not enumerate setting names and therefore has manageable text expansion. The critical content is in the import modal, where layout is more flexible.

For the import modal items ("Reduce flashing effects · No animation · Large text (140%)"), use `display_name_short` variants in the localization glossary, capped at 30 characters per item — the interpunct-separated list would overflow if items are too long.

---

## Complete Localization Glossary: First 5 Locales

The following is the initial accessibility term glossary for the five highest-priority locales, covering the six confirmed accessibility settings from the parent analysis.

### Legend

- **In-toast title:** Used in "Accessibility settings restored" headline
- **In-modal list:** Used in import modal accessibility section
- **In-settings label:** Full label in Settings → Accessibility panel
- **OS reference:** The equivalent term in the locale's dominant OS

---

### German (de-DE)

| Setting Key | In-Modal List | In-Settings Label | OS Reference |
|-------------|---------------|-------------------|--------------|
| Toast title | "Barrierefreiheit wiederhergestellt" | — | "Barrierefreiheit" (macOS/Win) |
| Toast body | "Aus deinem importierten Profil." | — | — |
| Toast action | "Einstellungen →" | — | — |
| `animationIntensity: reduced/none` | "Bewegung reduziert" / "Keine Bewegung" | "Animationsintensität" | "Bewegung reduzieren" (macOS) |
| `reducedFlash: true` | "Blitze reduziert" | "Blitzeffekte reduzieren" | No direct OS analog |
| `colorblindMode: *` | "Farbfilter: [Typ]" | "Farbsehschwäche-Modus" | "Farbenblindheit" (Win) / "Farbfilter" (macOS) |
| `highContrast: true` | "Hoher Kontrast" | "Hoher Kontrast" | "Kontrast erhöhen" (macOS) |
| `fontScale: >1.2 (accessibility)` | "Große Schrift ([%]%)" | "Schriftgröße" | "Textgröße" (macOS/iOS) |
| `uiDensity: spacious` | "Großzügiges Layout" | "UI-Dichte" | No direct OS analog |

**Register note:** "du" form throughout (matches a game using informal register). "Barrierefreiheit wiederhergestellt" is correct, natural, and matches the BGG/BITV vocabulary without being bureaucratic.

**Text expansion:** "Barrierefreiheit wiederhergestellt" (34 chars) vs. English "Accessibility settings restored" (31 chars) — +10% expansion. Fits in single line. Acceptable.

---

### French (fr-FR)

| Setting Key | In-Modal List | In-Settings Label | OS Reference |
|-------------|---------------|-------------------|--------------|
| Toast title | "Accessibilité restaurée" | — | "Accessibilité" (macOS/iOS/Win) |
| Toast body | "Depuis votre profil importé." | — | — |
| Toast action | "Voir les paramètres →" | — | — |
| `animationIntensity: reduced/none` | "Animations réduites" / "Sans animation" | "Intensité des animations" | "Réduire les animations" (macOS) |
| `reducedFlash: true` | "Effets clignotants réduits" | "Réduire les effets clignotants" | No direct OS analog |
| `colorblindMode: *` | "Filtre couleur : [type]" | "Mode daltonisme" | "Daltonisme" (iOS FR) |
| `highContrast: true` | "Contraste élevé" | "Contraste élevé" | "Augmenter le contraste" (macOS) |
| `fontScale: >1.2 (accessibility)` | "Texte agrandi ([%]%)" | "Taille du texte" | "Taille du texte" (iOS FR) |
| `uiDensity: spacious` | "Interface aérée" | "Densité de l'interface" | No direct OS analog |

**Register note:** "vous" form for the toast body (French game localization convention varies; "vous" is safest for notification copy as it avoids assuming player age/relationship). Settings panel can use "vous" form consistently.

**Vocabulary note:** "Mode daltonisme" follows iOS French vocabulary. "Deutéranopie (rouge-vert)" is the correct French term for the specific filter type — identical to the medical term, which is correct here.

---

### Japanese (ja-JP)

| Setting Key | In-Modal List | In-Settings Label | OS Reference |
|-------------|---------------|-------------------|--------------|
| Toast title | "アクセシビリティ設定を復元しました" | — | "アクセシビリティ" (macOS/iOS) |
| Toast body | "インポートしたプロフィールから" | — | — |
| Toast action | "設定を表示 →" | — | — |
| `animationIntensity: reduced/none` | "動きを軽減" / "アニメーションなし" | "アニメーション強度" | "視差効果を減らす" (iOS) / "アニメーションを減らす" (macOS) |
| `reducedFlash: true` | "点滅を軽減" | "点滅エフェクトを減らす" | No direct OS analog |
| `colorblindMode: *` | "カラーフィルタ：[種類]" | "色覚サポート" | "カラーフィルタ" (iOS/macOS) |
| `highContrast: true` | "ハイコントラスト" | "ハイコントラスト" | "コントラストを上げる" (macOS) |
| `fontScale: >1.2 (accessibility)` | "大きな文字（[%]%）" | "文字サイズ" | "テキストサイズ" (iOS) |
| `uiDensity: spacious` | "ゆったりレイアウト" | "UI密度" | No direct OS analog |

**Vocabulary note on color vision:** Using "カラーフィルタ" (color filter) in the modal and "色覚サポート" (color vision support) in Settings. Avoiding "色盲" (colorblindness — slightly clinical/blunt in modern Japanese usage). "色覚多様性" (color vision diversity) is advocacy vocabulary — appropriate for the game's About/accessibility statement, not for a brief modal list item.

---

### Korean (ko-KR)

| Setting Key | In-Modal List | In-Settings Label | OS Reference |
|-------------|---------------|-------------------|--------------|
| Toast title | "접근성 설정이 복원되었습니다" | — | "접근성" (Android/Win) / "손쉬운 사용" (iOS) |
| Toast body | "가져온 프로필에서 복원했습니다." | — | — |
| Toast action | "설정 보기 →" | — | — |
| `animationIntensity: reduced/none` | "동작 줄이기" / "애니메이션 없음" | "애니메이션 강도" | "동작 줄이기" (iOS KO) |
| `reducedFlash: true` | "번쩍임 줄이기" | "번쩍이는 효과 줄이기" | No direct OS analog |
| `colorblindMode: *` | "색상 필터: [유형]" | "색각 지원" | "색상 필터" (iOS KO) |
| `highContrast: true` | "고대비" | "고대비" | "대비 증가" (macOS KO) |
| `fontScale: >1.2 (accessibility)` | "큰 텍스트 ([%]%)" | "텍스트 크기" | "텍스트 크기" (iOS KO) |
| `uiDensity: spacious` | "여유 있는 레이아웃" | "UI 밀도" | No direct OS analog |

**Vocabulary note:** "접근성" chosen over "손쉬운 사용" as the umbrella term (see Korean ecosystem split discussion above). "색각 지원" (color vision support) used in Settings — modern, non-clinical, mirrors the Japanese "色覚サポート" approach.

---

### Chinese Simplified (zh-Hans)

| Setting Key | In-Modal List | In-Settings Label | OS Reference |
|-------------|---------------|-------------------|--------------|
| Toast title | "无障碍设置已恢复" | — | "辅助功能" (iOS/macOS) / "无障碍" (Android) |
| Toast body | "已从导入的档案恢复。" | — | — |
| Toast action | "查看设置 →" | — | — |
| `animationIntensity: reduced/none` | "减少动效" / "无动画" | "动画强度" | "减少动态效果" (iOS) |
| `reducedFlash: true` | "减少闪烁" | "减少闪烁效果" | No direct OS analog |
| `colorblindMode: *` | "色彩滤镜：[类型]" | "色觉辅助" | "色彩滤镜" (iOS) |
| `highContrast: true` | "高对比度" | "高对比度" | "增强对比度" (macOS) |
| `fontScale: >1.2 (accessibility)` | "大字体（[%]%）" | "字体大小" | "文字大小" (iOS) |
| `uiDensity: spacious` | "宽松布局" | "界面密度" | No direct OS analog |

**Vocabulary note:** Toast title uses "无障碍设置已恢复" — "无障碍" (wú zhàng'ài, "no-barrier") is the standard mainland Chinese accessibility term used in government policy and Android. "辅助功能" is the Apple ecosystem term. Using "无障碍" is more broadly applicable for a web game.

---

## Sensory Description: The Toast in German

A German player, Lena, 29, with vestibular disorder (motion sickness triggered by parallax effects and sliding animations) has configured Robot Uprising with "Keine Bewegung" (no animation) since her first session. She's playing on a new work desktop and importing her profile.

The import confirmation modal appears. The accessibility section reads:

*"Barrierefreiheit — Keine Bewegung · Große Schrift (130%)"*

Two items. Both in a lighter-weight font than the notification suppresses above. The dots between them are interpuncts, not bullets — a touch of typographic care.

She clicks "Importieren."

The game reloads.

Nothing moves. The title screen simply exists — not assembled, not revealed, just present. The hex-circuit pattern is lit and still.

In the bottom-right, a rectangular card appears without motion — it materializes:

```
┌─────────────────────────────────────────────────┐
│  [☑]  Barrierefreiheit wiederhergestellt        │
│                                                   │
│  Aus deinem importierten Profil.                 │
│                                                   │
│                          Einstellungen →         │
└─────────────────────────────────────────────────┘
```

The copy is correct German. Barrierefreiheit — she knows that word from her OS, from the BITV website, from the accessibility options in her screen reader. It is not a clumsy translation. It is the word she uses.

After 10 seconds the toast disappears — a single-frame cut, no fade — because she has no-animation mode active. One moment it is there. The next moment it is gone.

She doesn't click "Einstellungen →". She can see the text is larger. She can see nothing is moving. It worked.

---

## Player Journeys

#### Journey: Lena, 29, Game Designer, Vestibular Disorder (German)

**Context:** Lena has motion sickness triggered by parallax and sliding animations. She's been playing Robot Uprising for 3 months on her personal laptop (configured with "Keine Bewegung"). She's showing the game to a colleague, Markus, on her work desktop. She'll import her profile temporarily to show him how the game should look for her accessibility needs.

**Minute 0:00 — Opening**
The work desktop opens Robot Uprising. The default German locale is detected. The launch animation plays — hex nodes assembling from the edges of the screen in a radiating cascade. Lena looks away immediately. "There's the problem," she tells Markus. "This is why I need to import first."

She navigates to the import dialog. She's done this before; the keyboard shortcut is Strg+Shift+I.

**Minute 0:30 — Import Modal**
The modal appears. German throughout. The accessibility section reads:

```
Barrierefreiheit
  Keine Bewegung · Große Schrift (130%)
```

Markus reads over her shoulder: "Keine Bewegung — that's no animation?" "Exactly," Lena says. "Die Startanimation wäre sonst nicht okay für mich." (The startup animation wouldn't be okay for me otherwise.)

She clicks "Importieren."

**Minute 0:45 — The Transition**
Game refreshes. Static title screen. The toast appears, stationary, in the corner:

"Barrierefreiheit wiederhergestellt / Aus deinem importierten Profil. / Einstellungen →"

Lena: "Gut." One word. She navigates to the campaign map. Nothing slides. Nothing pulses. The mission selection is clean.

Markus, now interested: "And when you remove the import — it goes back to the normal animation?" "Yes. But this is how it should work by default for me on every device."

**Minute 1:00 — The Aside**
After the session, Lena submits a feedback note through the game's community hub: "The localization is correct — 'Barrierefreiheit' is the right word, not 'Zugänglichkeit' (which would be a literal translation but isn't the standard term). Whoever approved this knew German accessibility vocabulary."

**What the game successfully did:** Applied accessibility settings from the import BEFORE the title screen was visible. The toast copy ("Barrierefreiheit wiederhergestellt") used the correct German term that Lena recognizes from her OS and accessibility contexts — not a clumsy literal translation. The word "Barrierefreiheit" itself carries credibility.

**UI Annotations:**
- Import modal accessibility section: "Barrierefreiheit" as section header, interpunct-separated item list
- "Keine Bewegung" (not "Bewegung reduziert") because Lena's animationIntensity is set to 'none', not 'reduced'
- Toast appears without animation (animationIntensity: none already applied); 10s auto-dismiss; single-frame disappear at dismissal
- "Einstellungen →" in toast links to Einstellungen → Barrierefreiheit panel

---

#### Journey: Ji-woo, 22, University Student, Red-Green Colorblindness (Korean, Mobile Web on Android)

**Context:** Ji-woo plays Robot Uprising on her Android phone via Chrome. She's on the go and discovered the game via a community post. She set up a deuteranopia filter two sessions ago on her phone. Today she's opening the game on a university library computer (desktop Chrome on Windows) to play during a free period. She'll import her profile to get the color filter on the desktop.

**Minute 0:00 — Desktop, No Accessibility Settings**
The game opens in Korean. Default color palette. The signal health indicators are red-and-green. Ji-woo immediately identifies the problem — she's been playing with the filter active and everything is now less readable. She opens the import dialog.

**Minute 0:20 — Import Modal**
She's on a Windows machine. The system-level accessibility term is "접근성" (Windows Korean vocabulary). The game also uses "접근성." The modal reads:

```
접근성
  색상 필터: 제2색맹(적록)
```

Ji-woo reads: "색상 필터: 제2색맹(적록)" — color filter: deuteranopia (red-green). The term "제2색맹" is the medical Korean term for deuteranopia. She recognizes it; she's seen it in optometry contexts.

**Note on vocabulary choice:** The design decision here is "제2색맹" vs. "녹적색맹" (an alternative medical term) vs. "색각 이상" (color vision anomaly — softer) vs. just "적록 필터" (red-green filter — descriptive). "제2색맹" is used in Korean medical literature but feels clinical on a game screen. This is exactly the kind of edge case the accessibility reviewer gate is designed to catch.

**A native Korean player who has deuteranopia reviewing this copy would likely flag:** "제2색맹" is medically correct but somewhat clinical in a game UI context. The import modal just needs to convey what the filter does, not diagnose the player. Suggested alternative: "색상 필터: 적록 보정" (color filter: red-green correction).

Ji-woo imports. The color palette shifts. The signal health indicators are now amber-teal. She glances at the toast:

"접근성 설정이 복원되었습니다 / 가져온 프로필에서 복원했습니다. / 설정 보기 →"

She nods and closes the toast. The game is readable. She plays for 45 minutes.

**Post-session reflection:** Ji-woo logs in to the game's community forum after her session and notices a thread: "색각 관련 게임 내 용어 피드백 부탁드립니다" (Requesting feedback on color vision terminology in the game). She posts: "제2색맹보다 적록 보정이라고 표현하면 더 편할 것 같아요." (I think 'red-green correction' would feel more comfortable than 'deuteranopia'.)

**What this journey illustrates:** The accessibility reviewer gate, if it had included a Korean deuteranopic player, would likely have caught the "제2색맹" clinical register issue before launch. The community term registry (Option 4) catches it after launch. The two-layer system (reviewer gate + community registry) works together.

**UI Annotations:**
- "접근성" used consistently — not "손쉬운 사용"
- Import modal: "색상 필터: 제2색맹(적록)" — will be flagged for revision to "색상 필터: 적록 보정" after community feedback
- Toast appears with standard animation (Ji-woo's animationIntensity is 'full'); the toast fades in from opacity 0 over 300ms — the only motion in the toast lifecycle, since the toast itself doesn't slide
- Color palette change is visible before the toast appears; the toast is redundant confirmation

---

#### Journey: Rafael, 38, Accessibility Consultant, Contract Reviewer (Brazilian Portuguese)

**Context:** Rafael is a Brazilian Portuguese accessibility specialist hired on contract to review Robot Uprising's pt-BR localization before the localization ship deadline. He is not a player — he's doing the review as a professional engagement. He has deuteranopia himself and also uses reduced motion (separate from his professional expertise).

**Minute 0:00 — Receiving the Review Package**
Rafael receives a localization review package containing: a spreadsheet with all accessibility-related strings in pt-BR, the corresponding English source strings, and a reference column showing the macOS/iOS/Windows/Android pt-BR equivalent for each concept.

The string he's reviewing first:

| Key | English | pt-BR (Proposed) | macOS pt-BR | Notes |
|-----|---------|------------------|-------------|-------|
| toast.accessibility.title | Accessibility settings restored | Configurações de acessibilidade restauradas | Acessibilidade | — |
| modal.accessibility.colorblind | Color adjustment: Deuteranopia (red-green) | Ajuste de cor: Deuteranopia (vermelho-verde) | Filtros de cores: Deuteranopia | — |
| modal.accessibility.reducedMotion.none | No animation | Sem animação | Reduzir movimento | — |

**Minute 5:00 — First Flag**
Rafael flags "Configurações de acessibilidade restauradas" as correct but slightly long. In Brazilian Portuguese, "restauradas" agrees with "configurações" (feminine plural) — this is grammatically correct. The full string is 44 characters vs. English's 31. He checks: does it fit on one toast line? He runs a character count against the toast layout spec.

He notes: "Acceptable — 44 characters at the toast's default font size (Roboto 15px) fits in the single-line layout at standard viewport widths. Verify at 320px viewport width for mobile." He approves with this annotation.

**Minute 8:00 — Second Flag**
Rafael flags "Ajuste de cor: Deuteranopia (vermelho-verde)." The medical term "Deuteranopia" is the same in Portuguese (no translation needed — it's a Greek-origin medical term). But "vermelho-verde" (red-green) uses a hyphen — correct in Brazilian Portuguese. He approves.

**Minute 12:00 — Third Flag — REJECTION**
Rafael rejects "Sem animação" for `animationIntensity: none`.

His note: "The macOS pt-BR term is 'Reduzir movimento' (reduce motion). 'Sem animação' (no animation) is technically accurate but misses the player's conceptual model. Players with vestibular disorders set this because they want to reduce motion, not because they think about animation as a category. 'Sem animação' also doesn't distinguish between 'reduced' and 'none' — both could be described as 'sem animação' colloquially. **Suggested revision: 'Movimento desativado' for animationIntensity: none and 'Movimento reduzido' for animationIntensity: reduced** — this is consistent with the 'reduced/none' distinction in the game's settings and echoes the macOS vocabulary direction."

**Minute 15:00 — Revised String**
The localization team accepts the revision. The term is updated to "Movimento desativado" and "Movimento reduzido." The review record notes: "Approved by Rafael [accessibility consultant, deuteranopia], 2026-03-14."

**What this journey illustrates:** The accessibility reviewer gate catches a vocabulary issue (wrong conceptual frame: "animation" vs. "motion") that a standard localization review would likely miss. The reviewer's note also specifies *why* — the vestibular disorder user's mental model — which gives the localization team context for future decisions in similar cases. The review record creates accountability and a paper trail.

**UI Annotations:**
- The localization review package is a spreadsheet tool, not an in-game interface
- The review record links back to the game's localization management system
- The approved pt-BR terms become the canonical source of truth for future updates

---

## Strengths and Weaknesses of Option 3 (Recommended)

### Strengths

**Catches register problems before they ship.** A localization team producing correct-but-clinical copy will not know that "제2색맹" reads differently to a Korean deuteranopic player than to a Korean optometrist. The accessibility reviewer does.

**Creates accountable lexicon.** Each term in the glossary has a reviewer on record. When the game ships a new accessibility setting, the localization team knows to route it through the accessibility reviewer. The pipeline is established.

**Vocabulary stability.** Once "Barrierefreiheit" is established as the game's German umbrella term (not "Zugänglichkeit"), it stays consistent across all future updates. The lexicon acts as a style guide for accessibility copy.

**The review record serves the accessibility statement.** A game making a public accessibility statement ("Robot Uprising is accessible to players with X, Y, Z") is more credible when it can show that accessibility copy was reviewed by actual users with those access needs.

### Weaknesses

**Finding reviewers is non-trivial.** For a niche strategy game, finding a native German speaker who both has photosensitivity AND plays strategy games is not guaranteed. The reviewer pool may be small and potentially unrepresentative. For rare locales (e.g., Finnish, Dutch), finding a qualified reviewer may require professional contract work.

**Reviewer expertise bias.** A colorblind reviewer is well-placed to review color adjustment copy but may not have insight into how "reduced motion" language should read to someone with vestibular disorder. Ideally, each accessibility feature type has a reviewer who personally uses that type of feature. This is aspirational.

**Text expansion is not solved by better vocabulary.** Option 3 solves register problems. It doesn't inherently solve the German text expansion problem. The layout strategy (L2: abbreviated variants) is a separate decision that must be made before the localization review cycle.

---

## Interaction Effects

**With 4.69e-i-a-i-f-i-α-i-A-i-2 (First-launch OS preferences):** The localization of the first-launch onboarding prompt ("We've set some defaults based on your system preferences") shares vocabulary with the accessibility toast. The same localization glossary should cover both. The onboarding prompt may be the first accessibility-related string a new player sees in their language; it must be correct before the import toast ever appears.

**With 4.69e-i-a-i-f-i-α-i-A-i-4 (Accessibility confirmation in audit log):** The audit log entry for an accessibility import event will display the same setting names as the import modal. The localization glossary must cover the audit log display names — they are not always identical to the modal names (the audit log may have more space and use the full `display_name_full` form).

**With 4.69e-i-a-i-f-i-α-i-A-i-5 (Conflict resolution on import):** If the conflict resolution dialog is triggered, it will display both the incoming value and the current value side by side. Both must be localized. This may be the only place in the UI where two localized accessibility setting values appear in close proximity — the reviewer should check that similar values (e.g., "Bewegung reduziert" vs. "Keine Bewegung") are clearly distinct in German.

**With 4.69e-i-a-i-f-i-α-i-A-iii (Workbench display opt-in in config-share):** Config-share exports may optionally include workbench display settings. If they do, the workbench display settings labels (which are non-accessibility) appear in the import modal alongside the accessibility settings. The visual distinction between "Accessibility settings (elevated)" and "Other display settings (silent)" must survive in all locales — not just in English.

---

## Comparable Games/Precedents

**Celeste (2018) — Accessibility Menu Localization:** Celeste's accessibility menu (Assist Mode) was localized for all supported languages and is frequently cited as an accessibility localization success. The team used a careful approach: Assist Mode copy used the same register as the rest of the game's dialogue — warm, non-clinical, acknowledging that using accessibility options is a valid player choice, not a concession. The localization preserved this warmth across languages by giving localization teams context notes about the intended tone.

**The Last of Us Part I/II — Accessibility Settings Depth:** TLOU has one of the most extensive accessibility setting menus in AAA games, localized across 30+ languages. Naughty Dog reportedly worked with accessibility consultants per region for the localization review. This is the highest-budget precedent for Option 3 in practice.

**Minecraft — "Accessibility" vs. "Ease of Access":** Early Minecraft Java Edition used "Ease of Access" as the accessibility settings category name (following older Windows vocabulary). The Settings panel has since been renamed to "Accessibility Settings" in more recent versions, but many players still search for "ease of access" in the help docs. This is a cautionary tale: vocabulary choices persist in the community even after in-game terms change. Getting the term right at launch matters more than fixing it in a patch.

**WCAG 2.1 Authorized Translation Program:** W3C's Authorized Translations program for WCAG provides the closest authoritative reference for technical accessibility vocabulary in 10+ languages. Even though WCAG vocabulary is too technical for direct in-game use, the review process for WCAG translations — which involves native-speaking accessibility experts — is a good model for the Option 3 reviewer gate.

---

## The TikTok Clip for This Feature

The clip is not about localization — the clip is about what correct localization enables.

A German streamer is explaining to chat: "Die Entwickler haben die Barrierefreiheitseinstellungen richtig lokalisiert — kein 'Accessibility' auf Englisch, kein komisches 'Zugänglichkeit', sondern echtes 'Barrierefreiheit' wie im OS." (The developers correctly localized the accessibility settings — not 'Accessibility' in English, no awkward 'Zugänglichkeit', but real 'Barrierefreiheit' like in the OS.)

Chat: "Kleines Detail aber wichtig." (Small detail but important.)

The streamer: "Jemand der diese Einstellungen wirklich braucht, merkt sowas sofort." (Someone who genuinely needs these settings notices this immediately.)

---

## New Sub-Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i-1-a — Text expansion budget per locale:** For each of the 10 target locales, define maximum character counts per toast string and per import modal item, and specify the fallback strategy when a legitimate localized term exceeds the budget (abbreviated variant in glossary, layout flex, or character-limited alternate phrasing)

- **4.69e-i-a-i-f-i-α-i-A-i-1-b — RTL locale considerations for toast layout:** Arabic and Hebrew are right-to-left; the toast layout (icon left, text right, action link far right) must mirror for RTL; the accessibility confirmation toast is the first thing a RTL player sees after import — getting the layout wrong here is both a UX failure and an ironic accessibility failure

- **4.69e-i-a-i-f-i-α-i-A-i-1-c — Screen reader announcement for accessibility toast:** The toast should emit an ARIA live region announcement so that screen reader users (who may have just imported their screen reader accessibility settings) hear the confirmation; design of the `aria-live` region: "polite" vs "assertive", the announcement copy (may differ from the visual copy), interaction with screen reader focus management during import flow

- **4.69e-i-a-i-f-i-α-i-A-i-1-d — Ecosystem vocabulary split handling in settings panel:** The Settings → Accessibility panel may display terms that players know from one ecosystem but not another (e.g., Korean players know both "접근성" from Android/Windows and "손쉬운 사용" from iOS); should the settings panel include a micro-tooltip or inline alias noting "This is the same as 'Easy Access' on iPhone" for the most ecosystem-split terms?

- **4.69e-i-a-i-f-i-α-i-A-i-1-e — Localization update process when accessibility terms change:** When an OS updates its accessibility vocabulary (e.g., iOS 18 renames a setting), the localization glossary must be updated; design of the update process — who monitors OS vocabulary changes, how are updates triggered, how are old terms deprecated without breaking the review record

