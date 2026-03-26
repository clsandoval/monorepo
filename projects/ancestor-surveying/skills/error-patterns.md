# Common Error Patterns in Philippine Land Titles

## Bearing Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| N/S swap | Polygon doesn't close; reversing one N/S fixes it | Check original scan |
| E/W swap | Same as above | Same |
| Degree misread | Closure error on one segment | Compare against parent/older title |

## Distance Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| Digit misread (5 vs 6, 3 vs 8) | Segment too long/short vs neighbors | Check parent title |
| Transposed digits (52 vs 25) | Dramatic closure error | Usually obvious from context |
| Missing decimal (2500 vs 25.00) | Impossible distance | Check units |

## Inter-Lot Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| Shared boundary mismatch | Adjacent lots disagree on distance/bearing | Apply seniority |
| Subdivision overflow | Children don't fit in parent | Recompute all children |
| Transcription compounding | Errors amplify through generations | Trace to mother title |

## Rules
1. **Never correct the original document.** Only flag.
2. **Always preserve what the document says.** Your job is to identify what's wrong, not to fix titles.
3. **Flag with evidence.** Every flag must cite the specific documents that conflict.
4. **Recommend, don't decide.** Present the evidence and your recommendation. The surveyor makes the call.
