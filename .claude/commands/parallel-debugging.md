---
description: Run Phase 5 debugging & performance audit
---

Follow the instructions in CODE-AUDIT-ORCHESTRATOR.md and run **Phase 5 — Parallel Debugging** only.

Check for:
- Logic errors (off-by-one, incorrect conditions, wrong operators)
- Async issues (missing await, unhandled promises, race conditions)
- State bugs (stale closures, mutation of shared state)
- Error handling (try/catch blocks present, errors surfaced not swallowed)
- Edge cases (empty arrays, null/undefined inputs, zero values, max lengths)
- Performance (unnecessary operations, unthrottled event listeners, blocking main thread)
- Dead code (unreachable branches, unused variables, commented-out blocks)

**Performance-critical checks:**
- Canvas animations using `cancelAnimationFrame` (gallery3d.js)
- Scroll reveals using `IntersectionObserver` not scroll listeners (main.js)
- Custom cursor using `transform` only, no layout thrashing (main.js)
- Audio context cleanup (hoverAudio.js)

Output format:
```
🔴 BUG          — [Location/Issue] → [Fix]
🟡 FRAGILE      — [Location/Issue] → [Fix]
🟢 REFACTOR     — [Location/Issue] → [Consider]
```

**Focus on:** src/js/main.js, src/js/gallery3d.js, src/js/hoverAudio.js
