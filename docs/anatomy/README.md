---
id: anatomy
title: Anatomy
chapter: anatomy
status: settled
since: 0.7.0
---

# Anatomy

Five levels, each made only of the one below it, and all of them on the same cells. A unique design changes variables at any level. It does not invent a sixth.

| ID | Level | Classes | Page |
|---|---|---|---|
| A1 | Page | `.frame`, `.shell` | [Page](A1.md) |
| A2 | Section | `.section`, `.cover` | [Section](A2.md) |
| A3 | Composition | `.stack`, `.cluster`, `.cols`, `.split`, `.grid`, `.cells`, `.rail`, `.row`, `.list`, `.board`, `.prose` | [Composition](A3.md) |
| A4 | Surface | `.card`, `.float`, `.modal`, the `pre` in `.prose` | [Surface](A4.md) |
| A5 | Element | type roles, `.tag`, `.button`, `.avatar`, `.field`, `.input`, `.tabs`, `.badge`, `.dot`, `.skeleton` | [Element](A5.md) |

## Two definitions

These hold the levels apart. Until now they lived only in conversation.

**A composition arranges.** It owns the gap between its children and paints nothing. It has no ground, no edge and no corner. Its variables are gaps, tracks and counts: `--stack-gap`, `--cluster-gap`, `--cols`, `--split-a`, `--grid-min`. It may draw its own dividers, as a list's hairlines; a ground inside it, a list row's hover or a cover's media, is an element treated as a surface, not the composition painting (D72).

**A surface paints.** It owns a ground, an edge, a corner and the padding inside. It is a container, so the type inside it answers to its width, not the window's; a surface that sizes to its content, a tooltip or a chat bubble, need not be one, since a container's width can't come from what it holds (D74). Its variables are padding, radius and edge: `--card-pad-inline`, `--card-pad-block`, `--card-radius`, `--card-border`.

A thing that both arranges and paints is two things: a surface holding a composition. A card with a `.stack` inside it is the model.

**A section or a page may paint a ground** without being a surface: a band's color, a navigation's ground and the line where it meets main. It owns no corner or padding as a surface does, and it isn't a container (D73).

## Five ways to meet a line

Everything on the page meets a cell line in one of five ways, and each name means one thing. Stand and Hang are how type meets a line. Inset, Outset and Center are how a box does.

| ID | Relation | What meets the line | Page |
|---|---|---|---|
| M1 | Stand | The last baseline sits on a line. | [Stand](M1.md) |
| M2 | Hang | The top of the capitals sits on a line, and the block rounds up to whole cells. | [Hang](M2.md) |
| M3 | Inset | Content sits whole cells inside a surface's edge. | [Inset](M3.md) |
| M4 | Outset | A surface's edge steps whole cells outside the line its content keeps. | [Outset](M4.md) |
| M5 | Center | A box straddles a line by the same amount either side. | [Center](M5.md) |

## Which level uses which relation

| Level | Stand | Hang | Inset | Outset | Center |
|---|---|---|---|---|---|
| A1 Page | | | the gutter: the field sits whole cells inside the frame | the grid and a band's color reach past the frame to the screen's edges | the frame is centered on the screen |
| A2 Section | its title, when it is h1 to h3 | its label and intro | a band's block padding (6 cells) | a band's surface, to the screen's edges | |
| A3 Composition | | a cluster rounds to the nearest cell | | a row of nothing but cards; `.list` rows | |
| A4 Surface | a headline inside it | its text | its padding | its edge, by `--outset` | a float centers on its anchor, not on a line |
| A5 Element | h1 to h3 | every other type role, the label | a control's padding, a tag's padding equal to its corner | | an icon on the cap height or x-height; an avatar's dot |

A composition uses the fewest relations because it paints nothing: it only places its children on lines and rounds its own height.
