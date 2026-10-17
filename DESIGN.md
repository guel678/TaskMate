---
name: TaskMate
description: A calm, paper-like design system for focused daily planning and direct Android distribution.
colors:
  page-warm: "#efe9e5"
  background-paper: "#faf7f4"
  surface-white: "#ffffff"
  surface-muted: "#f2ece8"
  action-rust: "#b94732"
  action-rust-pressed: "#9f3828"
  action-rust-soft: "#f7ddd6"
  priority-ink: "#7a2f21"
  ink-deep: "#211c1a"
  ink-muted: "#6d5f59"
  border-warm: "#ddd1cb"
  focus-brown: "#5c2b22"
  check-outline: "#87766f"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(3.35rem, 7vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4.4rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.55rem"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Aptos, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Aptos, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 720
    lineHeight: 1.35
  action:
    fontFamily: "Aptos, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 760
    lineHeight: 1
rounded:
  checkbox: "7px"
  small: "8px"
  mark: "9px"
  action: "13px"
  card: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  nav-site-header:
    backgroundColor: "{colors.page-warm}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.label}"
    padding: "0"
    height: "88px"
  button-primary:
    backgroundColor: "{colors.action-rust}"
    textColor: "{colors.surface-white}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "0 22px"
  button-primary-hover:
    backgroundColor: "{colors.action-rust-pressed}"
    textColor: "{colors.surface-white}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "0 22px"
  chip-progress:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 10px"
  chip-priority:
    backgroundColor: "{colors.action-rust-soft}"
    textColor: "{colors.priority-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
  card-task-list:
    backgroundColor: "{colors.background-paper}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.card}"
    padding: "30px"
  card-release:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.card}"
    padding: "26px"
---

# Design System: TaskMate

## Overview

**Creative North Star: "The Quiet Daybook"**

TaskMate should feel like opening a well-kept paper daybook: warm, composed, and immediately useful. Soft neutral grounds create the atmosphere, crisp paper surfaces organize the content, and a single rust-red voice identifies action and completion. The result is professional without becoming corporate and personal without becoming decorative.

The system is restrained but not sterile. Newsreader gives major headings an editorial, human cadence; Aptos keeps instructions, task data, and release facts direct. A lightly offset paper layer and selective, broad shadows supply the only expressive depth, while clearly labeled, credible task content keeps the interface grounded in the product.

**Key Characteristics:**

- Warm-neutral paper atmosphere with clean, legible contrast.
- One rust-red action voice for downloads, checks, priorities, and focus.
- Editorial display type paired with practical system sans-serif text.
- Restrained depth built from tonal layers, offset paper, and broad soft shadows.
- Direct copy and credible product proof instead of promotional ornament.

## Colors

The palette stays close to warm paper, cocoa ink, and one controlled rust-red action family.

### Primary

- **Rust Red Action** (#b94732): The principal interactive color for the download action, completed checks, scrollbar thumb, and brand mark.
- **Deep Rust Press** (#9f3828): The darker hover and pressed response for the primary action.
- **Blush Paper Cue** (#f7ddd6): A quiet accent surface behind the task proof and high-priority chip.
- **Priority Rust Ink** (#7a2f21): Readable text over the blush priority surface.
- **Focus Brown** (#5c2b22): A dark, high-contrast outline reserved for keyboard focus.

### Neutral

- **Warm Ground** (#efe9e5): The site canvas and header ground.
- **Clean Paper** (#faf7f4): The task-list sheet and primary proof surface.
- **White Sheet** (#ffffff): The brightest card and reversed-action text.
- **Soft Paper Muted** (#f2ece8): Quiet chip and scrollbar-track fill.
- **Deep Cocoa Ink** (#211c1a): Primary text and the skip-link surface.
- **Muted Cocoa** (#6d5f59): Supporting copy, metadata, and secondary navigation.
- **Warm Divider** (#ddd1cb): Hairline structure between facts and task rows.
- **Checkbox Graphite** (#87766f): The incomplete checkbox outline.

### Named Rules

**The Rust Is an Action Rule.** Rust identifies a decision, state, or completion; it is never used as broad decorative fill.

**The Warm White Rule.** The canvas remains warm and white is reserved for the clearest raised surface, so hierarchy is visible before any shadow appears.

## Typography

**Display Font:** Newsreader (with Georgia and serif fallback)

**Body Font:** Aptos (with Segoe UI and ui-sans-serif fallback)

**Character:** Newsreader makes the interface feel considered and human at large scale. Aptos stays neutral, compact, and highly legible for every functional line.

### Hierarchy

- **Display** (500, clamp(3.35rem, 7vw, 6rem), 0.98): The main promise, set tightly and held to a short measure.
- **Headline** (500, clamp(2.5rem, 5vw, 4.4rem), 1): Major section transitions such as installation guidance.
- **Title** (500, 1.55rem, 1.2): The title inside the task-list proof.
- **Body** (400, 1rem, 1.6): Explanations and supporting copy, generally limited to approximately 38rem.
- **Label** (720, 0.9rem, 1.35): Release values, navigation, badges, and compact product facts.

### Named Rules

**The Two Voices Rule.** Newsreader speaks at display and proof-title scale; Aptos carries actions, instructions, metadata, and every scannable fact.

**The Short Promise Rule.** Display copy stays compact enough to preserve its deliberate line breaks and low line-height.

## Layout

The desktop frame is a centered container capped at 1180px with 24px side gutters. The opening composition uses a slightly copy-heavy two-column grid (1.05fr / 0.95fr), a fluid gap from 48px to 112px, and enough vertical space to keep the download action and the task-list proof in the same viewport on typical desktop displays.

At 820px and below, the layout becomes a single column: the proof follows the promise, the three factual feature columns become stacked rows, and the installation copy precedes the release card. At 520px, side gutters tighten to 16px, the download action becomes full-width, and card padding contracts. At 360px, release facts and task metadata stack instead of compressing. The recurring spacing rhythm favors 8px, 12px, 16px, 24px, 32px, and 48px steps.

**The Proof Beside Promise Rule.** On wide screens, the product claim and credible task-list proof share the opening composition; on narrow screens, preserve the same reading order without squeezing either one.

## Elevation & Depth

Depth is a hybrid of tonal layering and a few broad, warm shadows. The task proof receives the strongest ambient shadow and a rotated blush paper layer; the release card receives a quieter lift; the primary action gains only a small interactive lift. Flat dividers continue to carry most structural separation.

### Shadow Vocabulary

- **Proof Ambient** (0 30px 70px rgba(65, 35, 27, 0.13)): The main task-list proof only.
- **Action Rest** (0 12px 28px rgba(121, 48, 35, 0.25)): The primary download action at rest.
- **Action Hover** (0 16px 34px rgba(121, 48, 35, 0.31)): The primary action while hovered.
- **Release Ambient** (0 18px 50px rgba(65, 35, 27, 0.10)): The factual release card.

### Named Rules

**The Paper Before Shadow Rule.** Establish hierarchy with surface tone and dividers first; reserve shadows for the action and the two proof-bearing cards.

**The One Expressive Tilt Rule.** Only the desktop task-list proof uses rotation and offset paper; remove its rotation on compact layouts so the content stays stable and readable.

## Shapes

The form language is gently curved and compact rather than bubbly. Major cards use 16px corners, the primary action uses 13px corners, small utility surfaces use 8px to 9px corners, and checkboxes use a tighter 7px radius. Only status chips use the fully rounded 999px capsule. Borders stay thin and warm; icons use open strokes with rounded caps and joins.

**The Capsule Means Status Rule.** Full pills are reserved for progress and priority metadata, never for large calls to action or general containers.

## Components

### Buttons

The primary button is confident and direct, with no ornamental treatment beyond its functional icon and low lift.

- **Shape:** A softly rectangular action (13px radius) with a 56px minimum height and 22px horizontal padding.
- **Primary:** Rust-red fill, white label, a 21px download icon, and a sturdy 760-weight label.
- **Hover / Focus:** Hover shifts to deep rust, rises 2px, and deepens the warm shadow over 180ms ease-out; keyboard focus uses a 3px focus-brown outline with 4px offset.
- **Active:** Returns to the resting vertical position for a concise physical response.

### Chips

Chips are small factual markers, not secondary buttons.

- **Style:** Fully rounded capsules with compact 6px to 10px padding.
- **State:** Progress uses a muted paper fill and muted text; high priority uses blush paper with priority-rust text.

### Cards / Containers

Cards resemble separate sheets within the warm page rather than generic dashboard panels.

- **Corner Style:** Major cards use gently curved 16px corners.
- **Background:** Task proof uses clean paper; release verification uses white.
- **Shadow Strategy:** Only proof-bearing cards use the named ambient shadows.
- **Border:** Internal rows use 1px warm dividers instead of nested boxes.
- **Internal Padding:** 30px for the task proof and 26px for release verification, contracting to 18px to 22px on phones.

### Navigation

The header is a quiet 88px brand-and-source row. The brand pairs the 36px rust checkmark tile with a strong wordmark; the source link is smaller and muted until hover, then shifts to deep ink. At 520px the header shortens to 72px, and at 360px it allows the two items to align from the top without overlap.

### Task-List Proof

The signature component is a real-looking three-row task list, visibly labeled as an example. It combines a restrained title, progress chip, thin dividers, compact metadata, a completed state with line-through text, and one priority marker. On desktop, a 1.5-degree rotation and offset blush sheet suggest a handled paper list; both effects settle down on compact layouts.

## Do's and Don'ts

### Do:

- **Do** keep warm ground visible around clean paper surfaces.
- **Do** reserve rust-red for action, completion, priority, and focus-related feedback.
- **Do** pair direct claims with credible task or release details.
- **Do** preserve visible keyboard focus and the reduced-motion override.
- **Do** let dividers and spacing organize dense facts before adding elevation.

### Don't:

- **Don't** introduce gradients, glass panels, glows, abstract SaaS illustration, or decorative analytics.
- **Don't** turn the rust accent into a large background field or a second typography color.
- **Don't** make major actions pill-shaped; capsules belong to compact status.
- **Don't** add competing card grids where a plain row or factual line is clearer.
- **Don't** retain tilt or hover movement when the visitor requests reduced motion.
