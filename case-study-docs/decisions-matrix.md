# ⚖️ Architectural & UX Decisions Matrix

| Decision | Alternatives Considered | Trade-off / Rationale |
|----------|-------------------------|-----------------------|
| **Astro Framework** | React / Next.js SPA | **Rationale:** Astro’s "Islands Architecture" ships zero JavaScript by default. Since this is a top-of-funnel landing page, SEO and load speed are paramount. <br> **Trade-off:** Sacrificed robust global state management for raw initial load performance. |
| **CSS `clip-path` for Text Masking** | Flattening Hero into a `.png` | **Rationale:** Flattening the image destroys SEO and screen-reader accessibility. Using `clip-path` keeps the "SILVA" text as live, selectable DOM elements. <br> **Trade-off:** Required precision coding for responsive edge-cases across mobile breakpoints. |
| **Native IntersectionObserver** | GSAP / Framer Motion | **Rationale:** Animation libraries add 30kb+ of JS bloat. A lightweight native observer achieves the exact same premium "fade-up" feel. <br> **Trade-off:** Took slightly more manual configuration to set stagger delays using CSS vars instead of timeline arrays. |
| **Strict 400px Text Wrap limit** | Fluid `%` widths | **Rationale:** Maintained the luxury editorial feel by strictly limiting line length for optimal eye-tracking. <br> **Trade-off:** Required careful manual centering and padding adjustments on mobile viewports to prevent awkward wrapping. |
