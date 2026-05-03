# Linguist Design System

## Brand Vibe
**Sophisticated, Academic, Timeless, yet Modern.**
Linguist is a tool for exploring the roots of language. The design should feel like a bridge between ancient manuscripts and modern digital interfaces. It uses clean typography, ample whitespace, and a refined color palette.

## Color Palette
Using CSS Variables:
- `--primary-color`: `#1a237e` (Indigo 900 - Deep, scholarly blue)
- `--accent-color`: `#b8860b` (Dark Goldenrod - Hint of parchment/gold)
- `--bg-color`: `#fdfdfb` (Off-white/Parchment - Easier on the eyes for reading)
- `--surface-color`: `#ffffff` (Pure white for cards/modals)
- `--text-primary`: `#2c3e50` (Dark slate for readability)
- `--text-secondary`: `#546e7a` (Muted blue-grey for secondary info)
- `--border-color`: `#e0e0e0` (Light grey for subtle separation)
- `--error-color`: `#c62828` (Deep red)
- `--success-color`: `#2e7d32` (Deep green)

## Typography
- **Headings:** `Pridi`, serif (Weight: 500, 700) - For a distinguished, classic look.
- **Body:** `Roboto`, sans-serif (Weight: 300, 400) - For clear, modern readability.
- **Code/Etymology Roots:** `monospace` - For technical linguistic details.

## Layout & Spacing
- **Max Width:** `900px` for optimal reading line length.
- **Spacing Scale:** 4px base (4, 8, 16, 24, 32, 48, 64).
- **Border Radius:** `8px` for a soft, approachable feel.
- **Shadows:** Subtle elevation (`0 2px 10px rgba(0,0,0,0.05)`) to maintain the "flat-ish" academic feel.

## Components

### Header
- Minimalist.
- Clear branding with "Linguist" in Pridi.
- Subtle navigation links.

### Search Bar
- Centered and prominent on the home page.
- Clear focus state with accent color border.

### History Breadcrumbs
- Horizontal sequence showing the path of exploration.
- Arrow separators.
- Interactive, allowing users to jump back.

### Etymology Card
- Clean white background.
- Strong heading for the word.
- Clickable words within the etymology text are highlighted with the primary color and a subtle underline.
