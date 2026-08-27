# 📐 Component Specifications & Inventory

This section details the custom components built for Silvatide Cottage. Astro’s component-based architecture allowed for clean separation of concerns while keeping the output as static HTML.

## Component Inventory

1. **`MainHero.astro`**
   - **Purpose:** High-impact visual entry point.
   - **Key Features:** CSS `clip-path` text masking, z-index layering of background/foreground imagery, gradient overlay for text readability.
   - **Props/Data:** Dynamic background image URL parsing (`import.meta.env.BASE_URL`).

2. **`Gallery.astro`**
   - **Purpose:** Showcase property interiors and exteriors.
   - **Key Features:** Infinite horizontal scrolling marquee using pure CSS `@keyframes`. Duplicated DOM nodes to create a seamless looping illusion.

3. **`Features.astro`**
   - **Purpose:** Highlight amenities and space layout.
   - **Key Features:** Complex masonry layout that gracefully collapses into a single column on mobile. Constrained 400px text blocks.

4. **`Architecture.astro` & `FooterHero.astro`**
   - **Purpose:** Deepen the narrative and provide final call-to-action elements.
   - **Key Features:** Cohesive padding (`--space-12`), IntersectionObserver fade-up triggers.
