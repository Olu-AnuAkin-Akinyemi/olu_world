---
description: Run Phase 1 security audit only
---

Follow the instructions in CODE-AUDIT-ORCHESTRATOR.md and run **Phase 1 — Security Review** only.

Check for:
- XSS risks (unescaped user input, innerHTML with untrusted data)
- Data exposure (console.log of sensitive data, API keys in client code)
- Dependency risks (third-party imports, CDN integrity hashes)
- Input validation (missing sanitization on email capture form)
- CSP & HTTPS (missing headers, mixed content, insecure asset loading)

Output format:
```
🔴 CRITICAL   — [Issue] → [Fix]
🟡 WARNING    — [Issue] → [Fix]
🟢 SUGGESTION — [Issue] → [Fix]
```

**Focus on:** index.html, src/js/main.js (email capture form if present)
