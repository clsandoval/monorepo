# Monorepo - Personal Knowledge Base

## Purpose

This repository is a centralized dumping ground for everything across my life and work. It's an **ingestion and retrieval system** - I dump information here, and Claude should be able to organize, categorize, and retrieve whatever I need.

## What Goes Here

- **Automation**: Automated loops, webhooks, scripts, bots
- **Meeting Trackers**: Notes and trackers from meetings across all businesses I'm part of
- **Work Context**: What I'm currently working on, project status, priorities
- **Research**: Trip planning, event research, things I'm looking into
- **Data**: Snow data, metrics, any data I want to track
- **Anything else**: If I need to remember it or reference it later, it goes here

## How Claude Should Use This

### On Ingestion (when I dump something)
- Help organize into appropriate folders/files
- Tag or categorize the content
- Link related information if connections exist
- Suggest structure improvements when patterns emerge

### On Retrieval (when I ask for something)
- Search across all content to find relevant information
- Synthesize answers from multiple sources if needed
- Provide context about when/where information came from
- Surface related information I might also want

## Structure

```
/monorepo
├── claude.md           # This file - repo context for Claude
├── automations/        # Webhooks, loops, scripts, bots
├── meetings/           # Meeting notes and trackers by business/project
├── projects/           # Active work and project context
├── research/           # Trip planning, event research, explorations
├── data/               # Snow data, metrics, tracked information
└── inbox/              # Quick dumps before organizing
```

## Notes

- Don't worry about perfect organization on first dump - use `/inbox` for quick captures
- Claude should help refine structure as patterns emerge
- Cross-reference liberally - information often relates across categories
