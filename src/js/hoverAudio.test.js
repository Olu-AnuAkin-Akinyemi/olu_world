import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHoverAudio } from './hoverAudio.js';

/* ── Web Audio API mock ─────────────────────────────────────── */

function mockGainNode() {
  return {
    gain: {
      value: 0,
      cancelScheduledValues: vi.fn(),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
}

function mockSourceNode() {
  const src = {
    buffer: null,
    loop: false,
    onended: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return src;
}

function mockAudioContext(gain, source) {
  return {
    currentTime: 0,
    createGain: vi.fn(() => gain),
    createBufferSource: vi.fn(() => source),
    decodeAudioData: vi.fn(async (buf) => buf),
    close: vi.fn(),
    destination: {},
  };
}

const fakeBuffer = new ArrayBuffer(8);

function setupGlobals(audioCtxInstance) {
  vi.stubGlobal('AudioContext', vi.fn(() => audioCtxInstance));

  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => fakeBuffer,
  })));
}

/* ── Tests ──────────────────────────────────────────────────── */

describe('createHoverAudio', () => {
  let gain, source, ctx, onEnded;

  beforeEach(() => {
    vi.useFakeTimers();
    gain = mockGainNode();
    source = mockSourceNode();
    ctx = mockAudioContext(gain, source);
    onEnded = vi.fn();
    setupGlobals(ctx);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /* ── Initialization ────────────────────────────────────── */

  it('init fetches audio and creates AudioContext', async () => {
    const ha = createHoverAudio('/test.mp3');
    const ok = await ha.init();
    expect(ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/test.mp3');
    expect(ctx.decodeAudioData).toHaveBeenCalled();
    expect(gain.connect).toHaveBeenCalledWith(ctx.destination);
  });

  it('init is idempotent — second call reuses existing context', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    await ha.init();
    // AudioContext constructor called only once
    expect(AudioContext).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('init returns false on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const ha = createHoverAudio('/missing.mp3');
    const ok = await ha.init();
    expect(ok).toBe(false);
  });

  it('init returns false after dispose', async () => {
    const ha = createHoverAudio('/test.mp3');
    ha.dispose();
    const ok = await ha.init();
    expect(ok).toBe(false);
  });

  /* ── Start / play ──────────────────────────────────────── */

  it('start creates a buffer source, connects it, and starts playback', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    ha.start();
    expect(ctx.createBufferSource).toHaveBeenCalled();
    expect(source.connect).toHaveBeenCalledWith(gain);
    expect(source.loop).toBe(false);
    expect(source.start).toHaveBeenCalled();
    expect(ha.isPlaying()).toBe(true);
  });

  it('start fades gain from 0 to HOVER_VOL', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    ha.start();
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(gain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.25, 0.4);
  });

  it('start is a no-op before init', () => {
    const ha = createHoverAudio('/test.mp3');
    ha.start(); // should not throw
    expect(ha.isPlaying()).toBe(false);
  });

  it('start is a no-op if already playing (prevents double-trigger)', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();

    ha.start();
    const callCount = ctx.createBufferSource.mock.calls.length;
    ha.start(); // should be ignored

    // No new buffer source created
    expect(ctx.createBufferSource).toHaveBeenCalledTimes(callCount);
    expect(ha.isPlaying()).toBe(true);
  });

  /* ── onEnded callback ──────────────────────────────────── */

  it('fires onEnded when clip finishes naturally', async () => {
    const ha = createHoverAudio('/test.mp3', { onEnded });
    await ha.init();
    ha.start();
    expect(ha.isPlaying()).toBe(true);

    // Simulate Web Audio firing onended
    source.onended();

    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(ha.isPlaying()).toBe(false);
  });

  it('does not fire onEnded when stopped manually', async () => {
    const ha = createHoverAudio('/test.mp3', { onEnded });
    await ha.init();
    ha.start();

    // Capture the onended callback before stop nulls sourceNode
    const stoppedOnended = source.onended;
    ha.stop();

    expect(ha.isPlaying()).toBe(false);

    // Simulate browser firing onended after source.stop() in setTimeout
    vi.advanceTimersByTime(1000);
    stoppedOnended(); // Browser fires this — should be ignored

    expect(onEnded).not.toHaveBeenCalled();
  });

  /* ── Stop / fade out ───────────────────────────────────── */

  it('stop fades gain to 0 and schedules source.stop', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    ha.start();
    ha.stop();

    expect(gain.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 0.6);
    expect(ha.isPlaying()).toBe(false);

    // source.stop called after FADE_OUT delay
    expect(source.stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(700);
    expect(source.stop).toHaveBeenCalled();
  });

  it('stop is safe to call when nothing is playing', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    ha.stop(); // should not throw
    expect(ha.isPlaying()).toBe(false);
  });

  it('stop is safe to call before init', () => {
    const ha = createHoverAudio('/test.mp3');
    ha.stop(); // should not throw
  });

  /* ── Dispose ───────────────────────────────────────────── */

  it('dispose closes AudioContext and prevents further use', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();
    ha.start();
    ha.dispose();

    expect(ctx.close).toHaveBeenCalled();
    expect(ha.isPlaying()).toBe(false);

    // Further calls are no-ops
    ha.start();
    expect(ha.isPlaying()).toBe(false);
  });

  /* ── Edge cases ────────────────────────────────────────── */

  it('works with webkitAudioContext fallback', async () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', vi.fn(() => ctx));

    const ha = createHoverAudio('/test.mp3');
    const ok = await ha.init();
    expect(ok).toBe(true);
  });

  it('start after stop creates a fresh source', async () => {
    const ha = createHoverAudio('/test.mp3');
    await ha.init();

    const firstSource = mockSourceNode();
    const secondSource = mockSourceNode();
    ctx.createBufferSource
      .mockReturnValueOnce(firstSource)
      .mockReturnValueOnce(secondSource);

    ha.start();
    ha.stop();
    vi.advanceTimersByTime(700);

    ha.start();
    expect(secondSource.start).toHaveBeenCalled();
    expect(ha.isPlaying()).toBe(true);
  });
});
