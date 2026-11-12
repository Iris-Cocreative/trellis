---
id: P
title: Principles
chapter: seed
status: settled
since: unrecorded
---

# Principles

The higher-order ideas above the rules. Each principle is one sentence, with the rules that keep it. A principle that no rule or check keeps is not listed; the ones dropped are at the bottom.

| ID | Principle | Kept by |
|---|---|---|
| P1 | The cell is the only line: every edge and every block of text meets one line, the cell's. | R1, R2, R3, R4, R6 |
| P2 | Closeness is a scale: space inside a thing is half or quarter cells, space between things is whole cells, and sizes step by doubling. | R6, [S1](S1.md) (the octaves) |
| P3 | Density is a dial, not a redesign: making a surface denser or roomier turns a variable, never a new layout, and never costs a missed tap. | R14, R15, R18; `--u-scale` |
| P4 | The reader's settings win: type follows the reader's text size all the way, the cell follows it up to its cap, and a control grows with its label. | R17, R18, R19, F2 |
| P5 | One concept has one archetype: variants change the primitive's own variables instead of making a second primitive. | R13, R16 |
| P6 | Context changes variables, never markup: a component nests at any depth because the box it is in sets its variables. | R14, R15, [S4](S4.md) |

## Dropped

- **Nothing ships in a product before it is in the specimen.** No rule or check keeps it. The specimen is built only from the foundation and is the first test of it, but nothing fails when a product uses a primitive the specimen does not show. `tests/contract.js` checks the README's Public API against `core.css`, not against the specimen. It could become a rule with a check that every Public API class appears in `index.html`.
