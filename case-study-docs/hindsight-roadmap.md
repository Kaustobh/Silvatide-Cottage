# 🔮 Hindsight & Architectural Roadmap

## What I Learned
Bridging the gap between Figma and code on this project highlighted the immense value of strict component systems. Because I established the spacing rules (the 8px grid) early during the Figma wireframing phase, the CSS translation was remarkably smooth. It proved that a UX Engineer's value lies in designing with the DOM in mind.

## What I Would Do Differently
If I were to rebuild this project from scratch:
- **Image Optimization Pipeline:** Currently, the site relies on high-resolution static PNGs. I would integrate Astro's native `<Image />` component to automatically convert these assets to `.webp` and serve highly-optimized responsive srcset sizes.
- **CSS Preprocessor/Tailwind:** While Vanilla CSS variables worked perfectly for this scale, adopting Tailwind CSS or SCSS would speed up the enforcement of the 8px spatial grid across deeper component trees.

## Next Steps / Roadmap
1. **Interactive Booking Flow:** Design and develop the interactive booking/calendar flow, focusing heavily on form accessibility, date-picker UX, and keyboard navigation.
2. **CMS Integration:** Connect the Gallery and Features components to a headless CMS (like Sanity or Contentful) so property managers can update imagery without touching the codebase.
