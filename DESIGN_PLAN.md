# Words Component Click Experience Design

## 1. Visual Feedback: The "Pulse of Knowledge"
- **Interaction**: Clicking a word triggers a ripple effect radiating from the point of contact.
- **State Change**: The clicked word transitions to `--accent-color` and gains a soft glow.
- **Motion**: The word slightly expands and contracts, as if "breathing" while loading its history.

## 2. Sprouting: The "Root System"
- **Visual**: When new related words appear, they don't just pop in. They "sprout" from the parent word.
- **Connections**: Thin, organic-looking SVG lines (roots) connect the parent word to its linguistic descendants.
- **Animation**: The lines draw themselves (stroke-dasharray animation) from the parent to the child word.

## 3. Knowledge Fragments: "Wisdom at a Glance"
- **Overlay**: An elegant, semi-transparent card (parchment style) appears near the clicked word.
- **Content**:
    - The word itself in `Pridi` font.
    - A concise etymological snippet.
    - A "Deep Dive" button that navigates to the full etymology page.
- **Blur**: The background slightly blurs to focus the user's attention on the discovery.

## 4. Mesmerising Motion
- **Physics**: Words have a gentle "underwater" floating animation.
- **Repulsion**: When a new word sprouts, it pushes nearby words away slightly to make room, creating a dynamic, living ecosystem.
- **Stagger**: The appearance of child words is staggered to create a rhythmic "unfolding" effect.

## 5. Implementation Strategy
- **SVG Layer**: Use a full-screen SVG overlay behind the words but above the background text for the connections.
- **Motion Library**: Leverage `motion` (Framer Motion core) for complex orchestrations.
- **Angular Signals**: Track `selectedWord`, `connections`, and `loadingState` to drive the UI.
