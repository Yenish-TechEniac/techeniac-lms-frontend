# Techeniac LMS - Design System & UI Specifications

This document defines the official design tokens, typography scale, color palette, and component specifications extracted directly from the Techeniac LMS Figma design system. All AI agents, contributors, and UI components in this workspace must strictly adhere to these specifications to guarantee visual consistency.

---

## 1. Design System Overview & Core Principles

- **Primary Font Family**: `'Plus Jakarta Sans', sans-serif`
- **Corner Radii for Interactive Buttons**: `32px` (Pill / fully rounded buttons)
- **Primary Brand Theme**: Electric Cobalt Blue (`#0044D3`)
- **Default Dark Text**: Charcoal Dark `#323232` (Display/Headings) and Midnight Slate `#111827` (Body)
- **Default Light Surface**: `#FFFFFF` (Pure White) and `#F6F8FC` (Soft Background Surface)
- **Component Consistency**: Never create ad-hoc inline styles or divergent button heights/paddings. All buttons and typography must map directly to the tokens specified herein.

---

## 2. Color Palette Tokens

### 2.1 Primary Brand Color

| Token Name                | Hex Code  | RGB               | Role / Usage                                                                 |
| :------------------------ | :-------- | :---------------- | :--------------------------------------------------------------------------- |
| `color-brand` / `primary` | `#0044D3` | `rgb(0, 68, 211)` | Primary buttons, active states, key CTAs, link highlights, and brand accents |

### 2.2 Basic & Neutral Foundation

| Token Name          | Hex Code  | RGB                  | Figma Role / Usage                                                      |
| :------------------ | :-------- | :------------------- | :---------------------------------------------------------------------- |
| `basic-dark`        | `#111827` | `rgb(17, 24, 39)`    | Deep dark neutral / high-contrast headings, main card headers           |
| `basic-gray-medium` | `#667085` | `rgb(102, 112, 133)` | Secondary text, inactive tab labels, metadata, secondary icons          |
| `basic-gray-border` | `#E1E6EC` | `rgb(225, 230, 236)` | Structural card borders, dividers, subtle table separators              |
| `basic-gray-light`  | `#F6F8FC` | `rgb(246, 248, 252)` | App canvas background, subtle table alternating rows, card hover states |
| `basic-white`       | `#FFFFFF` | `rgb(255, 255, 255)` | Surface containers, card backgrounds, modal shells, inverse text        |

### 2.3 Grayscale & Utility Colors

| Token Name      | Hex Code                | RGB                  | Usage                                                           |
| :-------------- | :---------------------- | :------------------- | :-------------------------------------------------------------- |
| `header-dark`   | `#33353B`               | `rgb(51, 53, 59)`    | Showcase and documentation header background                    |
| `text-dark`     | `#323232`               | `rgb(50, 50, 50)`    | Primary swatch labels, typography sample text, dominant UI text |
| `text-muted`    | `#969696`               | `rgb(150, 150, 150)` | Hex values, secondary metadata labels, timestamps               |
| `divider-light` | `#D8D8D8`               | `rgb(216, 216, 216)` | Section divider lines (1px), prefix markers (`#`)               |
| `border-light`  | `#F4F4F4`               | `rgb(244, 244, 244)` | Swatch container border (1px), subtle input outlines            |
| `shadow-swatch` | `rgba(51, 51, 51, 0.1)` | —                    | Swatch card drop shadow: `0px 1px 3px rgba(51, 51, 51, 0.1)`    |

### 2.4 Semantic Status Colors

| Semantic Role          | Token Name         | Hex Code  | RGB                 | Usage                                                             |
| :--------------------- | :----------------- | :-------- | :------------------ | :---------------------------------------------------------------- |
| **Success**            | `semantic-success` | `#12B76A` | `rgb(18, 183, 106)` | Completed status, success banners, active tags, positive metrics  |
| **Info / Secondary**   | `semantic-info`    | `#2E90FA` | `rgb(46, 144, 250)` | Informational callouts, active course badges, helper notes        |
| **Warning**            | `semantic-warning` | `#F79009` | `rgb(247, 144, 9)`  | Pending actions, deadline alerts, warning toasts                  |
| **Danger / Error**     | `semantic-danger`  | `#D92D20` | `rgb(217, 45, 32)`  | Destructive actions, validation error text, failure notifications |
| **Accent / Attention** | `semantic-accent`  | `#F2C75C` | `rgb(242, 199, 92)` | Highlight badges, star ratings, review tags, attention callouts   |

---

## 3. Typography Scale & Specifications

- **Font Family**: `'Plus Jakarta Sans', sans-serif`
- **Supported Weights**:
  - `Regular` (`font-weight: 400`)
  - `Medium` (`font-weight: 500` - Button labels & interactive badges)
  - `Bold` (`font-weight: 700`)

### 3.1 Regular Typography Scale (`font-weight: 400`)

| Style Level         | Font Size         | Line Height       | Ratio | Recommended HTML Tag | Tailwind Class Equivalent                | Typical Use Case                         |
| :------------------ | :---------------- | :---------------- | :---- | :------------------- | :--------------------------------------- | :--------------------------------------- |
| **Display Hero**    | `72px` (4.5rem)   | `80px` (5.0rem)   | 111%  | `<h1>` (hero)        | `text-[72px] leading-[80px] font-normal` | Marketing hero headers, large banners    |
| **Heading 1**       | `56px` (3.5rem)   | `64px` (4.0rem)   | 114%  | `<h1>`               | `text-[56px] leading-[64px] font-normal` | Main page titles                         |
| **Heading 2**       | `48px` (3.0rem)   | `56px` (3.5rem)   | 117%  | `<h2>`               | `text-[48px] leading-[56px] font-normal` | Major section headers                    |
| **Heading 3**       | `40px` (2.5rem)   | `48px` (3.0rem)   | 120%  | `<h3>`               | `text-[40px] leading-[48px] font-normal` | Subsection headers                       |
| **Heading 4**       | `30px` (1.875rem) | `40px` (2.5rem)   | 133%  | `<h4>`               | `text-[30px] leading-[40px] font-normal` | Modal titles, card headers               |
| **Subheading**      | `20px` (1.25rem)  | `28px` (1.75rem)  | 140%  | `<h5>` / `<p>`       | `text-[20px] leading-[28px] font-normal` | Lead paragraphs, featured blurbs         |
| **Body Large**      | `16px` (1.0rem)   | `24px` (1.5rem)   | 150%  | `<p>`                | `text-base leading-6 font-normal`        | Primary body text, article content       |
| **Body Default**    | `14px` (0.875rem) | `22px` (1.375rem) | 157%  | `<p>` / `<span>`     | `text-sm leading-[22px] font-normal`     | Form inputs, table cells, secondary text |
| **Caption / Small** | `12px` (0.75rem)  | `20px` (1.25rem)  | 167%  | `<small>` / `<span>` | `text-xs leading-5 font-normal`          | Helper text, error messages, metadata    |

### 3.2 Bold Typography Scale (`font-weight: 700`)

| Style Level         | Font Size         | Line Height       | Ratio | Recommended HTML Tag | Tailwind Class Equivalent              | Typical Use Case                      |
| :------------------ | :---------------- | :---------------- | :---- | :------------------- | :------------------------------------- | :------------------------------------ |
| **Display Hero**    | `72px` (4.5rem)   | `80px` (5.0rem)   | 111%  | `<h1>`               | `text-[72px] leading-[80px] font-bold` | High-impact headlines                 |
| **Heading 1**       | `56px` (3.5rem)   | `64px` (4.0rem)   | 114%  | `<h1>`               | `text-[56px] leading-[64px] font-bold` | Primary dashboard views               |
| **Heading 2**       | `48px` (3.0rem)   | `56px` (3.5rem)   | 117%  | `<h2>`               | `text-[48px] leading-[56px] font-bold` | Main content groupings                |
| **Heading 3**       | `40px` (2.5rem)   | `48px` (3.0rem)   | 120%  | `<h3>`               | `text-[40px] leading-[48px] font-bold` | Metric overviews, large card titles   |
| **Heading 4**       | `32px` (2.0rem)   | `40px` (2.5rem)   | 125%  | `<h4>`               | `text-2xl leading-10 font-bold`        | Dialog headers, section titles        |
| **Heading 5**       | `24px` (1.5rem)   | `32px` (2.0rem)   | 133%  | `<h5>`               | `text-xl leading-8 font-bold`          | Card titles, drawer headers           |
| **Subheading**      | `20px` (1.25rem)  | `28px` (1.75rem)  | 140%  | `<h6>`               | `text-lg leading-7 font-bold`          | Subsection titles, list headers       |
| **Body Bold**       | `16px` (1.0rem)   | `24px` (1.5rem)   | 150%  | `<strong>` / `<p>`   | `text-base leading-6 font-bold`        | Emphasized text, table column headers |
| **Body Small Bold** | `14px` (0.875rem) | `22px` (1.375rem) | 157%  | `<span>`             | `text-sm leading-[22px] font-bold`     | Swatch labels, badge text             |
| **Caption Bold**    | `12px` (0.75rem)  | `20px` (1.25rem)  | 167%  | `<small>`            | `text-xs leading-5 font-bold`          | Micro-badges, status indicators       |

---

## 4. Button System Specification

Buttons in the Techeniac LMS design system have a consistent pill shape with a `border-radius: 32px`. Button text is set in `'Plus Jakarta Sans'` with `font-weight: 500` (Medium).

### 4.1 Button Variants

#### Primary Button (Filled)

- **Background**: `#0044D3`
- **Text Color**: `#FFFFFF`
- **Border**: None
- **Border Radius**: `32px` (`rounded-full`)
- **Hover State**: `#0036AB`
- **Active State**: `#002B88`

#### Secondary Button (Outline)

- **Background**: `#FFFFFF`
- **Text Color**: `#0044D3`
- **Border**: `1px solid #0044D3`
- **Border Radius**: `32px` (`rounded-full`)
- **Hover State**: `#F6F8FC` with `#0036AB` border and text

---

### 4.2 Button Size Matrix

| Size Variant    | Target Height | Horizontal Padding | Font Size | Font Weight | Tailwind Specification (Implemented in `Button.tsx`) |
| :-------------- | :------------ | :----------------- | :-------- | :---------- | :--------------------------------------------------- |
| **LG (Large)**  | `48px`        | `28px`             | `16px`    | 600 (Semi)  | `h-12 px-7 text-base rounded-full`                   |
| **MD (Medium)** | `44px`        | `20px`             | `14px`    | 600 (Semi)  | `h-11 px-5 text-sm rounded-full`                     |
| **SM (Small)**  | `36px`        | `16px`             | `12px`    | 600 (Semi)  | `h-9 px-4 text-xs rounded-full`                      |

---

## 5. Implementation Rules for Developers & AI Agents

1. **Mandatory Token Usage**: Always use standard color tokens (`#0044D3` for brand actions, `#111827` / `#323232` for primary text, `#F6F8FC` for surface tints). Never introduce arbitrary ad-hoc hex values.
2. **Pill-Shaped Buttons**: When implementing buttons or interactive chips adhering to this system, ensure `rounded-full` (`rounded-[32px]`) is respected.
3. **Typography Primitives**: Use `<Typography>` or semantic exports (`H1`, `H2`, `H3`, `H4`, `P`, `Span`) from `@/components/ui/Typography`.
4. **Button Primitive**: Use `<Button>` from `@/components/ui/Button` configured with matching variant (`primary`, `outline`) and size (`sm`, `md`, `lg`, `xl`).
5. **No Style Drift in Chat/Prompts**: Any subsequent prompt or feature implementation should reference this document directly to maintain 100% design fidelity.
