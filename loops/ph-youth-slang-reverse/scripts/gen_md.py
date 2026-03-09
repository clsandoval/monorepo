import json
from datetime import date

with open('output/dictionary.json', 'r') as f:
    d = json.load(f)

with open('output/categories.json', 'r') as f:
    cats = json.load(f)

# Stats
total_terms = len(d)
total_cats = len([s for s, c in cats.items() if c['term_count'] > 0])
with_synonyms = sum(1 for e in d if e.get('synonyms'))
with_antonyms = sum(1 for e in d if e.get('antonyms'))

from collections import Counter
src_counter = Counter()
for e in d:
    for s in e.get('sources', []):
        src_counter[s] += 1

lines = []
lines.append('# Filipino Youth Slang Dictionary & Thesaurus')
lines.append('')
lines.append(f'> Generated: {date.today()} | Scope: Philippines 2023-2026 | Wave 4 Synthesis + Refinement Pass 11')
lines.append('')
lines.append('## Summary Statistics')
lines.append('')
lines.append('| Stat | Value |')
lines.append('|------|-------|')
lines.append(f'| Total terms | {total_terms} |')
lines.append(f'| Categories | {total_cats} |')
lines.append(f'| Terms with synonyms | {with_synonyms} |')
lines.append(f'| Terms with antonyms | {with_antonyms} |')
lines.append('')

lines.append('### Top Sources')
lines.append('')
for src, count in src_counter.most_common(8):
    lines.append(f'- {src}: {count} terms')
lines.append('')

lines.append('## Category Breakdown')
lines.append('')
main_cats = [(s, c) for s, c in cats.items() if c['term_count'] >= 2]
main_cats.sort(key=lambda x: -x[1]['term_count'])
for slug, cat in main_cats:
    lines.append(f'- **{cat.get("label", slug)}** ({cat["term_count"]} terms)')
lines.append('')

lines.append('## Table of Contents')
lines.append('')
for slug, cat in main_cats:
    anchor = slug.lower().replace(' ', '-')
    lines.append(f'- [{cat.get("label", slug)}](#{anchor})')
lines.append('')

for slug, cat in main_cats:
    label = cat.get('label', slug)
    lines.append('---')
    lines.append('')
    lines.append(f'## {label}')
    lines.append('')
    if cat.get('description'):
        lines.append(f'*{cat["description"]}*')
        lines.append('')

    entries = [e for e in d if slug in e.get('categories', [])]
    entries.sort(key=lambda x: x['term'].lower())

    for e in entries:
        term = e['term']
        lines.append(f'### {term}')
        lines.append('')

        other_cats = [c for c in e.get('categories', []) if c != slug]
        if other_cats:
            cat_links = ', '.join(f'*{c}*' for c in other_cats)
            lines.append(f'*Also in: {cat_links}*')
            lines.append('')

        for i, defn in enumerate(e.get('definitions', []), 1):
            lines.append(f'{i}. {defn}')
        lines.append('')

        if e.get('etymology'):
            lines.append(f'> **Etymology:** {e["etymology"]}')
            lines.append('')

        if e.get('examples'):
            lines.append('**Examples:**')
            for ex in e['examples']:
                lines.append(f'- *"{ex["text"]}"* — {ex["source"]}')
            lines.append('')

        if e.get('synonyms'):
            syns = ', '.join(f'[[{s}]]' for s in e['synonyms'])
            lines.append(f'**Synonyms:** {syns}')
            lines.append('')
        if e.get('antonyms'):
            ants = ', '.join(f'[[{a}]]' for a in e['antonyms'])
            lines.append(f'**Antonyms:** {ants}')
            lines.append('')
        if e.get('related_terms'):
            rels = ', '.join(f'[[{r}]]' for r in e['related_terms'])
            lines.append(f'**Related:** {rels}')
            lines.append('')

        if e.get('regional_notes'):
            lines.append(f'**Regional notes:** {e["regional_notes"]}')
            lines.append('')

content = '\n'.join(lines)
with open('output/dictionary.md', 'w') as f:
    f.write(content)

line_count = content.count('\n')
print(f'dictionary.md written: {line_count} lines, {len(content)} chars, {total_terms} entries')
