## Key Decisions & Trade-offs

### 1. Choosing Astro over React/Next.js
**The Decision:** I elected to build the frontend using the Astro framework rather than a heavy SPA library like React.
**The "Why":** Astro’s "Islands Architecture" ships zero JavaScript to the client by default. For a landing page aimed at driving conversions, load speed is paramount.
**The Trade-off:** I sacrificed the robust global state management of React, but since this is a top-of-funnel landing page without complex user-session states, the massive performance gain was well worth the architectural pivot.

### 2. CSS Clip-Path Layering vs. Flattened Images
**The Decision:** In the Hero section, I used a custom CSS `clip-path` mask to sandwich the massive text gradient between the foreground cabin and background trees.
**The "Why":** The easy route would be exporting the entire hero section from Figma as a single `.png` or `.webp`. However, doing so destroys SEO (search engines can't read the text) and hurts accessibility (screen readers can't parse it). By using CSS `clip-path` and `z-index` layering, the "SILVA" text remains live, selectable HTML text.

### 3. Native IntersectionObserver vs. GSAP
**The Decision:** I built the scroll fade-up animations and the infinitely rotating gallery using Vanilla JavaScript (IntersectionObserver API) and pure CSS `@keyframes`.
**The "Why":** Animation libraries like GSAP or Framer Motion add 30kb+ of JavaScript to the bundle. By writing a lightweight native observer, I achieved the exact same premium "feel" at a fraction of the performance cost.
