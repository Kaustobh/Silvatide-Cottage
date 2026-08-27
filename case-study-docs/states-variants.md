# 🔀 States & Theme Variants

While Silvatide Cottage was designed as a single-theme luxury experience (Dark Mode by default to emphasize high-contrast imagery), specific component states were strictly defined to ensure interaction feedback.

## Interactive States

### Navigation Arrows (Gallery & Features)
- **Default:** Transparent background, `currentColor` stroke (white/off-white).
- **Hover:** Slight background opacity increase (`rgba(255,255,255, 0.1)`), cursor changes to pointer.
- **Focus:** High-contrast outline applied to ensure keyboard navigation visibility.
- **Active (Click):** Subtle scale down (`transform: scale(0.95)`) for tactile feedback.

### IntersectionObserver Animation States
- **Pre-load State:** Elements have `opacity: 0` and `transform: translateY(20px)`.
- **In-View State (Class `.visible`):** Elements transition to `opacity: 1` and `transform: translateY(0)`.
- **Stagger Variants:** Utilized inline CSS variables (e.g., `style="transition-delay: 0.2s;"`) to create cascading animations for sibling elements without writing unique classes.
