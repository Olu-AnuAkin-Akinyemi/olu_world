# Component Gallery — UI & UX Reference

> Source: [component.gallery/components](https://component.gallery/components/)
> Compiled as a Senior UI/UX Design reference covering all 67 documented components.
> Use this file as a practical decision guide when designing, building, or reviewing UI patterns.

---

## Table of Contents

1. [Design Principles That Run Across All Components](#1-design-principles-that-run-across-all-components)
2. [Navigation Components](#2-navigation-components)
3. [Layout & Container Components](#3-layout--container-components)
4. [Form & Input Components](#4-form--input-components)
5. [Feedback & Status Components](#5-feedback--status-components)
6. [Overlay & Disclosure Components](#6-overlay--disclosure-components)
7. [Data Display Components](#7-data-display-components)
8. [Media Components](#8-media-components)
9. [Utility & Accessibility Components](#9-utility--accessibility-components)
10. [Component Quick Reference](#10-component-quick-reference)

---

## 1. Design Principles That Run Across All Components

These principles were observed consistently across 60+ design systems in the gallery:

### Semantic HTML First
- Always use the correct native element (`<button>`, `<nav>`, `<ol>`, `<input>`) before reaching for ARIA.
- "Bad ARIA is worse than no ARIA." — only add roles when native semantics are insufficient.
- Correct elements get keyboard behavior, focus management, and screen reader support for free.

### Accessibility Is Non-Negotiable
- Every interactive component must be keyboard-operable (Tab, Enter, Space, Arrow keys).
- Every state change must be communicated via `aria-*` attributes (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-current`).
- Maintain WCAG AA contrast ratios (4.5:1 text, 3:1 UI components).
- Never remove focus outlines — provide visible `:focus-visible` styles instead.
- Minimum touch target: **10mm × 10mm** (mobile), **24px × 24px** (WCAG 2.2 minimum for pointer targets).

### States Must Be Visually Distinct
Every interactive component needs at minimum these visual states:
- **Default** — resting appearance
- **Hover** — indicates interactivity
- **Focus** — keyboard navigation indicator
- **Active/Pressed** — confirmation of interaction
- **Disabled** — restricted interaction
- **Error / Validation** — feedback on incorrect input

### Motion and Animation
- Respect `prefers-reduced-motion` media query.
- Transitions should be subtle: **0.1s–0.3s** for hover/focus, **0.2s–0.4s** for enter/exit of overlays.
- Never use animation as the only means of communicating state.

### Tone of Voice
- 25+ design systems include copy guidelines alongside component specs.
- Labels should be action-oriented and specific (e.g., "Delete account" not "OK").
- Error messages should be helpful, not punishing.
- Empty states deserve personality-driven copy, not generic "No results."

---

## 2. Navigation Components

### Breadcrumbs
**Purpose:** Show the user's hierarchical location within a site.

**Markup pattern:**
```html
<nav aria-label="Breadcrumbs">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Water Systems</li>
  </ol>
</nav>
```
- Use `<ol>` (ordered list) — hierarchy matters.
- Mark the current page with `aria-current="page"`, not a link.
- Separate items with `>`, `/`, or a chevron icon.
- Avoid on single-level sites (blogs, flat structures).

---

### Navigation
**Purpose:** Container for site-wide or in-page navigation links.

**Variants:**
| Type | Best For |
|------|----------|
| Horizontal (top bar) | Primary site navigation, desktop |
| Vertical / sidebar | Section navigation, dashboards |
| Bottom bar | Mobile primary navigation |
| Mega menu | Large content catalogs |

**Key patterns:**
- Mark active section with `aria-current="page"` or `aria-current="true"`.
- Collapsible hamburger nav on mobile must manage focus when opened/closed.
- Always use `<nav>` element — it's a landmark for screen readers.
- Provide `aria-label` when multiple `<nav>` elements exist on a page.

---

### Dropdown Menu
**Purpose:** Reveal hidden actions or navigation options on user interaction.

**Distinguishing from Select:** A dropdown menu presents **actions or links**. A Select presents **form values**.

**Keyboard requirements:**
- `Arrow Down / Up` — move between items
- `Enter` — activate item
- `Escape` — close and return focus to trigger
- `Tab` — exit menu

**ARIA:**
- Trigger: `aria-haspopup="menu"`, `aria-expanded`
- Menu: `role="menu"`
- Items: `role="menuitem"`

---

### Pagination
**Purpose:** Navigate across multiple pages of content.

**Markup pattern:**
```html
<nav aria-label="Pagination">
  <ol>
    <li><a href="/blog?p=1">1</a></li>
    <li><span aria-current="page">2</span></li>
    <li><a href="/blog?p=3">3</a></li>
  </ol>
</nav>
```
- Current page: plain text or `aria-current="page"`, not a link.
- Provide "Previous" / "Next" labels legible to screen readers.
- Use `aria-label` on the `<nav>` to distinguish from primary navigation.

---

### Tabs
**Purpose:** Switch between multiple content panels within the same context.

**ARIA pattern:**
```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Overview</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Details</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>...</div>
```

**Keyboard:**
- `Tab` — enters tab list, then exits to next page element
- `← →` — cycle tabs (horizontal)
- `↑ ↓` — cycle tabs (vertical, `aria-orientation="vertical"`)
- `Enter / Space` — activate focused tab

**Cautions:**
- Hidden content reduces discoverability.
- Consider Accordion for simpler or mobile-heavy interfaces.
- Horizontal tab lists need responsive handling at narrow viewports.

---

### Tree View
**Purpose:** Display nested hierarchical data (file systems, org charts, taxonomies).

**Semantic structure:**
```html
<ul role="tree" aria-label="File system">
  <li role="treeitem" aria-expanded="true">
    src/
    <ul role="group">
      <li role="treeitem">index.html</li>
    </ul>
  </li>
</ul>
```

**Keyboard:**
- `↑ ↓` — move focus between nodes
- `← →` — collapse/expand; navigate parent-child
- `Enter / Space` — select node

**Design tips:**
- Use chevron icons for expand/collapse indicators.
- Add free-text filter for large datasets.
- Reserve for genuinely hierarchical data; use List or Accordion for flat structures.

---

## 3. Layout & Container Components

### Card
**Purpose:** Self-contained content block representing a single entity (article, product, task, contact).

**Design patterns:**
- Group related content with consistent padding and border or shadow.
- Use subtle border or `box-shadow` for visual separation.
- Rounded corners add visual softness.
- Hover state: elevation change (`box-shadow` increase) or background shift.
- Rounded corners + subtle shadow = tactile, clickable affordance.

**Accessibility:**
- Use a heading hierarchy within cards (`<h2>`, `<h3>`) — never skip levels.
- If the whole card is clickable, use a single `<a>` spanning the card. Don't layer multiple links.
- Ensure sufficient color contrast for text and icons within the card.

---

### Hero
**Purpose:** Large banner, usually the first element on a page, often with a full-width image.

**Also called:** Jumbotron, Banner

**Design tips:**
- Establish hierarchy: Headline → Subheadline → CTA.
- Background images need text contrast treatment (overlay, text-shadow, or solid panel).
- CTA button must be immediately obvious — high contrast, generous padding.
- Avoid auto-playing video in the hero without `prefers-reduced-motion` consideration.
- Set explicit `width` and `height` on images to prevent Cumulative Layout Shift (CLS).

---

### Accordion
**Purpose:** Vertically stacked headings that toggle content visibility to save space.

**Two implementation approaches:**

**Option A — Button + Heading (Recommended for full control):**
```html
<h3>
  <button aria-expanded="false" aria-controls="section-1">
    What is Katharos Water? <span aria-hidden="true">▼</span>
  </button>
</h3>
<div id="section-1" hidden>...</div>
```

**Option B — Native `<details>` + `<summary>` (Zero JS required):**
```html
<details>
  <summary>What is Katharos Water?</summary>
  <p>Content here...</p>
</details>
```

**Design rules:**
- Rotate arrow icon 180° on expand via CSS: `button[aria-expanded='true'] svg { transform: rotate(180deg); }`
- Don't hide essential information inside accordions.
- Avoid forcing single-item-open — users may need to compare multiple sections.
- Prefer over tabs on mobile (better for narrow viewports).

---

### Drawer
**Purpose:** Panel that slides in from the screen edge (tray, flyout, sheet, side panel).

**Variants by edge:** Left, Right, Bottom (most common on mobile), Top

**Key behaviors:**
- Includes backdrop/scrim overlay.
- Close via: X button, backdrop click, or Escape key.
- Focus must be trapped inside when open (`inert` or `tabindex` management on background).
- Return focus to the trigger element on close.

**ARIA:**
- Container: `role="dialog"` or `role="navigation"` depending on content.
- `aria-label` or `aria-labelledby` required.
- `aria-modal="true"` for modal drawers.

---

### Stack
**Purpose:** Wrapper component that applies consistent spacing between child elements without margin-based CSS hacks.

**Design value:** Avoids margin-collapsing bugs; enforces a consistent spacing rhythm via CSS `gap` or lobotomized owl (`* + *`).

---

### Fieldset
**Purpose:** Groups related form inputs with an optional `<legend>` label.

- Required for radio button groups and checkbox groups.
- `<legend>` acts as the label for the entire group.
- Do not use `fieldset` for visual decoration — it carries semantic meaning.

---

## 4. Form & Input Components

### Text Input
**Purpose:** Single-line text entry.

**States:** Default → Hover → Focus → Filled → Error → Disabled

**Best practices:**
- Always associate `<label>` explicitly with `for` / `id` pairing.
- Never use `placeholder` as a substitute for a visible label — it disappears on input.
- Show character counts when limits apply.
- Provide helper text below the field for format hints (e.g., "example@email.com").
- Error messages must be adjacent to the field and programmatically associated (`aria-describedby`).
- Minimum font size in inputs: **16px** on iOS to prevent auto-zoom.

---

### Textarea
**Purpose:** Multi-line text entry.

- Same label/association rules as text inputs.
- Allow vertical resizing (`resize: vertical`) — never `resize: none` unless layout requires it.
- Show character counter when limits exist.

---

### Select
**Purpose:** Form input for choosing from a predefined list of values.

**Distinguished from Dropdown Menu:** Select = form value. Dropdown Menu = actions/navigation.

**States:** Collapsed (shows current value) → Expanded (scrollable option list)

**Keyboard:**
- `Space / Enter` — open
- `↑ ↓` — navigate options
- `Escape` — close without selecting

**UX note:** Native `<select>` provides the best out-of-the-box accessibility. Custom selects require significant ARIA work to match.

---

### Combobox
**Purpose:** Input with free-text filtering over a list of predefined options.

**Also called:** Autocomplete, Autosuggest, Typeahead, Lookup

**Distinguished from Select:** Combobox allows typing to filter. Select does not.

**ARIA pattern:** `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-controls` linking to `role="listbox"`.

**Keyboard:** Arrow keys navigate list; Escape closes; Enter selects.

---

### Checkbox
**Purpose:** Binary input (checked/unchecked). Multiple checkboxes = multi-select from a list.

**States:** Unchecked → Checked → Indeterminate (parent-child relationships) → Disabled

**Accessibility:**
- Use native `<input type="checkbox">` — do not rebuild with `<div>`.
- Group in `<fieldset>` with `<legend>` for related options.
- Indeterminate state set via `element.indeterminate = true` in JavaScript (not an HTML attribute).

---

### Radio Button
**Purpose:** Single-option selection from a predefined list (mutually exclusive).

**Variants:** Standard radio, Radio card (card-sized option), Rich radio (with metadata)

**Design rules:**
- Vertical stacking preferred for readability.
- Group in `<fieldset>` with `<legend>`.
- Arrow keys move between options within a group; Tab moves to the next form element.
- Never use checkboxes for single-selection scenarios.

---

### Toggle / Switch
**Purpose:** Binary on/off control, typically for settings and preferences.

**Also called:** Switch, Lightswitch

**ARIA:** `role="switch"`, `aria-checked="true|false"`

**UX guidance:**
- Changes should take effect immediately (not require a separate Save button).
- If a Save action is required, use a checkbox instead.
- Provide clear labels describing both states ("Email notifications: On / Off").

---

### Slider
**Purpose:** Numeric value selection within a min/max range.

**Also called:** Range input

**Best practices:**
- Display the numeric value alongside the handle (live update on drag).
- Provide step increments for precision when needed.
- Large touch targets for the drag handle (min 24px × 24px).
- Support keyboard: `← →` adjust value, `Home/End` jump to min/max.
- Label the min and max values visually.

---

### Stepper
**Purpose:** Numeric input with increment/decrement buttons (`+` / `−`).

- Use for small, bounded integer values (quantity selectors, etc.).
- Use Slider for ranges requiring visual position feedback.

---

### Date Input
**Purpose:** Text-field-based date entry across day/month/year fields.

**Best for:** Known dates (birthdate, invoice date) where calendar context isn't needed.

---

### Datepicker
**Purpose:** Visual calendar-based date selection.

**Best for:** Scheduling, booking, future date selection where context (day of week) matters.
- Requires robust keyboard navigation (arrow keys within calendar grid).
- Provide a text fallback input for power users.

---

### Color Picker
**Purpose:** Color selection input.

- Native `<input type="color">` provides basic functionality.
- Custom implementations needed for hex/RGB/HSL input fields alongside visual picker.

---

### File Upload
**Purpose:** Allow users to upload files from their device.

**Also called:** File input, File uploader, Dropzone

**Variants:** Simple file picker, Drag-and-drop zone, Multiple file upload

**States:** Default, Hover/Drag-over, Uploading, Success, Error

**Accessibility:**
- The native `<input type="file">` is the most accessible foundation.
- Custom drag-and-drop zones need keyboard alternatives (a button triggering the file picker).
- Announce upload progress and completion to screen readers via `aria-live`.

---

### Search Input
**Purpose:** Content discovery via keyword search.

- Use `role="search"` on the wrapping `<form>` or `<div>`.
- Include a visible search button or support Enter key submission.
- Autocomplete suggestions use `role="listbox"` (see Combobox pattern).

---

### Rating
**Purpose:** Star-based value input or display.

- Interactive ratings must be keyboard accessible (arrow keys, Enter/Space).
- Use `role="radiogroup"` with individual `role="radio"` stars for interactive ratings.
- Display-only ratings use `aria-label` on the container (e.g., "Rating: 4 out of 5 stars").

---

### Rich Text Editor
**Purpose:** WYSIWYG formatted content editing (bold, lists, headings, links).

- Accessibility is complex — prefer established libraries (Quill, TipTap, Slate).
- Must support keyboard access to all toolbar actions.
- Provide a plain-text fallback where possible.

---

### Label
**Purpose:** Text label associated with a form input.

- Always use `<label for="inputId">` — never just visually position text near an input.
- Clicking the label should focus/activate the associated control.
- Required indicator: use text "(required)" or `aria-required="true"` — not just a red asterisk alone.

---

### Form
**Purpose:** Groups input controls for server submission.

**Best practices:**
- One primary action (submit) per form.
- Inline validation where possible (validate on blur, not on every keystroke).
- Error summary at the top of the form on failed submission (linked to individual fields).
- Disable the submit button during submission to prevent double-posting.

---

## 5. Feedback & Status Components

### Alert
**Purpose:** Inform users of important changes prominently.

**Also called:** Notification, Feedback, Message, Banner, Callout

**Variants by type:**
| Type | Color | Use for |
|------|-------|---------|
| Info | Blue | Neutral information |
| Success | Green | Completed actions |
| Warning | Yellow/Orange | Potential issues |
| Error | Red | Failed actions, critical issues |

**Accessibility:**
- Use `role="alert"` for urgent messages (screen readers announce immediately).
- Use `role="status"` for non-urgent updates.
- Never rely on color alone — include an icon and text label.
- Dismissible alerts must return focus to a logical location on close.

---

### Toast
**Purpose:** Ephemeral, non-blocking notification layered above content (like a push notification).

**Also called:** Snackbar, Floating notification, Message toast

**Distinguishing from Alert:** Toasts auto-dismiss; Alerts persist.

**UX rules:**
- Auto-dismiss after 4–7 seconds for non-critical messages.
- Never auto-dismiss error toasts — users need time to read.
- Position: bottom-right (desktop), bottom-center (mobile).
- Provide a manual close button regardless of auto-dismiss.
- Use `aria-live="polite"` for informational; `aria-live="assertive"` for errors.

---

### Badge
**Purpose:** Small label indicating status, property, or metadata.

**Also called:** Tag, Label, Chip, Lozenge, Pill, Sticker

**Use cases:**
- Status indicators (Active, Pending, Archived)
- Notification counts (unread messages)
- Category tags
- User roles or permissions

**Design rules:**
- Keep label text to 1–3 words maximum.
- Use color + icon + text for critical status — never color alone.
- Provide sufficient internal padding (`4px 8px` minimum).

---

### Spinner
**Purpose:** Communicate an ongoing process while the interface is unavailable.

**Variants:** Indeterminate (unknown duration), Determinate (with percentage)

**Usage rules:**
- Display for processes exceeding ~1 second.
- Pair with contextual text (e.g., "Submitting your request…").
- Position near the content being loaded, not floating randomly.
- `role="status"` with `aria-label` for screen reader announcements.
- Add `aria-live="polite"` to container for dynamic announcements.

---

### Progress Bar
**Purpose:** Horizontal bar showing completion percentage of a long-running task.

**Distinguishing from Spinner:** Progress bar = continuous, measurable task. Spinner = background task, interface unavailable.

**HTML:**
```html
<progress value="65" max="100" aria-label="Upload progress: 65%"></progress>
```
- Always label the progress bar (`aria-label` or `aria-labelledby`).
- Update `aria-valuenow` dynamically if using a custom element.

---

### Progress Indicator (Steps)
**Purpose:** Discrete step-by-step progression (wizard, onboarding, checkout).

**Also called:** Stepper, Timeline, Meter

**Design rules:**
- Show step count ("Step 2 of 5").
- Mark completed steps visually (checkmark icon) and semantically (`aria-current="step"`).
- Allow navigation back to completed steps when possible.

---

### Skeleton
**Purpose:** Grey placeholder boxes displayed while asynchronous content loads.

**Design rules:**
- Match the skeleton's shape and dimensions to the real content it replaces.
- Use a shimmer/pulse animation to signal active loading.
- Prefer over spinners when content structure is known (reduces layout shift on load).
- Announce loading completion to screen readers with `aria-live`.

---

### Empty State
**Purpose:** Communicate that a view has no data to display.

**Anatomy:**
1. Illustration or icon (draws attention)
2. Headline (explains the situation)
3. Supporting description (provides context)
4. Call-to-action (offers a next step)

**Copy guidance:**
- Use personality-driven copy ("Nothing here yet — create your first item")
- Avoid generic placeholders ("No data found")
- Match the tone to the context (serious for dashboards, friendly for consumer apps)

---

## 6. Overlay & Disclosure Components

### Modal
**Purpose:** Overlay element that requires user interaction before returning to the underlying page.

**Also called:** Dialog, Popup, Modal window

**Variants:** Alert dialog, Confirm dialog, Input/prompt dialog, Content modal

**Critical accessibility rules:**
- Use `<dialog>` element or `role="dialog"` + `aria-modal="true"`.
- Trap focus inside the modal while open.
- Return focus to the trigger element on close.
- Escape key must close the modal.
- Backdrop click closes the modal (optional but expected behavior).

**Content guidelines:**
- One task per modal.
- Clear, descriptive title.
- Primary and secondary action buttons with specific labels (not "OK" / "Cancel").
- Keep modals short — if content is long, reconsider using a Drawer or dedicated page.

---

### Drawer
*(See [Layout & Container Components → Drawer](#drawer) for full details.)*

---

### Popover
**Purpose:** Click-triggered floating container appearing above content; can contain interactive elements.

**Distinguished from Tooltip:** Popovers respond to click and can contain interactive content. Tooltips respond to hover and contain only descriptive text.

**Trigger rule:** "The trigger for your popover should trigger your popover and nothing else." Do not combine with links.

**Close triggers:** Escape, close button, outside click.

**ARIA:**
- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`
- Content: `role="dialog"` or `role="menu"` depending on context

**Future-proofing:** The native Popover API (`popover` / `popovertarget` attributes) is available in modern browsers. Consider progressive enhancement.

---

### Tooltip
**Purpose:** Display supplementary information about an element, typically on hover.

**Also called:** Toggletip, Infotip

**Distinguished from Popover:** Tooltips = hover-triggered, text-only, non-interactive. Popovers = click-triggered, can contain interactive elements.

**Design rules:**
- Content should be supplementary — never place critical information only in a tooltip.
- Short delay before show/hide to prevent accidental activation.
- Position to avoid viewport edges.

**ARIA:**
```html
<button aria-describedby="tip-1">Info</button>
<div role="tooltip" id="tip-1">This explains the action</div>
```

**Accessibility:** Triggered by both hover and focus. Touch devices cannot hover — ensure tooltip content is accessible another way.

---

### Accordion
*(See [Layout & Container Components → Accordion](#accordion) for full details.)*

---

## 7. Data Display Components

### Table
**Purpose:** Display structured data in rows and columns.

**Variants:**
| Variant | Use Case |
|---------|----------|
| Basic table | Simple, read-only data |
| Data table | Interactive (sort, filter, select) |
| Comparison table | Side-by-side feature matrices |
| Datagrid | Advanced: virtualization, inline editing |

**Accessibility:**
- Use `<th scope="col">` for column headers, `<th scope="row">` for row headers.
- Complex tables need `id` + `headers` attribute pairing.
- Provide `<caption>` describing the table's purpose.
- Keyboard navigation for interactive tables (sort/filter triggers must be focusable).

**UX patterns:**
- Alternating row colors (zebra striping) for readability.
- Sticky headers for long scrollable tables.
- Column sorting via clickable `<th>` with `aria-sort`.
- Always handle the empty/no-data state explicitly.

---

### List
**Purpose:** Display groups of related items.

**Types:**
- `<ul>` — Unordered list (items with no inherent sequence)
- `<ol>` — Ordered list (steps, ranked items)
- `<dl>` — Description list (term/definition pairs, metadata)

**Design rule:** Use the semantically correct list type. Do not use `<ul>` for visual bullet decoration only.

---

### Avatar
**Purpose:** Graphical user representation (photo, illustration, or initials).

**Variants:** Single avatar, Avatar pair, Avatar group/stack

**Design rules:**
- Provide `alt` text on image avatars (or `alt=""` if purely decorative alongside a name).
- For initial-based avatars, ensure text contrast meets WCAG AA.
- Consistent sizes in groups; use a counter badge ("+ 3 more") when space is limited.

---

### Badge
*(See [Feedback & Status Components → Badge](#badge) for full details.)*

---

### Quote
**Purpose:** Display quotation content (pull quote, block quote).

**HTML:**
```html
<blockquote cite="source-url">
  <p>"The crops were healthier than ever before."</p>
  <footer>— John Farmer, <cite>Iowa Agriculture Review</cite></footer>
</blockquote>
```
- Use `<blockquote>` for extended quotes.
- Use `<q>` for inline quotes.
- Attribute the source inside a `<footer>` within the blockquote.

---

### Heading
**Purpose:** Title or caption introducing content sections.

**Rules:**
- One `<h1>` per page.
- Never skip heading levels (h1 → h2 → h3, not h1 → h3).
- Heading hierarchy communicates page structure to screen readers.
- Do not use headings for visual styling — use CSS classes instead.

---

### Separator
**Purpose:** Visual divider between content sections.

```html
<hr aria-hidden="true">
```
- Use `aria-hidden="true"` if purely decorative.
- CSS alternatives: `border-top`, negative-margin tricks.

---

### Rating
*(See [Form & Input Components → Rating](#rating) for full details.)*

---

## 8. Media Components

### Carousel
**Purpose:** Display multiple content slides with only a subset visible at a time.

**Navigation methods:** Swipe, scroll, keyboard, on-screen buttons, pagination dots.

**Strong UX warnings:**
- Never use carousels for essential information — large user percentages miss carousel content.
- Auto-transitioning carousels must have play/pause controls.
- Pause on hover and focus.
- Respect `prefers-reduced-motion`.

**Accessibility:**
- Inactive slides: `inert` attribute or `aria-hidden="true"` + `tabindex="-1"`.
- Avoid infinite-loop designs that trap keyboard focus.
- Visible navigation buttons with sufficient color contrast over background images.

**Alternatives to consider first:**
- Grid layout (shows all content)
- Accordion (saves space, user-controlled)
- Scrollable row with CSS scroll snap

**CSS technique:** Use `scroll-snap-type` and `scroll-snap-align` for snap behavior with minimal JavaScript.

---

### Image
**Purpose:** Embed an image in content.

- Always provide `alt` text for informative images.
- Decorative images: `alt=""` (empty string, not omitted).
- Set explicit `width` and `height` attributes to prevent CLS.
- Use `loading="lazy"` for below-the-fold images.
- Prefer modern formats (WebP, AVIF) with `<picture>` fallback.

---

### Video
**Purpose:** Embed a video player with controls.

- Provide captions/subtitles for all video content (WCAG 1.2.2).
- Never autoplay with sound.
- Lazy-load YouTube/Vimeo embeds (use a thumbnail + click-to-load pattern to improve performance).
- `prefers-reduced-motion`: respect for any animated/autoplay video.

---

### Icon
**Purpose:** Graphic symbol providing visual indication or decorative support.

**Usage rules:**
- Decorative (alongside text label): `aria-hidden="true"`.
- Standalone (icon-only button): provide `aria-label` on the button.
- Icon meanings are not universally understood — always pair with text where possible.
- Use SVG for icons (scalable, stylable, accessible).

---

### File (Attachment/Download)
**Purpose:** Represent a file available for download or as an attachment.

- Indicate file type and size adjacent to the download link.
- Use descriptive link text ("Download Water Report PDF, 2.4MB") not "Click here".
- Consider `download` attribute on `<a>` tags for direct downloads.

---

## 9. Utility & Accessibility Components

### Skip Link
**Purpose:** Allow keyboard users to jump past repetitive navigation to main content.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
- Must be the first focusable element on the page.
- Visually hidden by default; visible on focus.
- Critical for keyboard-only and screen reader users.

---

### Visually Hidden
**Purpose:** Provide context for assistive technologies without affecting visual layout.

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
- Use for screen-reader-only labels, icon button text, supplementary context.
- Never use `display: none` or `visibility: hidden` — those hide from screen readers too.

---

### Link
**Purpose:** Navigate to another resource (internal or external).

- Use `<a href="...">` with a real URL — not `href="#"` with JavaScript.
- Descriptive link text: "View our water quality report" not "Click here".
- External links: consider `target="_blank"` with `rel="noopener noreferrer"` and an "(opens in new tab)" notice.
- Distinguish visited links visually where appropriate.

---

### Segmented Control
**Purpose:** Hybrid between button group, radio buttons, and tabs — switches between 2–5 options or views.

**Distinguish:**
- **Segmented control** → switches view or mode (like radio buttons)
- **Button group** → groups related but independent actions
- **Tabs** → switches between content panels in a tab-panel relationship

**Best for:** 2–5 tightly related options; mobile-friendly alternative to dropdowns.

---

### Button Group
**Purpose:** Wrapper for related buttons (toolbar).

- Use when buttons are thematically related (e.g., text formatting: Bold, Italic, Underline).
- Can use `role="group"` with `aria-label` to communicate grouping to screen readers.

---

### Footer
**Purpose:** Bottom page element for copyright, legal, and secondary navigation.

- Include `<footer>` element (landmark).
- Group secondary links (Privacy Policy, Terms, Contact) here.
- Never put primary CTA actions only in the footer.

---

### Header
**Purpose:** Top page element containing site identity and primary navigation.

- Use `<header>` element (landmark).
- Typically contains: logo, primary nav, and utility actions (search, account, cart).
- Should remain accessible during scroll (sticky headers need careful z-index and focus management).

---

## 10. Component Quick Reference

| Component | Element | Key ARIA | Keyboard |
|-----------|---------|----------|----------|
| Accordion | `<button>` in `<h*>` | `aria-expanded`, `aria-controls` | Enter/Space |
| Alert | `<div>` | `role="alert"` or `role="status"` | — |
| Avatar | `<img>` | `alt` | — |
| Badge | `<span>` | — | — |
| Breadcrumbs | `<nav><ol>` | `aria-label`, `aria-current="page"` | Tab |
| Button | `<button>` | `aria-label` (icon-only) | Enter/Space |
| Card | `<article>` or `<div>` | Heading within | Tab |
| Carousel | `<ul>` | `aria-roledescription`, `aria-label` | Arrows, Enter |
| Checkbox | `<input type="checkbox">` | `aria-checked` (custom) | Space |
| Combobox | `<input>` | `role="combobox"`, `aria-expanded` | Arrows, Enter, Escape |
| Datepicker | `<dialog>` | `role="dialog"`, calendar grid ARIA | Arrows, Enter, Escape |
| Drawer | `<dialog>` | `role="dialog"`, `aria-modal` | Escape |
| Dropdown Menu | `<button>` + `<ul>` | `aria-haspopup`, `aria-expanded` | Arrows, Enter, Escape |
| Empty State | `<div>` | — | — |
| File Upload | `<input type="file">` | — | Enter/Space |
| Form | `<form>` | — | Enter (submit) |
| Header | `<header>` | — | Tab |
| Heading | `<h1>`–`<h6>` | — | — |
| Hero | `<section>` | — | — |
| Icon | `<svg>` | `aria-hidden="true"` (decorative) | — |
| Label | `<label>` | `for` attribute | — |
| Link | `<a href>` | — | Enter |
| List | `<ul>`, `<ol>`, `<dl>` | — | — |
| Modal | `<dialog>` | `role="dialog"`, `aria-modal` | Escape |
| Navigation | `<nav>` | `aria-label`, `aria-current` | Tab |
| Pagination | `<nav><ol>` | `aria-label`, `aria-current="page"` | Tab, Enter |
| Popover | `<div>` | `role="dialog"`, `aria-haspopup` | Enter, Escape |
| Progress Bar | `<progress>` | `aria-label`, `aria-valuenow` | — |
| Radio Button | `<input type="radio">` | `role="radiogroup"` on group | Arrows |
| Rating | `<fieldset>` | `role="radiogroup"` | Arrows |
| Search Input | `<input type="search">` | `role="search"` on form | Enter |
| Segmented Control | `<div>` | `role="radiogroup"` | Arrows |
| Select | `<select>` | — | Arrows, Enter |
| Separator | `<hr>` | `aria-hidden="true"` | — |
| Skeleton | `<div>` | `aria-live` on container | — |
| Skip Link | `<a href="#main">` | — | Tab, Enter |
| Slider | `<input type="range">` | `aria-valuemin/max/now` | Arrows, Home/End |
| Spinner | `<div>` | `role="status"`, `aria-label` | — |
| Stack | `<div>` | — | — |
| Stepper | `<div>` + buttons | `aria-label`, live region | Enter/Space |
| Table | `<table>` | `<caption>`, `scope` on `<th>` | Tab, Arrows |
| Tabs | `<div role="tablist">` | `role="tab"`, `aria-selected` | Arrows, Tab |
| Textarea | `<textarea>` | `aria-describedby` | — |
| Text Input | `<input type="text">` | `aria-describedby`, `aria-invalid` | — |
| Toast | `<div>` | `aria-live="polite"` | — |
| Toggle | `<button>` | `role="switch"`, `aria-checked` | Space |
| Tooltip | `<div role="tooltip">` | `aria-describedby` on trigger | Focus |
| Tree View | `<ul role="tree">` | `role="treeitem"`, `aria-expanded` | Arrows, Enter |
| Visually Hidden | `<span>` | — | — |

---

## Appendix: Design System References

These design systems were most cited across the gallery for accessibility and documentation quality:

| Design System | Organization | Strength |
|---------------|-------------|----------|
| **Carbon** | IBM | Multi-framework, comprehensive |
| **Polaris** | Shopify | Tone of voice + accessibility |
| **Atlassian DS** | Atlassian | Usage guidelines depth |
| **Material Design** | Google | Pattern definitions |
| **Spectrum** | Adobe | Accessibility patterns |
| **Fluent UI** | Microsoft | Enterprise accessibility |
| **PatternFly** | Red Hat | Data-heavy interfaces |
| **GOV.UK DS** | UK Government | Semantic HTML, tested with users |
| **NHS DS** | NHS | Accessibility research-backed |
| **Inclusive Components** | Heydon Pickering | Gold standard for accessibility patterns |

---

*Last updated: March 2026. Source: [component.gallery/components](https://component.gallery/components/)*
