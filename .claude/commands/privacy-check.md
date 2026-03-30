---
description: Run Phase 2 privacy audit only
---

Follow the instructions in CODE-AUDIT-ORCHESTRATOR.md and run **Phase 2 — Privacy Check** only.

Check for:
- Email capture consent (clear opt-in language, explanation of what emails they'll receive)
- Data minimization (only collecting necessary fields)
- Third-party sharing (analytics, email providers - is there a privacy policy link?)
- Cookie compliance (non-essential cookies disclosed/gated)
- Local storage (any PII stored unnecessarily?)

Output format:
```
🔴 MISSING      — [Issue] → [Required fix]
🟡 RISK         — [Issue] → [Recommended fix]
🟢 BEST PRACTICE— [Issue] → [Consider adding]
```

**Focus on:** index.html (email capture form), any analytics scripts
