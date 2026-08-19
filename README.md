# Silvatide Cottage

Silvatide Cottage is a stunning, high-performance landing page for a premium lakeside retreat. Built with Astro, it features a pixel-perfect, highly responsive layout with advanced CSS techniques such as clip-path masking, infinite rotating galleries, and native IntersectionObserver scroll animations.

## Live Demo
Check out the live site here: [Silvatide Cottage on GitHub Pages](https://Kaustobh.github.io/Silvatide-Cottage/)

## Project Structure
- `src/components/` - Contains the modular UI sections (`MainHero`, `Gallery`, `Features`, `Architecture`, `FooterHero`).
- `src/layouts/Layout.astro` - The base HTML structure, global fonts, and scroll animation observers.
- `src/styles/global.css` - Global styling, CSS reset, and the 8px spacing system grid.
- `public/` - Static assets, images, and the `.nojekyll` file for GitHub Pages compatibility.
- `astro.config.mjs` - Astro configuration file, setup for GitHub pages subpath routing.

## Tech Stack
- **Framework:** Astro
- **Styling:** Vanilla CSS
- **Interactivity:** Vanilla JS (IntersectionObserver)
- **Design Inspiration:** Figma Mockups

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
