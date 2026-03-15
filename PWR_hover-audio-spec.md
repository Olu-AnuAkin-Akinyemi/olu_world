# PWR Cover Art — Hover Audio Spec

## What to Export
A 2-4 second ambient moment from the PWR session. Ideas:

- An intro pad or synth wash
- A reverb tail from a vocal or chord
- Any sustained atmospheric texture

## Export Specs
- **Format:** MP3 or WAV (will be optimized for web)
- **Channels:** Mono is fine (saves file size)
- **Fades:** Apply fade in and fade out in the DAW (smoother than code-based fades)
- **Vibe:** Subtle — this plays quietly on hover over the cover art, not a featured playback moment
- **Looping:** Something that loops cleanly is a bonus but not required
- **Duration:** 2-4 seconds max

## How It Will Be Used
- Fades in when the user hovers over the PWR cover art in the hero section
- Fades out when the mouse leaves
- Capped at ~20-30% volume
- Target file size: under 30KB after compression

## Drop Location
Save the exported file to `src/assets/` (e.g., `PWR_hover-tone.mp3`)
