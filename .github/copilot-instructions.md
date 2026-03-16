---
applyTo: "**"
---
name: vanilla-js-architect
description: Clean, modular vanilla JavaScript architecture with JSDoc standards, DDD-inspired layering, and best practices for building maintainable applications using Vite and Vitest. Focuses on separation of concerns, pure functions, and professional code organization.

# Vanilla JS Architect (Vite + Vitest)

**Version**: 1.0  
**Focus**: Clean vanilla JavaScript architecture bundled with Vite, tested with Vitest.  
**Purpose**: Build maintainable, professional JavaScript applications with clear separation of concerns without heavy UI frameworks (React/Vue).

## Naming Conventions
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (_)
- Use ALL_CAPS for constants

## Error Handling
- Use try/catch blocks for async operations
- Always log errors with contextual information

## Core Principles

### 1. Separation of Concerns
Organize code into distinct layers:
**Core (Pure Logic)**: Business logic, algorithms, data transformations. No DOM, no side effects.
**UI (View Layer)**: DOM manipulation, rendering, event binding. Thin layer that delegates to logic.
**App (Orchestration)**: Connects core + UI + data. Handles flow, routing, global state.
**Data (Persistence)**: API calls, localStorage, etc.

### 2. Pure Functions First
Write pure functions that don't produce side effects. Call pure functions first, then handle side actions. Pure functions go in `core/` and are easily tested with Vitest.

### 3. JSDoc for Type Safety
Use JSDoc comments to document types, params, and returns. Avoid heavy TypeScript tooling since we're using Vanilla JS.

## File Structure Best Practices (Vite)

```
/
  index.html             # Vite entry point
  package.json           # Vite & Vitest dependencies
  vite.config.js         # Vite configuration
  vitest.config.js       # Vitest configuration
  public/                # Static assets (images, raw files)
  src/
    css/
      styles.css         # Global styles
    js/
      main.js            # App bootstrap & orchestration
      core/              # Pure utilities
      ui/                # DOM utility functions & components
      data/              # Fetch wrappers or storage
```

## Best Practices

### 1. Event Delegation
Attach single event listeners to parents instead of thousands of listeners across child nodes.

### 2. Debounce & Throttle
Wrap expensive operations (resize, scroll, searches) in utility debouncers or throttlers.

### 3. Native Over Frameworks
Rely on modern ES6 modules, CSS Custom Properties (Variables), and standard CSS Grid / Flexbox layouts.

## Testing Strategy
- **Unit Tests**: Use Vitest (`*.test.js`) to test pure functions in the `core/` layer.
- **Integration**: Keep UI logic thin so tests can focus heavily on core business logic and state orchestration.

## Image Optimization

Full spec: `image-optimization-spec.md`. Follow these rules when working with images:

- **Tool**: `sharp` via `scripts/optimize-images.mjs`. Never use `cwebp` directly.
- **Non-destructive**: Generate sized variants (`-400`, `-800`, `-1200`) alongside originals. Never overwrite source files.
- **No generation loss**: Always compress from the original, never re-compress an already-compressed image.
- **Responsive delivery**: Use `srcset` + `sizes` on `<img>` tags. Gallery overlay JS should swap to the `-1200` variant.
- **Quality**: q80 for collages/art and professional photography.
- **Lazy loading**: All below-fold images must have `loading="lazy"`.
- **Formats**: WebP now; AVIF + `<picture>` fallback planned (Phase 2).
- **Transparency**: When converting PNGs with alpha channels, verify output has `channels: 4`. Use `alphaQuality: 100` for WebP.
