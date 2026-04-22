#!/usr/bin/env python3
"""Convert dialogue.md to dialogue.json for podcast generation."""

import json
import re
import sys


def remove_jp_markers(text):
    """Remove [JP: ...] wrappers while preserving content inside.
    
    Handles nested [JP: ] blocks and strips internal ARK:/RED: attributions.
    """
    result = []
    i = 0
    depth = 0
    while i < len(text):
        # Check for [JP: prefix
        if text[i:i+5] == '[JP: ':
            i += 5
            depth += 1
            # Skip optional speaker attribution right after [JP:
            attr = re.match(r'(ARK|RED)(\s+narrates\s+in\s+JP)?:\s*', text[i:])
            if attr:
                i += attr.end()
        elif text[i] == ']' and depth > 0:
            depth -= 1
            i += 1
        else:
            result.append(text[i])
            i += 1
    return ''.join(result)


def parse_dialogue(filepath):
    with open(filepath, encoding='utf-8') as f:
        text = f.read()

    lines = text.split('\n')
    dialogue = []

    # --- Skip YAML frontmatter ---
    in_frontmatter = False
    frontmatter_seen = False
    content_lines = []
    for line in lines:
        if line.strip() == '---':
            if not frontmatter_seen:
                in_frontmatter = True
                frontmatter_seen = True
                continue
            elif in_frontmatter:
                in_frontmatter = False
                continue
        if in_frontmatter:
            continue
        content_lines.append(line)

    # --- Parse speaker turns ---
    for line in content_lines:
        stripped = line.strip()

        # Skip segment markers and section headings
        if stripped.startswith('---') or stripped.startswith('###'):
            continue

        # Skip blank lines
        if not stripped:
            continue

        # Match speaker lines: ARK: ... or RED: ...
        m = re.match(r'^(ARK|RED):\s*(.*)', stripped)
        if m:
            speaker = 'a' if m.group(1) == 'ARK' else 'b'
            raw_text = m.group(2).strip()
            if raw_text:
                cleaned = remove_jp_markers(raw_text)
                # Normalise whitespace (collapse runs, trim)
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                if cleaned:
                    dialogue.append({'speaker': speaker, 'text': cleaned})

    return dialogue


if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else '/mnt/session/uploads/workspace/dialogue.md'
    dialogue = parse_dialogue(filepath)

    out = '/tmp/dialogue.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(dialogue, f, indent=2, ensure_ascii=False)

    # Quick stats
    a_turns = [t for t in dialogue if t['speaker'] == 'a']
    b_turns = [t for t in dialogue if t['speaker'] == 'b']
    print(f"Turns: {len(dialogue)} total  (A={len(a_turns)}, B={len(b_turns)})")
    print(f"Output: {out}")
    # Show first 3 and last 2 for sanity
    print("\n--- First 3 turns ---")
    for t in dialogue[:3]:
        print(f"  [{t['speaker'].upper()}] {t['text'][:120]}...")
    print("\n--- Last 2 turns ---")
    for t in dialogue[-2:]:
        print(f"  [{t['speaker'].upper()}] {t['text'][:120]}...")
