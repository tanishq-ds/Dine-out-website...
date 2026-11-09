# experiences/

This folder is the intended home for the three hero 3D components already
prototyped separately:

| Component            | Replaces              | Prop contract to match                         |
|-----------------------|------------------------|-------------------------------------------------|
| `MenuBook.tsx`        | `MenuModal.tsx`        | needs `isOpen`, `onClose`, and menu data source (`src/data.ts` → `MENU_ITEMS`) |
| `GalleryCamera.tsx`   | `GalleryModal.tsx`     | needs `item`, `items`, `onClose`, `onNavigate` — same shape as the existing `GalleryModalProps` so the swap is drop-in |
| `TestimonialLetter.tsx` | (new — testimonials currently render inline in `App.tsx`) | needs `TESTIMONIALS` from `src/data.ts` |

Each should be a self-contained React component owning its own `<canvas>` +
Three.js scene (same pattern as `WebGLScene.tsx`), so it can be triggered from
a button/section in `App.tsx` without touching the main scroll scene.

Nothing in here yet — this is just the seam. Building these is the next step.
