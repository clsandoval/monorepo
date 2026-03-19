# ops-knowledgebase-chat v3 — UX + Branding Overhaul

**Date:** 2026-03-19
**Location:** `projects/ops-knowledgebase-chat/`
**Builds on:** v2 (file explorer, session history, @ autocomplete)

## Purpose

Overhaul the visual identity from a dark "Control Room" IDE aesthetic to a warm, light-mode Mama Sita's branded web app. Fix UX gaps: assistant messages need visible containers, add typing/status indicators, enable true token-level streaming, and simplify file explorer to download-only.

## Color System

Switch from dark mode to light/cream mode using Mama Sita's actual brand colors (orange-gold `#faac54`, deep red-brown `#a83227`, cream `#ffdfa1`).

| Token | New Value | Usage |
|-------|-----------|-------|
| `--surface-0` | `#ffffff` | Sidebars, cards, header text |
| `--surface-1` | `#fdf6ee` | Main background (warm cream) |
| `--surface-2` | `#f5ede3` | Input fields, hover states |
| `--surface-3` | `#ebe3d9` | Borders, dividers |
| `--surface-4` | `#d9d0c5` | Active states, scrollbar thumb |
| `--text-primary` | `#2c2420` | Primary text (dark brown) |
| `--text-secondary` | `#6b5e52` | Secondary text, labels |
| `--text-muted` | `#a09488` | Placeholder, disabled, timestamps |
| `--text-inverse` | `#ffffff` | Text on accent backgrounds |
| `--accent-red` | `#a83227` | Mama Sita's red-brown (header, primary buttons) |
| `--accent-red-hover` | `#c23b2f` | Red-brown hover |
| `--accent-red-subtle` | `rgba(168, 50, 39, 0.08)` | Red tint backgrounds |
| `--accent-gold` | `#faac54` | Mama Sita's orange-gold (active states, highlights) |
| `--accent-gold-hover` | `#ffbc6e` | Gold hover |
| `--accent-gold-subtle` | `rgba(250, 172, 84, 0.08)` | Gold tint for assistant message cards |
| `--status-success` | `#3d8c5c` | Success (darker green for light bg) |
| `--status-warning` | `#d4942e` | Warning |
| `--status-error` | `#a83227` | Error (shares red) |
| `--status-info` | `#3d7a8c` | Info |
| `--border-default` | `rgba(107, 94, 82, 0.15)` | Default border |
| `--border-strong` | `rgba(107, 94, 82, 0.30)` | Emphasized border |
| `--code-bg` | `#faf5ef` | Code block background |
| `--code-text` | `#4a3f35` | Code text |
| `--tool-bg` | `#faf5ef` | Tool use block background |
| `--tool-border` | `#ebe3d9` | Tool use default border |
| `--tool-border-active` | `#faac54` | Tool use active border (gold) |

## Layout Colors

- **Header:** `#a83227` (red-brown) background, white text/icons. Bold brand statement.
- **Sidebars:** `#ffffff` (white) background, subtle border separating from cream chat area.
- **Chat area:** `#fdf6ee` (warm cream) background.
- **Input bar:** `#ffffff` background with `border-default` top border.

## Message Styling

**User messages:**
- White card (`#ffffff`) on cream background
- Subtle `border-default` border
- Right-aligned, max-width 85%
- `border-radius: 10px`

**Assistant messages:**
- Light orange-gold tinted card (`rgba(250, 172, 84, 0.08)` background)
- Subtle `border-default` border
- Left-aligned, max-width `72ch`
- `border-radius: 10px`
- Contains both tool use blocks and text response inside the same card

**Error messages:**
- Light red tint (`rgba(168, 50, 39, 0.08)` background)
- Red-brown border

## Typing/Status Indicator

A new `TypingIndicator` component shown below the last message while the agent is processing.

**States:**
- `"Thinking..."` — after user sends message, before any SDK response
- `"Reading notes.md..."` — when `tool_use` event arrives, shows tool name + first argument
- `"Searching for budget..."` — Grep with pattern arg
- `"Running command..."` — Bash tool
- Disappears when `assistant_text` / `assistant_delta` or `done` arrives

**Styling:**
- Pulsing orange-gold dot (6px) to the left
- `text-secondary`, italic, `text-sm`
- `animate: pulse 1.5s ease-in-out infinite` on the dot

**Status derivation from tool_use events:**

| Tool | Status Text |
|------|-------------|
| Read | `Reading {file_path}...` |
| Grep | `Searching for {pattern}...` |
| Glob | `Finding files...` |
| Bash | `Running command...` |
| Write | `Writing {file_path}...` |
| Edit | `Editing {file_path}...` |
| WebSearch | `Searching the web...` |
| WebFetch | `Fetching page...` |
| Other | `Using {tool}...` |

## Token-Level Streaming

Enable `includePartialMessages: true` in the SDK `query()` options. This yields `SDKPartialAssistantMessage` (type `stream_event`) with incremental text.

**New protocol message:**
```typescript
| { type: 'assistant_delta'; content: string }  // incremental text chunk
```

**Server (`agent.ts`):** When the SDK yields a message with `type === 'stream_event'`, extract the text delta and yield `{ type: 'assistant_delta', content: delta }`.

**Client (`App.tsx`):** Handle `assistant_delta` by appending the delta text to the current assistant message (same accumulation pattern as current `assistant_text`, but truly incremental). The existing `assistant_text` message continues to work as a fallback for complete messages.

## File Explorer: Download Instead of Preview

**Change:** Clicking a file in the explorer triggers a browser download instead of opening a preview modal.

**Server:** Update `GET /api/files/{*filePath}` to set `Content-Disposition: attachment; filename="<name>"` header.

**Client:** `FileExplorer.tsx` changes `onFileClick` to open `/api/files/<path>` in a new tab (browser handles download). Remove `FilePreview.tsx` and its `highlight.js` import entirely.

**Benefit:** Removes `highlight.js` from the client bundle (saves ~960KB of the 1.5MB JS bundle).

## Syntax Highlighting (Light Theme)

Update the `.hljs-*` classes in `index.css` to a warm light theme:

| Token Type | Color |
|------------|-------|
| Keyword | `#a83227` (red-brown) |
| String | `#b8762a` (warm amber) |
| Number | `#3d7a6a` (teal) |
| Comment | `#a09488` (muted) |
| Function | `#4a3f35` (dark brown) |
| Variable | `#6b5e52` (secondary) |
| Operator | `#a09488` (muted) |
| Type/Class | `#3d7a8c` (blue-teal) |

## Files Changed

| File | Changes |
|------|---------|
| `client/src/index.css` | All CSS custom properties swapped to light palette, syntax highlighting updated, component classes updated (header bg, scrollbar, prose styles) |
| `client/tailwind.config.ts` | All color tokens updated to match new values |
| `client/src/components/Header.tsx` | Red-brown bg, white text/icons, remove dynamic stroke colors |
| `client/src/components/MessageBubble.tsx` | Both user and assistant get card containers with appropriate tints |
| `client/src/components/ToolUseBlock.tsx` | Light theme — cream bg, warm brown text, gold active border |
| `client/src/components/ChatInput.tsx` | White bg input, warm styling |
| `client/src/components/ChatView.tsx` | Add TypingIndicator below messages |
| `client/src/components/FileExplorer.tsx` | Download on click instead of preview, remove FilePreview import |
| `client/src/components/SessionItem.tsx` | Light theme colors |
| `client/src/components/SessionHistory.tsx` | White bg sidebar |
| `client/src/components/FileTreeNode.tsx` | Light theme colors |
| `client/src/App.tsx` | Add `agentStatus` state, handle `assistant_delta`, derive status text from `tool_use`, pass to ChatView |
| `server/src/agent.ts` | Add `includePartialMessages: true`, yield `assistant_delta` from `stream_event` messages |
| `server/src/protocol.ts` | Add `assistant_delta` to ServerMessage |
| `client/src/types.ts` | Mirror `assistant_delta` |

## New Files

| File | Purpose |
|------|---------|
| `client/src/components/TypingIndicator.tsx` | Pulsing dot + dynamic status text |

## Removed Files

| File | Reason |
|------|---------|
| `client/src/components/FilePreview.tsx` | Replaced by download. Also removes `highlight.js` from bundle. |

## .impeccable.md Update

The `.impeccable.md` design system doc needs a full rewrite to reflect the light/cream Mama Sita's branding, replacing the "Control Room Warmth" direction. Key changes:
- Aesthetic direction: "Mama Sita's Kitchen" — warm, inviting, Filipino heritage
- All color tokens updated
- Anti-patterns updated (no dark mode references, no "briefing" metaphor)
- Assistant messages now have visible containers (not floating text)
