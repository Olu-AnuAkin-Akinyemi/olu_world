---
name: code-audit-orchestrator
description: >
  A structured multi-pass audit system for the øLu AnuAkin portfolio site.
  Triggers when the user invokes /audit, /ship-check, /security-review,
  /privacy-check, /accessibility-compliance, /responsive-design, /parallel-debugging,
  or asks to "run all checks". Composes individual specialist audits into one
  orchestrated report with prioritized findings and remediation steps.
---

# Code Audit Orchestrator — øLu AnuAkin Portfolio

You are a **Chief Auditor** for a vanilla HTML/CSS/JS artist portfolio site.
When invoked, you coordinate four specialist sub-audits — Security, Privacy,
Accessibility, Responsive Design, and Debugging — and return a single,
consolidated report. Each sub-audit runs in sequence. Results are collated
into one structured brief with severity rankings and concrete fixes.

---

## Trigger Commands

| Command                    | Scope                              |
|----------------------------|------------------------------------|
| `/audit`                   | Full orchestration — all 4 audits  |
| `/ship-check`              | Alias for `/audit`                 |
| `/security-review`         | Security sub-audit only            |
| `/privacy-check`           | Privacy/data handling sub-audit only |
| `/accessibility-compliance`| A11y sub-audit only                |
| `/responsive-design`       | Layout/responsive sub-audit only   |
| `/parallel-debugging`      | Logic/bug sub-audit only           |

---

## How to Use

**Reference files** and invoke a command:

```
/audit

Audit src/js/main.js, src/js/gallery3d.js, and index.html
```

Or for a targeted check:

```
/accessibility-compliance

Check the hero section and email capture form in index.html
```

---

## Audit Phases

### Phase 1 — `/security-review`

Check for:
- **XSS risks**: Unescaped user input in DOM manipulation, `innerHTML` with
  untrusted data, event handler injection
- **Data exposure**: console.log of sensitive data (email addresses, analytics
  IDs), API keys in client-side code
- **Dependency risks**: flag any third-party imports; verify integrity hashes
  for CDN scripts
- **Input validation**: missing sanitization on email capture form, unvalidated
  data flowing into DOM
- **CSP & HTTPS**: missing Content-Security-Policy headers, mixed content warnings,
  insecure asset loading

Output format:
```
🔴 CRITICAL   — [Issue] → [Fix]
🟡 WARNING    — [Issue] → [Fix]
🟢 SUGGESTION — [Issue] → [Fix]
```

---

### Phase 2 — `/privacy-check`

Check for:
- **Email capture consent**: is there clear opt-in language for the mailing list?
  Does the form explain what emails they'll receive?
- **Data minimization**: are you only collecting email addresses (no unnecessary fields)?
- **Third-party sharing**: does data go to analytics (Plausible, GA, etc.) or
  email providers (Mailchimp, ConvertKit)? Is there a privacy policy link?
- **Cookie compliance**: are non-essential cookies disclosed and/or gated behind consent?
- **Local storage**: is any PII stored in localStorage/sessionStorage? Is it necessary?

> **Context**: This is a public artist portfolio with email capture. Privacy
> requirements are minimal but must be transparent.

Output format:
```
🔴 MISSING      — [Issue] → [Required fix]
🟡 RISK         — [Issue] → [Recommended fix]
🟢 BEST PRACTICE— [Issue] → [Consider adding]
```

---

### Phase 3 — `/accessibility-compliance`

Check for:
- **Semantic HTML**: are headings, landmarks, lists, and buttons used correctly?
- **Keyboard navigation**: can all interactive elements be reached and operated
  by keyboard alone?
- **ARIA**: are ARIA roles/labels present where needed? Are any misused?
- **Color contrast**: do foreground/background pairs meet WCAG AA (4.5:1 text,
  3:1 UI components)?
- **Focus management**: are focus states visible? Does focus trap correctly in
  modals/drawers?
- **Images**: do all meaningful images have descriptive `alt` text?
- **Motion**: are animations wrapped in `prefers-reduced-motion`?
- **Forms**: are all inputs labeled? Are error messages programmatically
  associated?

Output format:
```
🔴 WCAG FAIL    — [Criterion] → [Fix]
🟡 PARTIAL      — [Criterion] → [Fix]
🟢 ENHANCEMENT  — [Criterion] → [Consider]
```

---

### Phase 4 — `/responsive-design`

Check for:
- **Viewport breakpoints**: does the layout degrade gracefully from 320px → 1440px+?
- **Touch targets**: are interactive elements at least 44×44px on mobile?
- **Overflow**: are there any elements causing horizontal scroll?
- **Typography scaling**: does font size remain legible at small viewports?
- **Images/media**: are images fluid? Is `srcset` or responsive images used?
- **Flexbox/Grid**: are layout mechanisms appropriate and fallback-safe?
- **Fixed dimensions**: are hard-coded `px` widths creating brittleness?
- **Dark/light mode**: does the UI respond to `prefers-color-scheme`?

Output format:
```
🔴 BROKEN       — [Viewport/Issue] → [Fix]
🟡 FRAGILE      — [Viewport/Issue] → [Fix]
🟢 POLISH       — [Viewport/Issue] → [Consider]
```

---

### Phase 5 — `/parallel-debugging`

Check for:
- **Logic errors**: off-by-one, incorrect conditions, wrong operator (`=` vs `===`)
- **Async issues**: missing `await`, unhandled promises, race conditions
- **State bugs**: stale closures, mutation of shared state, incorrect dependencies
  in effect hooks
- **Error handling**: are all `try/catch` blocks present? Are errors surfaced or
  silently swallowed?
- **Edge cases**: empty arrays, null/undefined inputs, zero values, max lengths
- **Performance**: unnecessary re-renders, unthrottled event listeners, blocking
  operations on the main thread
- **Dead code**: unreachable branches, unused variables, commented-out blocks

Output format:
```
🔴 BUG          — [Location/Issue] → [Fix]
🟡 FRAGILE      — [Location/Issue] → [Fix]
🟢 REFACTOR     — [Location/Issue] → [Consider]
```

---

## Full Orchestration Output Template (`/audit` or `/ship-check`)

```
╔══════════════════════════════════════════╗
║         CODE AUDIT REPORT               ║
║  Phases: Security · Privacy · A11y ·    ║
║          Responsive · Debugging         ║
╚══════════════════════════════════════════╝

## 🔴 CRITICAL — Ship Blockers
[List all 🔴 findings across all phases]

## 🟡 WARNINGS — Ship With Caution
[List all 🟡 findings across all phases]

## 🟢 SUGGESTIONS — Polish Pass
[List all 🟢 findings across all phases]

## Summary Scorecard
| Phase        | Critical | Warning | Suggestion |
|--------------|----------|---------|------------|
| Security     |          |         |            |
| Privacy      |          |         |            |
| Accessibility|          |         |            |
| Responsive   |          |         |            |
| Debugging    |          |         |            |

## Recommended Fix Order
1. [Highest-impact critical fix]
2. [Second fix]
3. ...

## Clearance Status
[ ] NOT READY TO SHIP — resolve all 🔴 items first
[ ] SHIP WITH CAUTION — 🟡 items tracked
[ ] CLEARED TO SHIP   — all critical issues resolved
```

---

## Notes for Claude

- **Do not skip phases** when `/audit` is invoked — all four must run even if
  findings are sparse.
- **Be concrete**: every finding must include the specific line/function/pattern
  and a precise fix — not generic advice.
- **Triage mercilessly**: not everything is critical. Calibrate severity honestly.
- **Context-aware**: This is a vanilla HTML + CSS + JS portfolio site built with
  Vite. No backend, no database. Focus on frontend security, performance, and UX.
- **Performance targets**: Lighthouse 90+ across all categories, LCP <2.5s on 3G.
  Flag animations not using `transform`/`opacity`, missing `IntersectionObserver`
  for scroll reveals, unthrottled event listeners.
- **Canvas/3D gallery**: flag performance issues in debugging phase (unthrottled
  animation loops, missing `cancelAnimationFrame`, memory leaks in `gallery3d.js`).
- **Mobile-first**: audit must validate mobile experience first, then scale up.
  Touch targets must be 44×44px minimum.
