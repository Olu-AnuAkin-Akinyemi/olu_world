---
description: Run Phase 3 accessibility audit (WCAG 2.1 AA)
---

Follow the instructions in CODE-AUDIT-ORCHESTRATOR.md and run **Phase 3 — Accessibility Compliance** only.

Check for:
- Semantic HTML (headings, landmarks, lists, buttons used correctly)
- Keyboard navigation (all interactive elements reachable/operable by keyboard)
- ARIA (roles/labels present where needed, none misused)
- Color contrast (WCAG AA: 4.5:1 text, 3:1 UI components)
- Focus management (focus states visible, focus trap correct in modals)
- Images (all meaningful images have descriptive alt text)
- Motion (animations wrapped in prefers-reduced-motion)
- Forms (all inputs labeled, error messages programmatically associated)

Output format:
```
🔴 WCAG FAIL    — [Criterion] → [Fix]
🟡 PARTIAL      — [Criterion] → [Fix]
🟢 ENHANCEMENT  — [Criterion] → [Consider]
```

**Focus on:** index.html, src/css/styles.css (theme toggle, hero, email form, gallery navigation)
