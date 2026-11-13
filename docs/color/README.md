---
id: C
title: Color and Theme
chapter: color
status: settled
since: Unreleased
---

# Color and Theme

A few seeds, and every color grown from one. A product chooses the seeds; core derives the roles a component paints with, in both themes, and checks that text on them can be read. This chapter says what the roles are, how a theme turns them, what kind means, what the checks cover, and what happens when the system takes the colors away.

The README's section "Color" is the reference these pages explain. Decisions [D54](../decisions/D54.md) (the relational palette) and [D78](../decisions/D78.md) (the specimen's Color section) are where they came from.

| ID | Page | In one line |
|---|---|---|
| [C1](C1.md) | Seeds and roles | A product sets ten seeds; every role is a seed at a lightness, or a mix of a role. |
| [C2](C2.md) | Light and dark | One declaration per role carries both themes, read where it is painted. |
| [C3](C3.md) | Kinds | What sort of thing this is: a kind sets a color and, on an avatar, a shape. |
| [C4](C4.md) | Contrast | The floors the contract checks, in both themes and for every product layer, and the pairs it does not check yet. |
| [C5](C5.md) | Forced colors | What survives when the system replaces every color, and what is lost. |

Each page has the seed chapter's shape: what it is, why, how it is computed in plain words, where it lives in the code, and how it is checked.
