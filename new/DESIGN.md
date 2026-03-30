# Design System Specification: The Trusted Path

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Sanctuary"**

This design system moves away from the sterile, rigid layouts typical of medical software. Instead, it adopts an editorial, high-end aesthetic that balances AHPRA-level clinical authority with a profound sense of psychological safety. 

We achieve this through **Organic Sophistication**: breaking the "standard grid" with intentional asymmetry, expansive negative space, and a rejection of harsh structural lines. By layering surfaces rather than boxing them in, we create a UI that feels like a quiet, sun-filled architectural space—stable, premium, and deeply human.

---

## 2. Color & Tonal Depth

The palette is rooted in the Australian landscape—deep coastal teals and tectonic slates—providing an anchor of stability.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. 
Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` component should sit on a `surface` background to create a "ghost" edge. If a visual break is needed, use a `3.5` (1.2rem) vertical gap from the spacing scale rather than a divider line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine, heavy-weight paper.
- **Base Layer:** `surface` (#f8fafa) – The foundational canvas.
- **Secondary Areas:** `surface-container-low` (#f2f4f4) – Subtle grouping for background utilities.
- **Actionable Layers:** `surface-container-lowest` (#ffffff) – Used for high-priority cards and interactive modules to create "natural lift."

### The "Glass & Gradient" Rule
To elevate the experience beyond a flat digital tool, use **Glassmorphism** for floating elements (e.g., navigation bars, modal overlays). Utilize semi-transparent versions of `primary-container` with a `backdrop-blur` of 20px. 
*Signature Polish:* Apply a subtle linear gradient to Hero CTAs, transitioning from `primary` (#003441) to `primary-container` (#0f4c5c) at a 135-degree angle. This adds a "soul" and depth that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority

We use a dual-font system to balance clinical precision with empathetic warmth.

| Level | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Public Sans | 3.5rem | Bold, asymmetrical hero statements. |
| **Headline** | `headline-md` | Public Sans | 1.75rem | Authoritative section starts. |
| **Title** | `title-md` | Inter | 1.125rem | Strong, legible labeling for cards. |
| **Body** | `body-lg` | Inter | 1.0rem | High-readability patient notes/content. |
| **Label** | `label-md` | Inter | 0.75rem | Metadata, caps-lock for Medicare tags. |

**Editorial Note:** Use exaggerated tracking (-0.02em) on Display styles to create a premium, "tight" feel. Ensure all body copy uses a line height of at least 1.6 to maintain a calm, breathable reading experience.

---

## 4. Elevation & Depth

We eschew traditional "Drop Shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The mere change in hex value creates a soft, natural edge that is easier on the eye than a shadow.
*   **Ambient Shadows:** For floating elements (Modals/Dropdowns), use "Atmospheric Shadows." These must be extra-diffused. 
    *   *Spec:* `0px 20px 40px rgba(25, 28, 29, 0.06)`. 
    *   The shadow color is a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a border is essential for accessibility (e.g., in high-contrast modes), use the `outline-variant` (#c0c8cb) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary-container`), `xl` (1.5rem) rounded corners. Use `on-primary` (#ffffff) for text.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **States:** On hover, primary buttons should increase in saturation, not darkness, to maintain the "calm" feel.

### Input Fields
*   **Visual Style:** Ghost styling. A `surface-container-high` background with a `sm` (0.25rem) corner radius. 
*   **Interaction:** On focus, the background shifts to `surface-container-lowest` and a subtle `surface-tint` 2px bottom-bar appears. Avoid the "four-sided" focus box.

### Medical Status Chips
*   **Success (Consent Received):** `secondary-container` (#d1e6cb) with `on-secondary-fixed-variant` (#394b38) text. 
*   **Alert (Medicare Limit):** `tertiary-fixed` (#efe1c7) background—a soft sand color that warns without causing panic.

### Clinical Cards
*   **Rule:** Forbid the use of divider lines within cards.
*   **Structure:** Use vertical white space (`spacing-6` or 2rem) to separate the clinician's bio from their AHPRA registration details. 
*   **Nesting:** Place patient data inside a `surface-container-low` inner-well within the main white card to create hierarchical "nesting."

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. Place a headline on the left and start the body copy in the middle-third of the grid to create an editorial feel.
*   **Do** use `xl` (1.5rem) corner radii for large containers and `DEFAULT` (0.5rem) for interactive elements.
*   **Do** leverage `primary-fixed-dim` for "soft" backgrounds in active states to keep the UI from feeling too dark.

### Don’t
*   **Don’t** use pure black (#000000) for text. Always use `on-surface` (#191c1d) to reduce eye strain.
*   **Don’t** use "Alert Red" for non-critical errors. Use `error-container` (#ffdad6) to keep the environment calm.
*   **Don’t** use standard icons. Use thin-stroke (1px or 1.5px) custom iconography to match the "Clinical Sanctuary" aesthetic.