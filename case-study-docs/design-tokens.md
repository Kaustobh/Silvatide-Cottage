# 🎨 CSS Design Tokens Specification

The styling architecture for Silvatide Cottage relies on a strict set of Vanilla CSS variables mapped directly from the Figma design tokens. This ensures absolute consistency and drastically reduces code duplication.

## 1. Spatial System (The 8px Grid)
Every padding, margin, and layout gap is a multiple of 8px.
```css
:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-12: 96px;
}
```

## 2. Color Palette
```css
:root {
  --color-bg-primary: #121212;
  --color-text-primary: #f5f5f5;
  --color-text-muted: #a3a3a3;
  --color-accent: #c4a482; /* Warm wood/luxury accent */
}
```

## 3. Typography Constraints
```css
:root {
  --font-family-primary: 'Inter', sans-serif;
  --max-text-width: 400px; /* Crucial for luxury editorial readability */
}
```

## 4. Animation Timing
Standardized easing curves were used to match the premium "feel" of high-end hospitality sites.
```css
:root {
  --transition-slow: 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  --transition-fast: 0.3s ease-out;
}
```
