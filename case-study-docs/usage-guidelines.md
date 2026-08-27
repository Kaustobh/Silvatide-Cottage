# 📘 Usage Guidelines

These guidelines dictate how the Silvatide component library and design system should be applied when expanding the site (e.g., adding a booking page or a property detail page).

## 1. Typography & Readability
- **Never exceed `--max-text-width` (400px)** for paragraph text (`<p>`). Luxury editorial design relies on white space; forcing the user's eye to track across a full 1920px monitor breaks the aesthetic.
- Use `opacity: 0.8` or `--color-text-muted` for secondary descriptions to establish visual hierarchy against stark white headers.

## 2. Image Handling
- All images must use the `loading="lazy"` attribute unless they are "above the fold" (e.g., the `MainHero` images).
- When appending images dynamically on GitHub Pages, always prefix the URL with `${import.meta.env.BASE_URL}/` to ensure correct subpath routing.

## 3. Spacing Rhythm
- Always use the defined CSS variables (`--space-*`) for margins and paddings. 
- Avoid arbitrary pixel values. If an element needs to be pushed down, use a multiple of 8px.
