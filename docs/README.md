# Trellis knowledge base

Every part of Trellis and every choice behind it, made explicit. The knowledge base lives with the code, so a page describes a rule, a decision or a part as it is in this commit. The [README](../README.md) is the reference; these pages are the reasons.

**The audit.** Four chapters come first, as a check on the approach before more is built:

| Chapter | What it holds | IDs |
|---|---|---|
| [The Seed](seed/README.md) | The cell, the ratio, response and context; lines are planes; point, line, plane; the masters; why relationships replace values; the principles above the rules | `S1`, `S2` … and `P1`, `P2` … for principles |
| [Rules](rules/README.md) | Every rule, one page each, in one shape | `R1` … `R20` keep the README's numbers; `F1` … `F6` are the rules for free, flowing and moving layouts |
| [Decisions](decisions/README.md) | Every choice, as a decision record | `D1`, `D2` … in the order they were made |
| [Anatomy](anatomy/README.md) | The five levels, the two definitions that hold them together, and the five ways anything meets a line | `A1` … `A5` for the levels, `M1` … `M5` for the relations |

After the audit:

| Chapter | What it holds | IDs |
|---|---|---|
| [Color and Theme](color/README.md) | Seeds and roles, light and dark, kinds, the contrast floors, forced colors | `C1` … `C5` |

The other chapters (Start Here, Type, Primitives, Products and Platforms, Support and Degradation, Tooling, Adoption, Versioning, Open Questions and Roadmap) come after the audit.

## Stable IDs

An ID never changes and is never reused. A rule that is withdrawn keeps its page, marked `withdrawn`, with the decision that withdrew it. Tests, the changelog and commit messages cite IDs: "R5", "D14".

The README numbers its rules 1 to 20, and those numbers are the IDs: rule 5 is `R5`. A new rule takes the next number. If the README's list is ever reordered, the IDs stay with their rules.

## Page shapes

Every page opens with frontmatter:

```yaml
---
id: R5
title: Surfaces step out
chapter: rules            # seed, rules, decisions, anatomy, color
status: settled           # settled, questioned, withdrawn; a decision is accepted or superseded
since: 0.6.0              # the first version it held in, where the changelog says
---
```

Then the chapter's shape, in this order, with these headings.

**A rule:** Statement · Why · The failure it prevents · How it is checked · Example · Exceptions. A rule that cannot give its reason, or that the code does not keep, is `questioned`, and says what is missing.

**A decision:** Context · Options considered · Decision · Consequences · Date · Who · Superseded by. "Who" is a role (the owner, the build session, the review session), never a name. A decision whose alternatives were never weighed says so under Options considered, and is flagged for the owner rather than written as if they had been.

**A part of the anatomy:** What it is · Its parts · What it owns · How it meets the line · Rules it keeps.

**A page of the seed:** What it is · Why · How it is computed, in plain words · Where it lives in the code.

**A page of Color and Theme:** the seed's shape, then How it is checked. A page whose check is missing is `questioned`, and says what is missing.

## Writing

American English. Short sentences. No names of people, clients or products: this repository is public. Cite the code by file (`core.css`, `math.js`) and the tests by name (`tests/align.js`).
