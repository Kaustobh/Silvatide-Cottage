# Silvatide Cottage

[![Deploy to GitHub Pages](https://github.com/Kaustobh/Silvatide-Cottage/actions/workflows/deploy.yml/badge.svg)](https://github.com/Kaustobh/Silvatide-Cottage/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://Kaustobh.github.io/Silvatide-Cottage/)

Silvatide Cottage is a stunning, high-performance landing page for a premium lakeside retreat. Built with Astro, it features a pixel-perfect, highly responsive layout with advanced CSS techniques such as clip-path masking, infinite rotating galleries, and native IntersectionObserver scroll animations.

## Live Demo
Check out the live site here: [Silvatide Cottage on GitHub Pages](https://Kaustobh.github.io/Silvatide-Cottage/)

## 📚 UX Engineering Case Study
For a deep dive into the architectural decisions, CSS token systems, and performance trade-offs, check out the comprehensive documentation:
👉 **[Read the Full Case Study & Component Specs](./CASE_STUDY.md)**

## Project Structure
- `src/components/` - Contains the modular UI sections (`MainHero`, `Gallery`, `Features`, `Architecture`, `FooterHero`).
- `src/layouts/Layout.astro` - The base HTML structure, global fonts, and scroll animation observers.
- `src/styles/global.css` - Global styling, CSS reset, and the 8px spacing system grid.
- `public/` - Static assets, images, and the `.nojekyll` file for GitHub Pages compatibility.
- `astro.config.mjs` - Astro configuration file, setup for GitHub pages subpath routing.

## Tech Stack
- **Framework:** Astro (Static Site Generation)
- **Styling:** Vanilla Scoped CSS + CSS Design Tokens
- **3D Graphics:** Vanilla Three.js (Tree-shaken, GLTFLoader, OrbitControls, MeshoptDecoder)
- **Smooth Scroll & Animation:** Lenis + GSAP ScrollTrigger
- **Asset Processing:** Sharp, @gltf-transform, Puppeteer headless renderer

## Cinematic Scroll Experience & 3D Chapters
The experience seamlessly blends editorial design with real-time 3D and responsive scroll scrubs:

| Chapter | Component | Type | Description |
|---|---|---|---|
| **I. Drawing** | `BlueprintReveal.astro` | Pinned Canvas Scrub (120 WebP frames) | Exploded isometric layers assembling through ink-line drafting into textured cottage, then wipe-transitions into architectural photo 7. |
| **II. 3D Studio** | `StudioViewer.astro` | Vanilla Three.js + OrbitControls | Interactive spatial model (`cottage-assembled.glb`). Includes explode slider, dollhouse roof cutaway, animated section cut, 6 camera presets, and 4 spatial hotspots. |
| **Interlude** | `Inside.astro` | Full-bleed Parallax Pause | Evocative stillness on Lake Saimaa featuring Photo 6 (*"Silence carved into the Finnish wilderness"*). |
| **III. Inside** | `Inside.astro` | Pinned Horizontal Track + 3D Orbit Modals | Horizontal gallery of 4 suites with inner photo parallax and interactive 3D inspection for Living Pavilion, Primary Suite, and Forest Bath using bespoke extracted room models. |
| **IV. Dawn to Dusk** | `DawnToDusk.astro` | Pinned Scrub + Compare Slider | 5-step diurnal light scrub (05:40 → 23:00) with tone-matched dissolves, followed by an interactive Day vs. Night forest entrance compare slider. |
| **Navigation & UI** | `ChapterRail.astro`, `CustomCursor.astro` | Global UI Layer | Hairline top progress bar, right-side chapter rail with anchor scrolling, and contextual cursor (`EXPLORE`, `DRAG`, `3D ROOM`, `INSPECT`). |

## Bespoke 3D Models & Asset Pipeline

Dedicated, clean models extracted from the primary CAD files into `public/models/`:
- `cottage-assembled.glb` (2.53 MB, 318k tris): Complete Nordic cottage with cantilevered deck, glass balustrades, outdoor firepit, and dollhouse interior walls.
- `cottage-exploded.glb` (2.10 MB, 238k tris): Vertical exploded stack (solar panel, standing-seam roof, trusses, loft, walls, deck, and floating lake canoe).
- `room-living.glb` (0.74 MB, 80k tris): Living room with hearth, sectional sofa, and dining set.
- `room-bedroom.glb` (0.72 MB, 74k tris): Minimalist bedroom with timber slat wall, bed, and sconces.
- `room-bathroom.glb` (0.62 MB, 56k tris): Honed stone bathroom with walk-in glass shower and circular vanity.

### Performance Budgets
- **3D Hero Model:** ≤ 4.5 MB desktop (actual: 2.53 MB, meshopt compressed).
- **Blueprint Frame Sequence:** ≤ 6 MB desktop (actual: 2.29 MB across 120 WebP frames).
- **Images:** AVIF + WebP responsive srcset (640, 960, 1440, 2200px) with 5% watermark crop and base64 blur placeholders.
- **Rendering:** Render-on-demand governor (renders only when camera or models move; 0 idle GPU consumption).

## Microcopy Table

| UI Element | Location | Copy | Tone & Rationale |
|---|---|---|---|
| Section Eyebrow | Chapter I | `CHAPTER I · THE DRAWING` | Calm, structural drafting header |
| Milestone 01 | Chapter I | `01. Site & Topography · Low Scandinavian sun and ancient granite base.` | Establishes the geological landscape |
| Milestone 02 | Chapter I | `02. Structural Framing · Larch timber post-and-beam system.` | Authentic Finnish craftsmanship |
| Milestone 03 | Chapter I | `03. Weather Envelope · Standing-seam zinc roof and passive solar glazing.` | Modern architectural envelope |
| Milestone 04 | Chapter I | `04. Lived-in Retreat · Cottage completed on the tranquil shoreline.` | Seamless transition to photography |
| Explode Slider | Chapter II | `Explode Assembly (0% — 100%)` | Direct, functional technical tool |
| Dollhouse Button | Chapter II | `Dollhouse View (Fade Roof)` | Clear affordance for interior inspection |
| Section Cut | Chapter II | `Section Cut (Sweeping Y-Plane)` | Architectural drafting term |
| Camera Presets | Chapter II | `1: Perspective · 2: Front · 3: Rear · 4: Left · 5: Right · 6: Top` | Fast keyboard and click navigation |
| Interlude Quote | Interlude | `“Silence carved into the Finnish wilderness.”` | Poetic pause before interior exploration |
| Room 01 CTA | Chapter III | `3D ROOM · Living Pavilion` | Clear, non-gimmicky modal trigger |
| Diurnal Clock | Chapter IV | `05:40 FIRST LIGHT → 23:00 MIDNIGHT FIRE` | Diurnal transition tied to actual solar times |
| Compare Slider | Chapter IV | `Forest Entrance at Day & Night` | Direct architectural study |

## Local Setup Instructions
To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kaustobh/Silvatide-Cottage.git
   cd Silvatide-Cottage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`.
