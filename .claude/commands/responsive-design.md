---
description: Run Phase 4 responsive design audit
---

Follow the instructions in CODE-AUDIT-ORCHESTRATOR.md and run **Phase 4 — Responsive Design** only.

Check for:
- Viewport breakpoints (graceful degradation from 320px → 1440px+)
- Touch targets (interactive elements at least 44×44px on mobile)
- Overflow (any elements causing horizontal scroll)
- Typography scaling (font size legible at small viewports)
- Images/media (images fluid, srcset or responsive images used)
- Flexbox/Grid (layout mechanisms appropriate and fallback-safe)
- Fixed dimensions (hard-coded px widths creating brittleness)
- Dark/light mode (UI responds to prefers-color-scheme)

Output format:
```
🔴 BROKEN       — [Viewport/Issue] → [Fix]
🟡 FRAGILE      — [Viewport/Issue] → [Fix]
🟢 POLISH       — [Viewport/Issue] → [Consider]
```

**Test viewports:** 320px, 640px, 980px, 1440px
**Focus on:** index.html, src/css/styles.css (page gutters, grid layouts, hero, gallery)
