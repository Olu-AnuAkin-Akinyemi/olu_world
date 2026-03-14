# Testing Vanilla JS with Vitest: A Complete Learning Reference

*A practical guide to unit testing browser-side JavaScript in a Vite project — covering Vitest configuration, DOM environments, mocking strategies, and async testing patterns.*

---

## Table of Contents

1. [Why Vitest?](#1-why-vitest)
2. [The Configuration Layer — vitest.config.js](#2-the-configuration-layer--vitestconfigjs)
3. [DOM Environments — happy-dom vs jsdom](#3-dom-environments--happy-dom-vs-jsdom)
4. [Structuring a Test File](#4-structuring-a-test-file)
5. [Stubbing Browser APIs That Don't Exist in Node](#5-stubbing-browser-apis-that-dont-exist-in-node)
6. [Building a Minimal DOM for Tests](#6-building-a-minimal-dom-for-tests)
7. [Testing Scripts That Have Side Effects on Import](#7-testing-scripts-that-have-side-effects-on-import)
8. [Mocking fetch and External APIs](#8-mocking-fetch-and-external-apis)
9. [Understanding Async Testing and flushPromises](#9-understanding-async-testing-and-flushpromises)
10. [Fake Timers — Controlling setTimeout and setInterval](#10-fake-timers--controlling-settimeout-and-setinterval)
11. [The Test Lifecycle — beforeEach and afterEach](#11-the-test-lifecycle--beforeeach-and-aftereach)
12. [Dispatching DOM Events in Tests](#12-dispatching-dom-events-in-tests)
13. [What Each Test Pattern Proves](#13-what-each-test-pattern-proves)
14. [The package.json Wiring](#14-the-packagejson-wiring)
15. [Common Pitfalls and How to Avoid Them](#15-common-pitfalls-and-how-to-avoid-them)
16. [Mental Model — How It All Fits Together](#16-mental-model--how-it-all-fits-together)

---

## 1. Why Vitest?

Vitest is a test runner built on top of Vite. If your project already uses Vite for development and building, Vitest is the natural testing choice because:

- **Same transform pipeline** — Vitest uses Vite's module resolution and transformation under the hood. This means your test files are processed with the same ES module support, TypeScript handling, and aliasing that your app code uses. No separate Babel or webpack config needed.
- **Native ESM support** — Vitest understands `import`/`export` natively. Older test runners like Jest require additional configuration or transforms to handle ES modules.
- **Fast execution** — Vitest reuses Vite's optimized module graph, making test startup significantly faster than cold-boot runners.
- **Familiar API** — If you know Jest's `describe`, `it`, `expect`, `vi.fn()`, `vi.spyOn()`, and `beforeEach`/`afterEach`, you already know Vitest. The API is nearly identical.

**Key distinction:** Vite is the *build tool*. Vitest is the *test runner*. They are separate packages that share the same core engine. You install them independently:

```bash
npm install -D vitest
```

---

## 2. The Configuration Layer — vitest.config.js

A minimal Vitest config looks like this:

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
    },
})
```

### Why a separate vitest.config.js?

Your project likely already has a `vite.config.js` for the build pipeline. You *can* put test config there too, but keeping them separate has advantages:

- **Clarity** — Build config and test config serve different purposes. Separating them avoids confusion.
- **No interference** — Build-specific settings (like `root: './src'` or multi-page `rollupOptions`) don't accidentally affect test execution.

If you prefer a single file, Vitest will read `test:` options from `vite.config.js` as a fallback. But a dedicated `vitest.config.js` always takes priority.

### What each option does

**`environment: 'happy-dom'`**

This tells Vitest to simulate a browser-like environment in Node.js. Without this, `document`, `window`, `HTMLElement`, and all DOM APIs would be `undefined` — because Node.js doesn't have a DOM.

See Section 3 for why `happy-dom` was chosen over `jsdom`.

**`globals: true`**

This makes `describe`, `it`, `expect`, `vi`, `beforeEach`, and `afterEach` available without importing them. When set to `false` (the default), you must explicitly import:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
```

**Best practice:** Even with `globals: true`, many developers still import explicitly. It makes dependencies visible at the top of the file and prevents confusion about where `vi` or `expect` come from. The test file in this guide uses explicit imports for this reason.

---

## 3. DOM Environments — happy-dom vs jsdom

When testing browser JavaScript in Node.js, you need a DOM implementation. Two main options exist:

### jsdom

- The original, most widely used DOM implementation for Node.js.
- Full W3C spec compliance — aims to implement every DOM, HTML, and CSS API.
- Used by Jest's default environment.
- **Heavier** — larger dependency tree, slower startup.
- **Known issue:** As of 2025-2026, some versions have CJS/ESM compatibility problems with Vitest 4.x. The error looks like:

```
Error: require() of ES Module ... not supported
Caused by: ERR_REQUIRE_ESM
```

This happens because jsdom's dependency chain includes packages that ship only as ES modules, but jsdom itself uses `require()` internally.

### happy-dom

- A lightweight, performance-focused DOM implementation.
- **7-10x faster** than jsdom in benchmarks.
- Implements the most commonly used DOM APIs — sufficient for the vast majority of web application testing.
- **No CJS/ESM conflicts** — ships cleanly as an ES module, which aligns with Vitest's native ESM architecture.
- Missing some edge-case APIs that jsdom implements (e.g., certain canvas, SVG, or `Range` operations).

### When to use which

| Scenario | Recommendation |
|---|---|
| Standard DOM manipulation testing | happy-dom (faster, simpler) |
| Form handling, event dispatch, innerHTML | happy-dom |
| Testing SVG/Canvas rendering APIs | jsdom (broader API coverage) |
| Legacy project already using jsdom/Jest | jsdom (avoid migration risk) |
| Vitest 4.x with ESM-only deps | happy-dom (avoids CJS conflict) |

### How to install and switch

```bash
# Install your chosen environment
npm install -D happy-dom
# or
npm install -D jsdom
```

Then set it in `vitest.config.js`:

```javascript
test: {
    environment: 'happy-dom',  // or 'jsdom'
}
```

---

## 4. Structuring a Test File

A well-structured test file follows this pattern:

```
1. Imports (test utilities)
2. Global stubs (APIs missing from the DOM environment)
3. Helper functions (DOM builders, token injectors, promise flushers)
4. describe() block (groups related tests)
   ├── beforeEach() — setup that runs before every test
   ├── afterEach() — cleanup that runs after every test
   ├── it() — individual test case
   ├── it() — individual test case
   └── it() — individual test case
```

**Why this order matters:**

- **Global stubs must come first** — they run at module evaluation time, before any `describe` or `it` blocks execute. If your source code creates an `IntersectionObserver` on import, the stub must exist before the import happens.
- **Helper functions next** — they're used inside tests but have no side effects when defined.
- **`describe` blocks last** — they contain the actual test logic.

---

## 5. Stubbing Browser APIs That Don't Exist in Node

Neither happy-dom nor jsdom implements every browser API. `IntersectionObserver` is a common one that's missing. If your source code uses `new IntersectionObserver(...)`, you must stub it before importing that code.

### The wrong way (arrow function)

```javascript
// ❌ This fails: "is not a constructor"
vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
})))
```

**Why it fails:** Arrow functions cannot be used with `new`. JavaScript's `new` operator requires a function declared with `function` or a `class`. The arrow function returns the right shape, but `new (() => ...)` throws a `TypeError`.

### The correct way (class)

```javascript
// ✓ This works: classes are constructable
vi.stubGlobal('IntersectionObserver', class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback) {}
})
```

**Why it works:** `class` declarations are always constructable. `new IntersectionObserver(callback)` succeeds, and the resulting instance has `.observe()`, `.unobserve()`, and `.disconnect()` methods.

### `vi.stubGlobal` explained

`vi.stubGlobal(name, value)` replaces a global variable for the duration of the test. It's the Vitest equivalent of `global.IntersectionObserver = ...` but with automatic cleanup. When tests finish, `vi.restoreAllMocks()` removes the stub.

**Other APIs you may need to stub:**

- `ResizeObserver`
- `matchMedia`
- `navigator.clipboard`
- `scrollTo` / `scrollIntoView`

---

## 6. Building a Minimal DOM for Tests

When your source code runs, it queries the DOM for elements: `document.getElementById('lead-form')`, `document.querySelector('header')`, etc. In a test, that DOM doesn't exist unless you create it.

### The `buildDOM()` pattern

```javascript
function buildDOM() {
    document.body.innerHTML = `
        <header></header>
        <div id="video-container" data-video-id="testvideoid"></div>
        <section id="contact"></section>
        <form id="lead-form">
            <input type="hidden" name="access_key" value="test-key">
            <button type="submit">Get My Free Quote</button>
        </form>
        <button id="scroll-to-top" class="hidden"></button>
    `
}
```

### Key principles

1. **Only include elements your source code queries.** If the code does `document.getElementById('lead-form')`, the form must exist. If it does `document.querySelector('header')`, a `<header>` must exist. But you don't need the full 500-line HTML — just the elements that would cause a `null` reference if missing.

2. **Match the structural assumptions.** If the code does `form.querySelector('button[type="submit"]')`, the button must be *inside* the form element, not a sibling.

3. **Include data attributes your code reads.** If the code reads `videoContainer.dataset.videoId`, your stub must include `data-video-id="..."`.

4. **Use `document.body.innerHTML`** to reset the DOM cleanly. This replaces all previous DOM content, giving each test a fresh starting point.

---

## 7. Testing Scripts That Have Side Effects on Import

Many vanilla JS files execute code at the top level — they query the DOM, attach event listeners, and set up observers immediately when the file loads. These are called **side effects on import**, and they require special handling in tests.

### The problem

```javascript
// scripts.js — runs immediately on import
const form = document.getElementById('lead-form')
form.addEventListener('submit', handleFormSubmit) // ← side effect
```

If you import this file in your test, the `getElementById` and `addEventListener` calls happen _during the import_. The DOM must already be built before the import.

### The solution: dynamic import inside beforeEach

```javascript
beforeEach(async () => {
    vi.resetModules()  // clear the module cache
    buildDOM()         // create the DOM elements
    await import('../src/scripts.js')  // NOW import — side effects attach to the fresh DOM
})
```

### Why `vi.resetModules()` is critical

Node.js (and Vitest) caches module imports. Without `resetModules()`, the second test would reuse the same module instance from the first test — meaning the event listeners from the first test are still attached, and the DOM references point to stale elements.

`vi.resetModules()` clears this cache, forcing a fresh `import()` every time. This gives each test:
- A fresh DOM (from `buildDOM()`)
- Fresh module execution (variables re-initialized, listeners re-attached)

### Why `await` is required

`import()` returns a Promise. Without `await`, the test would start running before the module finishes loading — the event listeners wouldn't be attached yet, and your assertions would fail.

---

## 8. Mocking fetch and External APIs

When your code calls `fetch()` to submit data to an external API, you don't want your tests making real HTTP requests. Mocking replaces the real `fetch` with a function you control.

### Mocking a successful response

```javascript
vi.spyOn(global, 'fetch').mockResolvedValue({
    status: 200,
    json: async () => ({ success: true }),
})
```

**Breaking this down:**

- `vi.spyOn(global, 'fetch')` — wraps the global `fetch` function with a spy. The spy tracks calls and lets you replace the implementation.
- `.mockResolvedValue(...)` — makes the spy return a resolved Promise with the given value. This simulates a successful HTTP response.
- The returned object `{ status: 200, json: async () => ({...}) }` mimics the shape of a real `Response` object — only the properties your code actually uses.
- `json: async () => (...)` — `response.json()` returns a Promise in real code, so the mock must too.

### Mocking a network failure

```javascript
vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
```

`.mockRejectedValue(...)` makes the spy return a rejected Promise — simulating what happens when the network is down, DNS fails, or the server is unreachable. Your code's `catch` block will execute.

### Why `vi.spyOn` instead of `vi.fn`?

- `vi.spyOn(global, 'fetch')` **replaces the existing** `fetch` and can be restored with `vi.restoreAllMocks()`.
- `vi.fn()` creates a new standalone function — you'd have to manually assign it to `global.fetch` and clean it up yourself.

---

## 9. Understanding Async Testing and flushPromises

This is one of the most important concepts in async DOM testing.

### The problem

Consider this simplified source code:

```javascript
async function handleFormSubmit(e) {
    e.preventDefault()
    setButtonState('loading')          // synchronous — happens immediately

    const response = await fetch(...)  // ← await #1
    const result = await response.json() // ← await #2

    if (result.success) {
        setButtonState('success')      // happens after both awaits resolve
    }
}
```

When you dispatch the submit event in a test:

```javascript
form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
```

The event handler starts executing **synchronously up to the first `await`**. Then it suspends, and control returns to your test code. The code after `await fetch(...)` hasn't run yet.

### What runs synchronously vs. asynchronously

```
dispatchEvent('submit')
    │
    ├── e.preventDefault()           ← runs immediately
    ├── setButtonState('loading')    ← runs immediately ✓ can assert here
    ├── await fetch(...)             ← SUSPENDS here (microtask)
    │       │
    │       └── await response.json() ← SUSPENDS again (microtask)
    │               │
    │               └── setButtonState('success') ← runs after both resolve
    │
    └── control returns to test code
```

### The flushPromises pattern

To let the async chain complete before making assertions, you need to advance the microtask queue:

```javascript
const flushPromises = async () => {
    await Promise.resolve() // tick 1: fetch resolves
    await Promise.resolve() // tick 2: json() resolves
}
```

**How it works:** Each `await Promise.resolve()` yields control to the microtask queue, allowing one pending `await` in the source code to resolve. Since `handleFormSubmit` has exactly two `await` calls (fetch, then json), two ticks are needed.

### Using it in a test

```javascript
it('shows success state after API response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 200,
        json: async () => ({ success: true }),
    })

    addTurnstileToken(form)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    // At this point, only the synchronous part has run (loading state)
    await flushPromises()
    // Now both awaits have resolved — success state is set

    expect(btn.innerHTML).toContain('Message Sent')
})
```

### Why not just use one big `await`?

A single `await Promise.resolve()` only advances one microtask tick. If your async function has two `await` calls, the second one hasn't resolved yet after one tick. You need exactly as many ticks as there are `await` calls in the chain.

**Rule of thumb:** Count the `await` statements in your source code's async path, then use that many `await Promise.resolve()` calls in `flushPromises`.

---

## 10. Fake Timers — Controlling setTimeout and setInterval

Your source code likely uses `setTimeout` for things like resetting button state after a delay:

```javascript
setTimeout(() => setButtonState('reset'), 3000)
```

In tests, you don't want to actually wait 3 seconds. Fake timers let you control time:

```javascript
beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})
```

### What `vi.useFakeTimers()` does

It replaces the real `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, and `Date` with controlled versions. Time doesn't advance unless you tell it to:

```javascript
// Advance time by 3000ms — all pending setTimeout/setInterval callbacks fire
vi.advanceTimersByTime(3000)
```

### Why fake timers matter for form tests

Without fake timers, this would happen:

1. Your test dispatches a submit event.
2. The handler calls `setTimeout(() => setButtonState('reset'), 3000)`.
3. The test finishes and `afterEach` runs cleanup.
4. 3 seconds later, the `setTimeout` callback fires — but the DOM is already torn down.

This causes unpredictable failures or "unhandled error" warnings. Fake timers prevent real timer callbacks from firing between tests.

---

## 11. The Test Lifecycle — beforeEach and afterEach

### `beforeEach` — Setup before every test

```javascript
beforeEach(async () => {
    vi.resetModules()  // clear cached module imports
    vi.useFakeTimers() // install fake timers
    buildDOM()         // create fresh DOM elements
    await import('../src/scripts.js')  // re-import with side effects
})
```

This runs before **each** `it()` block. Every test starts with:
- A clean module state (no stale closures or variable values)
- A fresh DOM (no leftover elements from previous tests)
- Fake timers installed (no real timeouts firing)
- Event listeners freshly attached (from the dynamic import)

### `afterEach` — Cleanup after every test

```javascript
afterEach(() => {
    vi.useRealTimers()   // restore real setTimeout/setInterval
    vi.restoreAllMocks() // remove all spies and stubs
})
```

This ensures no test leaks state into the next test.

### Why cleanup matters

Without cleanup:
- A `fetch` spy from test 1 stays active in test 2.
- Fake timers from test 1 affect test 2's timing behavior.
- DOM elements accumulate across tests.

This causes **test order dependency** — tests pass when run in one order but fail in another. Proper cleanup eliminates this class of bugs entirely.

---

## 12. Dispatching DOM Events in Tests

To trigger an event handler in a test, you create and dispatch a synthetic event:

```javascript
form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
```

### The options explained

- **`bubbles: true`** — The event propagates up the DOM tree (child → parent). This is how real browser events work. If an ancestor element is listening for the event via delegation, it needs to bubble.
- **`cancelable: true`** — The event can be cancelled with `e.preventDefault()`. If your handler calls `preventDefault()` and the event isn't cancelable, the call silently does nothing.

### Why not just `form.submit()`?

`form.submit()` submits the form directly, bypassing all `submit` event listeners. It's the programmatic equivalent of the browser's native submission — it doesn't fire the `submit` event. `dispatchEvent` triggers the event handler, which is what you want to test.

---

## 13. What Each Test Pattern Proves

### Pattern 1: Synchronous guard (no async, no flush)

```javascript
it('shows error when token is absent', () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(btn.innerHTML).toContain('Try Again')
})
```

**What it proves:** The validation guard (`if (!turnstileResponse)`) runs synchronously before any async code. No `await`, no `flushPromises` needed. This is a **pre-condition check** — the fastest path through the function.

**Why it matters:** If this guard fails, the form would submit to the API without captcha verification — a security issue.

### Pattern 2: Synchronous state before first await

```javascript
it('shows loading state immediately on submit', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({...})
    addTurnstileToken(form)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(btn.innerHTML).toContain('Sending...')
    expect(btn.disabled).toBe(true)
})
```

**What it proves:** The loading state is set *before* the `await fetch(...)` — meaning the user sees immediate feedback. The test doesn't need `flushPromises` because it's asserting against the synchronous portion of the async function.

### Pattern 3: Full async success path

```javascript
it('shows success after API response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 200,
        json: async () => ({ success: true }),
    })
    addTurnstileToken(form)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushPromises()
    expect(btn.innerHTML).toContain('Message Sent')
})
```

**What it proves:** The entire async chain (fetch → json → state update) resolves correctly. Both `await` calls complete, and the UI reflects the final state.

### Pattern 4: Async error (catch block)

```javascript
it('shows error on network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    addTurnstileToken(form)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushPromises()
    expect(btn.innerHTML).toContain('Try Again')
})
```

**What it proves:** The `catch` block works. When `fetch` throws (network down, DNS failure), the UI doesn't crash — it shows an error state and remains usable.

---

## 14. The package.json Wiring

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "happy-dom": "^20.8.3",
    "vite": "^5.4.11",
    "vitest": "^4.0.18"
  }
}
```

### Key details

- **`"type": "module"`** — Tells Node.js to treat `.js` files as ES modules (import/export) rather than CommonJS (require/module.exports). Required for Vitest's ESM-native architecture.
- **`"vitest run"`** — Runs tests once and exits. Alternative: `"vitest"` (no `run`) starts watch mode, which re-runs tests when files change — useful during development.
- **All test packages are `devDependencies`** — They're never deployed to production. `happy-dom` and `vitest` are only needed during development.

---

## 15. Common Pitfalls and How to Avoid Them

### Pitfall 1: Forgetting `vi.resetModules()` before dynamic import

**Symptom:** Tests pass individually but fail when run together.  
**Cause:** Cached module retains stale DOM references from the previous test.  
**Fix:** Always call `vi.resetModules()` before `await import(...)`.

### Pitfall 2: Using arrow function for constructor stubs

**Symptom:** `TypeError: ... is not a constructor`  
**Cause:** Arrow functions can't be called with `new`.  
**Fix:** Use a `class` or `function` declaration.

### Pitfall 3: Not enough ticks in flushPromises

**Symptom:** Assertions run before async function completes — test sees stale state.  
**Cause:** Fewer `await Promise.resolve()` calls than `await` statements in the source code.  
**Fix:** Count the `await` calls in the async path and match them.

### Pitfall 4: Asserting `btn.disabled === true` for non-loading states

**Symptom:** `expected true, received false`  
**Cause:** Misunderstanding which state disables the button. Only `'loading'` disables it — `'error'` and `'success'` do not (so the user can still interact).  
**Fix:** Read the source code's `setButtonState` function to understand what each state sets.

### Pitfall 5: CJS/ESM conflict with jsdom in Vitest 4.x

**Symptom:** `ERR_REQUIRE_ESM` error before any test runs.  
**Cause:** jsdom's dependency tree includes CJS modules that `require()` ESM-only packages.  
**Fix:** Switch to `happy-dom`, which is fully ESM-compatible.

---

## 16. Mental Model — How It All Fits Together

```
┌──────────────────────────────────────────────────────┐
│  vitest.config.js                                    │
│  "Use happy-dom environment, enable global imports"  │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  Test file (tests/form.test.js)                      │
│                                                      │
│  1. Stub missing browser APIs (IntersectionObserver) │
│  2. For each test:                                   │
│     a. Reset modules (clear cache)                   │
│     b. Build minimal DOM                             │
│     c. Dynamic import source code (side effects run) │
│     d. Mock fetch if needed                          │
│     e. Dispatch DOM event (submit)                   │
│     f. Flush microtask queue if async                │
│     g. Assert against DOM state (innerHTML, disabled)│
│  3. Clean up (restore mocks, real timers)            │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  Source code (src/scripts.js)                        │
│                                                      │
│  - Queries DOM elements (getElementById, etc.)       │
│  - Attaches event listeners (form submit)            │
│  - Async function: validation → fetch → state update │
│  - Uses setTimeout for delayed UI resets             │
└──────────────────────────────────────────────────────┘
```

### The testing contract

Your tests verify a contract: **"Given this DOM state and this API response, the UI ends up in this state."** You don't test the implementation details (which CSS class was toggled) — you test the observable behavior (what the user sees in the button).

This makes tests resilient to refactoring. If someone rewrites `setButtonState` but preserves the same button text and disabled behavior, all tests still pass.

---

## Quick Reference Card

| Concept | Tool/API | Purpose |
|---|---|---|
| Test runner | `vitest` | Executes test files, reports results |
| DOM environment | `happy-dom` | Simulates browser DOM in Node.js |
| Describe block | `describe()` | Groups related tests |
| Test case | `it()` | Individual assertion scenario |
| Mock function | `vi.fn()` | Standalone fake function |
| Spy on existing | `vi.spyOn()` | Wrap and track calls to real function |
| Global stub | `vi.stubGlobal()` | Replace a global (window/document-level) API |
| Resolved promise mock | `.mockResolvedValue()` | Simulate successful async return |
| Rejected promise mock | `.mockRejectedValue()` | Simulate failed async (throw/reject) |
| Fake timers | `vi.useFakeTimers()` | Control setTimeout/setInterval |
| Advance time | `vi.advanceTimersByTime(ms)` | Fire pending timer callbacks |
| Reset module cache | `vi.resetModules()` | Force fresh import on next `import()` |
| Restore all mocks | `vi.restoreAllMocks()` | Remove all spies and stubs |
| Flush async queue | `await Promise.resolve()` | Advance microtask queue by one tick |

---

*Reference built from a real Vite + Vanilla JS project — patterns apply to any Vitest testing scenario.*
