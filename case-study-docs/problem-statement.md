# 🎯 Problem Statement & Design Constraints

## The Core Problem
Luxury hospitality websites frequently suffer from "web-bloat". To convey "luxury," designers rely on massive high-resolution imagery and heavy scroll animations. This often results in slow load times and high bounce rates—directly hurting booking conversions.

The challenge was translating a bespoke, image-heavy luxury design from Figma into a fast, performant web experience without losing 1px of its aesthetic feel.

## Strict Design Constraints
1. **Spatial Constraints:** The design utilized a rigid **8px spatial grid**. Every margin and padding value strictly adhered to multiples of 8 (e.g., 16px, 24px, 32px, 48px).
2. **Readability Caps:** To maintain optimal line lengths for luxury typography, paragraph blocks were constrained to a strict **400px maximum width**.
3. **Complex Z-Index Layering:** The Hero section required the massive "SILVA" text to sit *behind* the cabin roof but *in front* of the background trees—a masking effect that is notoriously difficult to achieve responsively without flattening the text into an inaccessible image.
