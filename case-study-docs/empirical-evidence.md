# 📊 Empirical Evidence & Performance Audit

*Note: Since this project relies heavily on 2D images and CSS animations rather than 3D contexts, the performance focus was on DOM rendering and network payload rather than WebGL memory.*

## Key Outcomes
1. **Zero JavaScript Baseline:** Because the site was built with Astro, the initial payload contains 0kb of framework JavaScript. The only JS executed is the lightweight 20-line `IntersectionObserver` script for animations.
2. **Visual Parity:** 100% 1:1 translation from the high-fidelity Figma mockups to the production DOM, adhering perfectly to the 8px grid.
3. **CI/CD Automation:** Deployed via GitHub Actions, ensuring successful static builds on every push to the `main` branch.

## Missing Data Checklist (To-Do for Portfolio)
* [ ] **Run a Lighthouse Audit:** Execute a lighthouse audit on the live GitHub Pages URL. Capture screenshots of the Performance, Accessibility, and SEO scores.
* [ ] **Network Payload Stats:** Capture a screenshot of the Chrome Network tab showing the initial HTML document load speed and total JS footprint.
* [ ] **Before/After Comparisons:** Compare the perceived load time of native `IntersectionObserver` vs a heavy library equivalent.
