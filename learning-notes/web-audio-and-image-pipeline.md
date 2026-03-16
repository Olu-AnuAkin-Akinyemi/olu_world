# Web Audio API — Hover/Tap Audio on Cover Art

## The Pattern

Play a short ambient audio clip when the user interacts with an element. Desktop uses hover, mobile uses tap. The clip plays once, then the visual effect resets.

## Web Audio API vs `<audio>` Element

We used the Web Audio API instead of an `<audio>` tag. Here's why:

| | `<audio>` element | Web Audio API |
|---|---|---|
| Volume fade | No native support — need `setInterval` to step volume | Built-in `linearRampToValueAtTime` on gain node |
| Latency | Noticeable delay on first play | Buffer is pre-decoded, plays instantly |
| Control | Play/pause/volume | Full audio graph — gain, filters, panning, mixing |
| Setup | One line of HTML | Requires `AudioContext`, `BufferSource`, `GainNode` |

**Rule of thumb:** Use `<audio>` for music playback with controls. Use Web Audio API for sound effects, ambient audio, or anything needing precise timing/fading.

## Architecture

```
AudioContext → BufferSource → GainNode → destination (speakers)
```

1. **AudioContext** — created once, reused. This is the audio engine.
2. **fetch + decodeAudioData** — loads the MP3 into a raw audio buffer. Done once on first interaction.
3. **BufferSource** — created fresh each time you play. These are single-use (Web Audio spec requirement).
4. **GainNode** — persistent volume knob. Fade in/out by ramping `gain.value` over time.

## Key Lessons

### BufferSource nodes are single-use

You cannot call `start()` twice on the same `BufferSource`. You must create a new one each time:

```js
// WRONG — throws InvalidStateError
source.start();
source.start();

// RIGHT — new source each play
source1 = ctx.createBufferSource();
source1.start();
// later...
source2 = ctx.createBufferSource();
source2.start();
```

### Gain ramping for smooth fades

```js
// Fade in: 0 → 0.25 over 0.4 seconds
gainNode.gain.setValueAtTime(0, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.4);

// Fade out: current value → 0 over 0.6 seconds
gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
```

Always call `cancelScheduledValues` before scheduling new ramps — otherwise they queue up and conflict.

### The `onended` identity trap

When you manually stop a source, the browser still fires `onended`. If your callback resets UI state, it will fire incorrectly:

```js
// PROBLEM: onended fires after manual stop, resetting the glow
sourceNode.onended = () => {
  resetGlow(); // fires even on manual stop!
};

// FIX: capture a reference, check identity
const src = sourceNode;
sourceNode.onended = () => {
  if (sourceNode === src) {  // only if this source ended naturally
    resetGlow();
  }
};

function stop() {
  sourceNode = null;  // detach before stopping
  setTimeout(() => src.stop(), 650);
  // onended fires, but sourceNode !== src, so callback is ignored
}
```

### Mobile browsers simulate mouse events

A single tap on mobile fires: `touchstart` → `touchend` → `mouseenter` → `click`.

If you attach listeners to both `mouseenter` and `click`, your handler runs twice:

```js
// WRONG — double-fires on mobile
el.addEventListener('mouseenter', play);
el.addEventListener('click', play);

// RIGHT — gate by input type
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) {
  el.addEventListener('click', play);
} else {
  el.addEventListener('mouseenter', play);
  el.addEventListener('mouseleave', stop);
}
```

Also add a guard in the play function itself as a safety net:

```js
function start() {
  if (sourceNode) return; // already playing
  // ...create and start
}
```

---

# Image Optimization — PNG Transparency and Format Conversion

## The Problem

Converting a PNG with transparency (alpha channel) to WebP can silently drop the alpha. The image renders with a solid background instead of transparency.

## How to catch it

Sharp's output tells you the channel count:

```
channels: 3  ← RGB only, alpha LOST
channels: 4  ← RGBA, alpha preserved
```

Always check the output metadata when converting PNGs that might have transparency.

## How to preserve it

```js
// Explicit alphaQuality ensures the alpha channel is preserved
await sharp('input.png')
  .resize(520)
  .webp({ quality: 80, effort: 6, alphaQuality: 100 })
  .toFile('output.webp');
```

## When this matters

Any image where the design relies on layering — like our cover art with a transparent text overlay on top of a base artwork. The two layers are separate files composited via CSS:

```css
.cover-base { background: url('no-words.webp') center/cover; }
.cover-words { background: url('just-words.webp') center/cover; } /* needs transparency */
```

## Quality tiers

Not all images deserve the same compression:

| Type | Quality | Why |
|------|---------|-----|
| Professional photography | q80 | Preserve detail, skin tones |
| Digital art / collages | q80 | Bumped from q75 — art deserves higher fidelity |
| Logos / icons | q80 | Small files anyway, keep sharp edges |
| OG / social images | q85 | Shared externally, no control over re-compression |

## Non-destructive pipeline

The current script overwrites originals. This is dangerous:

```
Original (4MB) → sharp → Compressed (7KB) → sharp again → Further degraded (worse quality, same size)
```

The fix (Phase 1 of our spec): generate variants alongside originals:

```
photo.png           ← untouched original
photo-400.webp      ← mobile grid
photo-800.webp      ← desktop grid
photo-1200.webp     ← overlay / retina
```

Rule: **always compress from the original source, never from a previously compressed file.**
