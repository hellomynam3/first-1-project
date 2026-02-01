# Stock AI Master V2 - Apple Style Redesign

## Overview
A complete visual overhaul aiming for the "Apple Aesthetic": minimalist, clean, intuitive, and premium. The interface will prioritize content visibility through generous whitespace, clear typography, and subtle frosted glass (blur) effects.

## Design Principles
- **Minimalism**: Remove unnecessary borders, heavy gradients, and dense information.
- **Typography**: Use large, bold headings and legible body text (Inter/San Francisco style).
- **Color Palette**:
  - **Background**: Off-white / Light Gray (`#f5f5f7` - Apple's signature background).
  - **Cards**: White with soft, diffused shadows.
  - **Accents**: Restrained use of color. Soft Blue for actions, precise Red/Green for stock changes but less neon/jarring.
- **Glassmorphism**: Sidebar and floating headers will use `backdrop-filter: blur()`.
- **Rounded Corners**: Smooth, large border-radius (e.g., 16px - 24px).

## UI Structure Changes

### 1. Sidebar
- **Appearance**: Translucent glass effect, blending into the background.
- **Navigation**: Simple, pill-shaped hover states. Icons + Text only.
- **Watchlist**: Clean list items, less boxy.

### 2. Dashboard (Home)
- **Hero Section**: A large, greeting-style header.
- **Indices**: Horizontal scrolling cards or a clean grid with minimal text.
- **Trending**: Larger cards with logos (placeholders) and clear price action.

### 3. Deep Analysis (Detail View)
- **Header**: Massive ticker symbol and price. Very clean.
- **Tabs**: Segmented Control style (pill-shaped toggle) rather than traditional tabs.
- **Charts**: Minimalist grid lines, smooth curves, soft gradient fills.
- **Cards**: "Bento Box" grid layout for Financials and News. Clean white boxes.

## Technical Updates
- **CSS**: Reset to a light theme base. extensive use of `rgba` for transparency.
- **Charts**: Update ApexCharts config for light mode (dark text, lighter grid lines).
