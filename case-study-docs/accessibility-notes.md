# ♿ Interaction Safety & Accessibility Notes

Building a visually complex site often tempts developers to sacrifice accessibility. For Silvatide Cottage, I made strict architectural choices to prevent this.

## 1. Preserving Semantic HTML in Complex Layouts
To achieve the layered "SILVA" text in the hero section, the standard approach in luxury design is exporting a flattened PNG from Figma. I rejected this. 
By utilizing CSS `clip-path` masks and precise `z-index` layering, the text remains an actual `<h1>` tag in the DOM. This ensures that:
- Screen readers can parse the site's primary heading.
- Search engine crawlers can index the site title.
- The text is selectable by the user.

## 2. Motion Sensitivity
The scroll-triggered animations (fade-up and translation) are kept subtle (20px movement) and slow. 
*Note for Roadmap: Implement a `prefers-reduced-motion` media query to disable the `IntersectionObserver` transforms for users with vestibular disorders.*

## 3. ARIA & Keyboard Navigation
- All interactive elements (menu buttons, gallery arrows) utilize native `<button>` tags rather than `<div>` with click handlers.
- Appropriate `aria-label` tags (e.g., `aria-label="Next image"`) were added to SVG-only buttons to ensure they are announced correctly by VoiceOver and NVDA.
