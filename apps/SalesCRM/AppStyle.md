# App Design Reference — Linear

Design tokens and styles extracted from a recording of [Linear](https://linear.app) (project management app), specifically the "My Issues > Assigned" view. The app was running in light theme mode.

---

## Layout

| Region   | Width  | Height |
|----------|--------|--------|
| Viewport | 1237px | 707px  |
| Sidebar  | 244px  | 707px  |
| Main     | 984px  | 690px  |

- Sidebar width is set via `--sidebar-width: 244px`
- Main content fills the remaining width
- Sidebar has no visible right border (`border-right: 0px none`); separation is achieved through background color contrast

---

## Typography

**Font Stack:**
```
"Inter Variable", "SF Pro Display", -apple-system, "system-ui", "Segoe UI", Roboto, sans-serif
```

**Scale:**

| Use Case              | Size       | Weight | Color              |
|-----------------------|------------|--------|--------------------|
| Body base             | 16px       | 400    | rgb(0, 0, 0)       |
| Org/workspace name    | 14px       | 600    | rgb(45, 46, 47)    |
| Sidebar nav items     | 13px       | 450    | rgb(45, 46, 47)    |
| Button labels         | 13.3333px  | 400    | rgb(45, 46, 47)    |
| Small labels/metadata | 12px       | 400    | rgb(89, 89, 90)    |
| Tiny/badges           | 11px       | 400    | varies             |

**Text Colors:**

| Role           | Value              | Hex       |
|----------------|--------------------|-----------|
| Primary        | rgb(26, 26, 26)    | `#1a1a1a` |
| Secondary      | rgb(45, 46, 47)    | `#2d2e2f` |
| Muted/tertiary | rgb(89, 89, 90)    | `#59595a` |
| Disabled/hint  | rgb(176, 181, 192) | `#b0b5c0` |
| On-dark/inverse| rgb(255, 255, 255) | `#ffffff` |

---

## Color Palette

### Light Theme

| Token                            | Value     | Usage                |
|----------------------------------|-----------|----------------------|
| `--bg-sidebar-color`             | `#f5f5f5` | Sidebar background   |
| `--bg-base-color`                | `#fcfcfc` | Main content bg      |
| `--bg-border-color`              | `#dcdcdc` | Default borders      |
| `--bg-border-color-light`        | `#e0e0e0` | Slightly darker borders |
| `--content-color-light`          | `#b0b5c0` | Muted content/icons  |
| `--content-highlight-color-light`| `#23252a` | Emphasized content   |

### Dark Theme (defined but not active)

| Token                            | Value     |
|----------------------------------|-----------|
| `--bg-sidebar-dark`              | `#090909` |
| `--bg-base-color-dark`           | `#101012` |
| `--bg-border-color-dark`         | `#23252a` |
| `--content-color-dark`           | `#6b6f76` |
| `--content-highlight-color-dark` | `#ffffff` |

### Accent / Brand Colors

| Value              | Hex       | Usage                        |
|--------------------|-----------|------------------------------|
| rgb(113, 128, 255) | `#7180ff` | Primary accent, selection    |
| rgb(93, 133, 255)  | `#5d85ff` | Blue link/action variant     |
| rgb(149, 119, 255) | `#9577ff` | Purple variant               |
| rgb(109, 120, 213) | `#6d78d5` | Muted accent                 |

---

## Buttons

### Base Button Style (`.dDRLxD` — Emotion class)

Full CSS extracted from stylesheet (49 properties):

```css
/* Layout */
display: inline-flex;
vertical-align: top;
align-items: center;
justify-content: center;
white-space: nowrap;
flex-shrink: 0;

/* Spacing */
margin: 0;
padding: 0px 6px 0px 4px;

/* Sizing */
height: 28px;

/* Typography */
font-weight: var(--font-weight-medium);
font-size: 13.3333px;
line-height: normal;

/* Appearance */
background: transparent;
color: rgb(45, 46, 47);
border-width: 1px;             /* via ui-facelift override */
border-style: solid;
border-color: transparent;     /* all four sides transparent */
border-radius: 5px;            /* bottom-left confirmed 5px */
cursor: pointer;

/* Transitions */
transition-property: fill;                         /* on SVG children */
transition-duration: var(--speed-highlightFadeOut); /* on SVG children */
```

### Button Variants (observed from rendered elements)

| Variant         | Background           | Text Color          | Size       | Padding           | Notes                     |
|-----------------|----------------------|---------------------|------------|-------------------|---------------------------|
| Ghost (default) | `transparent`        | rgb(45, 46, 47)     | 92x28      | 0px 6px 0px 4px   | Sidebar/toolbar buttons   |
| Surface         | rgb(252, 252, 252)   | rgb(255, 255, 255)  | varies     | varies            | Elevated actions          |
| Accent/Primary  | rgb(113, 128, 255)   | rgb(255, 255, 255)  | varies     | varies            | Primary CTA               |
| Text-only       | `transparent`        | rgb(0, 0, 0)        | 188x24     | 0px 4px           | Section headers ("Your teams") |
| Icon-only       | `transparent`        | rgb(45, 46, 47)     | 28x28      | 0px               | Toolbar icons             |

Specific rendered buttons observed:

| Button Text     | Width×Height | Background        | Color           | Font            | Padding          |
|-----------------|-------------|-------------------|-----------------|-----------------|------------------|
| "Replay" (org)  | 92×28       | transparent       | rgb(45, 46, 47) | 13.3px / 400    | 0px 6px 0px 4px  |
| "Workspace"     | varies      | transparent       | rgb(45, 46, 47) | 13.3px / 400    | varies           |
| "Your teams"    | 188×24      | transparent       | rgb(0, 0, 0)    | 13.3px / 400    | 0px 4px          |
| "Product2025"   | 216×28      | transparent       | rgb(0, 0, 0)    | 13.3px / 400    | 0px              |

### Button Hover State

```css
/* Ghost button hover (`:not(:disabled):hover` and `[data-menu-open="true"]`) */
background-color: rgba(0, 0, 0, 0.063);   /* ~6% black overlay */
color: rgb(26, 26, 26);                    /* text shifts to primary */
transition-duration: var(--speed-highlightFadeIn);

/* SVG icon inside button on hover */
fill transition-duration: var(--speed-highlightFadeIn);  /* faster in */
/* SVG icon default (non-hover) */
fill transition-duration: var(--speed-highlightFadeOut);  /* slower out */
```

The hover effect applies both on `:hover` and when `[data-menu-open="true"]` is set (keeps the highlight while dropdown is open).

### Button Disabled State

```css
cursor: default;
opacity: 0.6;
```

### Button Focus State

```css
outline: none;  /* focus-visible removes outline */
```

---

## Issue List / Table

### Table Layout

The issue list uses **CSS Grid** — not an HTML `<table>`. The outer container (`.ezxFuW`) is a single-column grid where each child is a full-width row.

```css
/* Outer list container */
display: grid;
grid-template-columns: 1fr;   /* single column, full-width rows */
grid-template-rows: 36px 44px 44px 44px 44px 44px 44px 44px 44px 44px 44px 44px 44px 308px;
                  /* ^group header  ^issue rows...                              ^spacer */
```

- **Group header row**: 36px tall
- **Issue row**: 44px tall
- The list container has 14 children: 1 group header + 12 issue rows + 1 spacer

### Issue Row Structure

Each issue row is an `<a>` tag (the full row is clickable) wrapping an inner grid `<div>` with **7 named grid columns**:

| Column       | Content Example          | Font Size | Font Weight | Color             |
|--------------|--------------------------|-----------|-------------|-------------------|
| `checkbox`   | (empty/checkbox)         | —         | —           | —                 |
| `priority`   | (priority icon)          | —         | —           | —                 |
| `identifier` | "PRO-1247", "TT-38"     | 13px      | 450         | rgb(91, 91, 93)   |
| `status`     | (status icon)            | —         | —           | —                 |
| `title`      | "Contact form not working" | 13px    | 500         | rgb(26, 26, 26)   |
| `created`    | (date/avatar info)       | varies    | varies      | varies            |
| (additional) | (assignee, labels, etc.) | varies    | varies      | varies            |

Key observations:
- **Identifier** uses muted color `rgb(91, 91, 93)` / `#5b5b5d` with semi-bold weight 450
- **Title** uses primary color `rgb(26, 26, 26)` / `#1a1a1a` with medium weight 500
- Both use 13px font size (not the body 16px)
- The grid uses **named column tracks** (`checkbox`, `priority`, `identifier`, `status`, `title`, `created`) for semantic column placement

### Issue Row Styling

```css
/* Issue row (A tag) */
display: grid;
grid-column: 1 / -1;      /* spans full width */
align-items: center;
height: 44px;
padding: 0px;
background: transparent;
color: rgb(26, 26, 26);
border: none;              /* 0px none — no visible row borders */
cursor: default;
text-decoration: none;     /* no underline on the link */
outline: none;             /* focus-visible override */
```

### Row Separation

Rows have **no visible borders** between them. Visual separation comes from:
- Whitespace/padding within each 44px row
- Group headers that break up the list
- Hover state background change provides visual row boundary on interaction

### Group Header (Section Divider)

```css
display: grid;
align-items: center;
height: 36px;
padding: 0px;
background: transparent;
color: rgb(26, 26, 26);
font-size: 16px;
font-weight: 400;
```

Group headers contain section names (e.g., "Other active") with a count badge ("19").

### Table Hover States

| State             | Background               | Hex       |
|-------------------|--------------------------|-----------|
| Default           | `transparent`            | —         |
| Row hover         | `rgba(0, 0, 0, 0.063)`  | ~6% black |
| Row active/press  | `rgb(239, 239, 239)`     | `#efefef` |
| Alt hover (light) | `rgb(245, 245, 245)`     | `#f5f5f5` |
| Alt hover (mid)   | `rgb(247, 247, 247)`     | `#f7f7f7` |
| Selected row      | `rgb(237, 237, 237)`     | `#ededed` |

All hover backgrounds observed in stylesheets:
- `rgba(0, 0, 0, 0.063)` — primary interactive hover
- `rgb(239, 239, 239)` — pressed/active
- `rgb(245, 245, 245)` — sidebar hover
- `rgb(247, 247, 247)` — light hover
- `rgb(237, 237, 237)` — selected state
- `transparent` — reset/clear hover

---

## Sidebar Navigation Items

```css
display: flex;
align-items: center;
border-radius: var(--control-border-radius, 4px);
height: 28px;
padding: 0px;
font-size: 13px;
font-weight: 450;
color: rgb(45, 46, 47);
background: transparent;
```

### Hover / Active States

| State   | Background         | Description                |
|---------|--------------------|----------------------------|
| Default | transparent        | No background              |
| Hover   | rgb(247, 247, 247) | `#f7f7f7` — subtle gray    |
| Active  | rgb(238, 238, 238) | `#eeeeee` — slightly darker|

The hover transition uses `var(--speed-highlightFadeIn)` for a fast, smooth appearance.

---

## Borders

| Pattern                              | Usage                    |
|--------------------------------------|--------------------------|
| `1px solid var(--bg-border-color)`   | Default dividers         |
| `1px solid var(--normal-border)`     | Input/control borders    |
| `1px solid var(--gray4)`             | Subtle separators        |

Active border color resolves to approximately `#dcdcdc`.
Hover border uses `var(--normal-border-hover)` and `var(--gray5)` for a slightly darker state.

---

## Border Radius

| Value                              | Usage                     |
|------------------------------------|---------------------------|
| `var(--control-border-radius)` 4px | Buttons, inputs, nav items|
| 6px                                | Cards, larger containers  |
| 8px                                | Modals, panels            |
| 50%                                | Avatars, circular icons   |

---

## Shadows

| Level      | Value                                                                |
|------------|----------------------------------------------------------------------|
| Elevation 1| `rgba(0, 0, 0, 0.1) 0px 4px 12px`                                   |
| Elevation 2| `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 1px` |

Shadows are very subtle and use low-opacity black. The double shadow on Elevation 2 combines a soft spread with a thin ring for depth + definition.

---

## Transitions

| Property | Duration | Easing       | Usage                    |
|----------|----------|--------------|--------------------------|
| opacity  | 0.1s     | ease         | Fast micro-interactions  |
| opacity  | 0.2s     | ease-out     | Standard fade-in/out     |
| opacity  | 0.8s     | ease-out     | Delayed entrance effects |
| fill     | 0.4s     | ease         | Icon color transitions   |

Hover highlight uses a CSS variable `--speed-highlightFadeIn` for consistent timing across all interactive elements.

---

## CSS Custom Properties (referenced in stylesheets)

### Backgrounds & Colors
`--bg-color`, `--bg-sidebar-color`, `--bg-base-color`, `--bg-border-color`, `--content-color-light`, `--content-highlight-color-light`

### Interactive States
`--normal-bg`, `--normal-border`, `--normal-border-hover`, `--normal-text`, `--speed-highlightFadeIn`

### Sizing
`--sidebar-width` (244px), `--scrollbar-width` (12px), `--control-border-radius` (4px), `--border-radius`

### Sonner Toast Variables
`--gray2`, `--gray4`, `--gray5`, `--normal-border-hover`

---

## General Design Principles (observed)

1. **Minimal and clean**: Very few visible borders; separation is achieved through background color contrast and whitespace.
2. **Subtle interactivity**: Hover states use near-transparent overlays (`rgba(0, 0, 0, 0.063)`) rather than bold color changes.
3. **Consistent rounding**: 4px radius is the default for all controls; larger radii reserved for containers.
4. **Light shadows**: Shadows are used sparingly with very low opacity for a flat-but-layered feel.
5. **Fast transitions**: Hover and focus transitions are quick (0.1s-0.2s) for a responsive feel.
6. **Neutral palette with purple accent**: The UI is predominantly grayscale with purple/blue accents (`#7180ff`) for selections and primary actions.
7. **Inter Variable font**: Uses the variable-weight version of Inter allowing smooth font-weight variations (e.g., 450 for semi-light nav items).
8. **Compact density**: Nav items and buttons are 28px tall with tight padding for information-dense layouts.
