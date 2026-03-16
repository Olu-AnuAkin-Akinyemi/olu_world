/**
 * Hover / tap audio for the hero cover art.
 *
 * Desktop — plays on mouseenter, fades out on mouseleave or when clip ends.
 * Mobile  — plays on tap, glow resets when clip finishes.
 *
 * Uses Web Audio API for smooth gain-based fades.
 */

const HOVER_VOL = 0.25;
const FADE_IN   = 0.4;   // seconds
const FADE_OUT  = 0.6;   // seconds

/**
 * Create a hover-audio controller bound to a given audio source URL.
 * Returns { init, start, stop, dispose } — all safe to call multiple times.
 *
 * @param {string} audioUrl  URL (or import.meta asset path) of the audio clip
 * @param {object} [opts]
 * @param {() => void} [opts.onEnded]  Called when clip finishes naturally
 */
export function createHoverAudio(audioUrl, opts = {}) {
  let audioCtx  = null;
  let gainNode   = null;
  let audioBuffer = null;
  let sourceNode  = null;
  let disposed    = false;

  async function init() {
    if (disposed) return false;
    if (audioCtx) return true;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(audioCtx.destination);
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      audioBuffer = await audioCtx.decodeAudioData(await res.arrayBuffer());
      return true;
    } catch {
      audioCtx = null;
      return false;
    }
  }

  function start() {
    if (!audioCtx || !audioBuffer || disposed) return;
    // If already playing, don't restart
    if (sourceNode) return;

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = false;
    sourceNode.connect(gainNode);

    // Fade in
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(HOVER_VOL, audioCtx.currentTime + FADE_IN);

    const src = sourceNode;
    sourceNode.onended = () => {
      // Only fire onEnded if this source is still the active one (not manually stopped)
      if (sourceNode === src) {
        sourceNode = null;
        opts.onEnded?.();
      }
    };
    sourceNode.start();
  }

  function stop() {
    if (!audioCtx || !sourceNode) return;
    // Fade out then stop
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + FADE_OUT);
    const src = sourceNode;
    sourceNode = null;  // Detach before stop — prevents onended from firing onEnded callback
    setTimeout(() => { try { src.stop(); } catch {} }, FADE_OUT * 1000 + 50);
  }

  /** True while a source is actively playing */
  function isPlaying() {
    return sourceNode !== null;
  }

  function dispose() {
    disposed = true;
    stop();
    if (audioCtx) { try { audioCtx.close(); } catch {} }
    audioCtx = null;
    audioBuffer = null;
  }

  return { init, start, stop, isPlaying, dispose };
}
