# App Design Reference — Forest Green (Linear-Inspired)

Design tokens and styles for a minimal, clean application interface. Inspired by Linear's information-dense layout and restrained aesthetic, but with a warmer color temperature and subdued forest green accents instead of blue/purple.

---

## Layout

| Region   | Width  | Height |
|----------|--------|--------|
| Viewport | 1237px | 707px  |
| Sidebar  | 240px  | 707px  |
| Main     | 997px  | 690px  |

- Sidebar width is set via `--sidebar-width: 240px`
- Main content fills the remaining width
- Sidebar separation is achieved through background color contrast, not a visible border

---

## Typography

**Font Stack:**
```
"Inter Variable", "SF Pro Display", -apple-system, "system-ui", "Segoe UI", Roboto, sans-serif
```

**Scale:**

| Use Case              | Size   | Weight | Color              |
|-----------------------|--------|--------|--------------------|
| Body base             | 16px   | 400    | rgb(38, 35, 30)    |
| Workspace/org name    | 14px   | 600    | rgb(50, 46, 40)    |
| Sidebar nav items     | 13px   | 450    | rgb(55, 52, 46)    |
| Button labels         | 13px   | 400    | rgb(55, 52, 46)    |
| Small labels/metadata | 12px   | 400    | rgb(105, 100, 90)  |
| Tiny/badges           | 11px   | 400    | varies             |

**Text Colors:**

| Role           | Value              | Hex       |
|----------------|--------------------|-----------|
| Primary        | rgb(38, 35, 30)    | `#26231e` |
| Secondary      | rgb(55, 52, 46)    | `#37342e` |
| Muted/tertiary | rgb(105, 100, 90)  | `#69645a` |
| Disabled/hint  | rgb(170, 165, 155) | `#aaa59b` |
| On-dark/inverse| rgb(255, 255, 255) | `#ffffff` |

---

## Color Palette

### Light Theme

| Token                            | Value     | Usage                |
|----------------------------------|-----------|----------------------|
| `--bg-sidebar-color`             | `#f0eeea` | Sidebar background   |
| `--bg-base-color`                | `#faf9f7` | Main content bg      |
| `--bg-border-color`              | `#ddd9d3` | Default borders      |
| `--bg-border-color-light`        | `#e3dfda` | Slightly lighter borders |
| `--content-color-light`          | `#aaa59b` | Muted content/icons  |
| `--content-highlight-color-light`| `#26231e` | Emphasized content   |

### Dark Theme

| Token                            | Value     |
|----------------------------------|-----------|
| `--bg-sidebar-dark`              | `#111210` |
| `--bg-base-color-dark`           | `#171816` |
| `--bg-border-color-dark`         | `#2a2c28` |
| `--content-color-dark`           | `#7a7d75` |
| `--content-highlight-color-dark` | `#f5f4f2` |

### Accent / Brand Colors

| Value              | Hex       | Usage                        |
|--------------------|-----------|------------------------------|
| rgb(77, 124, 94)   | `#4d7c5e` | Primary accent, selection    |
| rgb(90, 143, 106)  | `#5a8f6a` | Lighter action variant       |
| rgb(62, 105, 78)   | `#3e694e` | Darker/pressed variant       |
| rgb(107, 143, 122) | `#6b8f7a` | Muted/subtle accent          |

---

## Buttons

### Base Button Style

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
padding: 0px 8px 0px 6px;

/* Sizing */
height: 28px;

/* Typography */
font-weight: 400;
font-size: 13px;
line-height: normal;

/* Appearance */
background: transparent;
color: rgb(55, 52, 46);
border-width: 1px;
border-style: solid;
border-color: transparent;
border-radius: 5px;
cursor: pointer;

/* Transitions */
transition: background-color 0.15s ease, color 0.15s ease;
```

### Button Variants

| Variant         | Background           | Text Color          | Size       | Padding          | Notes                     |
|-----------------|----------------------|---------------------|------------|------------------|---------------------------|
| Ghost (default) | `transparent`        | rgb(55, 52, 46)     | auto×28    | 0px 8px 0px 6px  | Sidebar/toolbar buttons   |
| Surface         | rgb(250, 249, 247)   | rgb(55, 52, 46)     | varies     | varies           | Elevated actions          |
| Accent/Primary  | rgb(77, 124, 94)     | rgb(255, 255, 255)  | varies     | varies           | Primary CTA               |
| Text-only       | `transparent`        | rgb(38, 35, 30)     | auto×24    | 0px 4px          | Section headers           |
| Icon-only       | `transparent`        | rgb(55, 52, 46)     | 28×28      | 0px              | Toolbar icons             |

### Button Hover State

```css
/* Ghost button hover */
background-color: rgba(50, 45, 35, 0.06);  /* warm 6% overlay */
color: rgb(38, 35, 30);                     /* text shifts to primary */
transition-duration: 0.1s;

/* Accent/Primary button hover */
background-color: rgb(62, 105, 78);         /* darker forest green */
```

### Button Disabled State

```css
cursor: default;
opacity: 0.5;
```

### Button Focus State

```css
outline: 2px solid rgba(77, 124, 94, 0.4);
outline-offset: 1px;
```

---

## Data Table / List

### Table Layout

The data list uses **CSS Grid** — not an HTML `<table>`. The outer container is a single-column grid where each child is a full-width row.

```css
/* Outer list container */
display: grid;
grid-template-columns: 1fr;
grid-template-rows: 36px repeat(auto-fill, 44px);
```

- **Group header row**: 36px tall
- **Data row**: 44px tall

### Row Structure

Each row is clickable and uses an inner grid with named columns appropriate to the data being displayed:

| Column       | Font Size | Font Weight | Color             |
|--------------|-----------|-------------|-------------------|
| Identifier   | 13px      | 450         | rgb(100, 96, 88)  |
| Status       | —         | —           | (icon color)      |
| Title/Name   | 13px      | 500         | rgb(38, 35, 30)   |
| Metadata     | 12px      | 400         | rgb(105, 100, 90) |

### Row Styling

```css
/* Data row */
display: grid;
grid-column: 1 / -1;
align-items: center;
height: 44px;
padding: 0px;
background: transparent;
color: rgb(38, 35, 30);
border: none;
cursor: default;
text-decoration: none;
outline: none;
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
color: rgb(38, 35, 30);
font-size: 14px;
font-weight: 500;
```

### Table Hover States

| State             | Background               | Hex / Value         |
|-------------------|--------------------------|---------------------|
| Default           | `transparent`            | —                   |
| Row hover         | `rgba(50, 45, 35, 0.05)` | ~5% warm black     |
| Row active/press  | `rgb(234, 231, 226)`     | `#eae7e2`          |
| Alt hover (light) | `rgb(242, 240, 236)`     | `#f2f0ec`          |
| Selected row      | `rgb(230, 237, 232)`     | `#e6ede8`          |

Selected row uses a very faint green tint to reinforce the accent color without being loud.

---

## Sidebar Navigation Items

```css
display: flex;
align-items: center;
border-radius: 4px;
height: 28px;
padding: 0px 8px;
font-size: 13px;
font-weight: 450;
color: rgb(55, 52, 46);
background: transparent;
```

### Hover / Active States

| State   | Background           | Description                  |
|---------|----------------------|------------------------------|
| Default | transparent          | No background                |
| Hover   | rgb(235, 233, 228)   | `#ebe9e4` — warm subtle gray |
| Active  | rgb(226, 224, 218)   | `#e2e0da` — slightly deeper  |

### Active Nav Item (current page)

```css
background: rgb(226, 234, 229);  /* very faint green tint */
color: rgb(38, 35, 30);
font-weight: 500;
```

---

## Borders

| Pattern                              | Usage                    |
|--------------------------------------|--------------------------|
| `1px solid var(--bg-border-color)`   | Default dividers         |
| `1px solid var(--normal-border)`     | Input/control borders    |

Active border color resolves to approximately `#ddd9d3` — a warm gray rather than cool.
Hover border darkens to approximately `#c5c0b8`.

---

## Border Radius

| Value | Usage                     |
|-------|---------------------------|
| 4px   | Buttons, inputs, nav items|
| 6px   | Cards, larger containers  |
| 8px   | Modals, panels            |
| 50%   | Avatars, circular icons   |

---

## Shadows

| Level      | Value                                                                    |
|------------|--------------------------------------------------------------------------|
| Elevation 1| `rgba(40, 35, 25, 0.08) 0px 4px 12px`                                   |
| Elevation 2| `rgba(40, 35, 25, 0.08) 0px 4px 12px, rgba(40, 35, 25, 0.15) 0px 0px 0px 1px` |

Shadows use a warm-tinted black rather than pure black, keeping the overall palette cohesive.

---

## Transitions

| Property         | Duration | Easing   | Usage                    |
|------------------|----------|----------|--------------------------|
| background-color | 0.1s     | ease     | Fast hover interactions  |
| opacity          | 0.2s     | ease-out | Standard fade-in/out     |
| color            | 0.15s    | ease     | Text color shifts        |
| fill             | 0.4s     | ease     | Icon color transitions   |

---

## CSS Custom Properties

### Backgrounds & Colors
`--bg-color`, `--bg-sidebar-color`, `--bg-base-color`, `--bg-border-color`, `--content-color-light`, `--content-highlight-color-light`

### Interactive States
`--normal-bg`, `--normal-border`, `--normal-border-hover`, `--normal-text`

### Accent
`--accent-primary: #4d7c5e`, `--accent-light: #5a8f6a`, `--accent-dark: #3e694e`, `--accent-muted: #6b8f7a`, `--accent-subtle-bg: #e6ede8`

### Sizing
`--sidebar-width` (240px), `--scrollbar-width` (12px), `--control-border-radius` (4px)

---

## Status Colors

For data-driven UIs that need status indicators (e.g., pipeline stages, priority levels):

| Status     | Color     | Hex       | Notes                     |
|------------|-----------|-----------|---------------------------|
| Success    | Forest    | `#4d7c5e` | Matches primary accent    |
| Warning    | Amber     | `#b08a3e` | Warm gold, not bright yellow |
| Error      | Brick     | `#b05050` | Muted red, not alarming   |
| Info       | Slate     | `#5a7a8a` | Cool blue-gray            |
| Neutral    | Stone     | `#8a8580` | Warm gray                 |

All status colors are desaturated to fit the subdued palette. Avoid pure/vivid hues.

---

## General Design Principles

1. **Minimal and clean**: Very few visible borders; separation is achieved through background color contrast and whitespace.
2. **Warm neutrals**: All grays are warm-shifted (slight brown/yellow undertone) rather than cool or pure. This gives the UI an approachable, earthy feel without sacrificing professionalism.
3. **Subdued forest green accent**: The accent color `#4d7c5e` is muted and natural — it should feel like a walk through a pine forest, not a traffic light. Use it sparingly for selections, primary actions, and active states.
4. **Subtle interactivity**: Hover states use near-transparent warm overlays (`rgba(50, 45, 35, 0.06)`) rather than bold color changes.
5. **Consistent rounding**: 4px radius is the default for all controls; larger radii reserved for containers.
6. **Light shadows**: Shadows are used sparingly with warm-tinted low-opacity values for a flat-but-layered feel.
7. **Fast transitions**: Hover and focus transitions are quick (0.1s–0.15s) for a responsive feel.
8. **Inter Variable font**: Uses the variable-weight version of Inter allowing smooth font-weight variations (e.g., 450 for semi-light nav items).
9. **Compact density**: Nav items and buttons are 28px tall with tight padding for information-dense layouts.
10. **Green as a highlight, not a flood**: The forest green should appear in focused moments — active nav items, primary buttons, selected rows, focus rings — not as large background fills. The UI should read as warm gray with green punctuation.
