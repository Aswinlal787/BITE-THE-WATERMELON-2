/**
 * Soft, generative ambient background music.
 * No audio files are shipped — everything is synthesized at runtime with
 * the Web Audio API, so there is nothing to license, fetch, or break.
 *
 * A slow, detuned sine pad drifts through a loop of gentle chords, with a
 * touch of filtered noise "shimmer" underneath, all kept at a low, cozy
 * volume. Starts muted; only begins after a user gesture (autoplay policy).
 */
const WatermelonAudio = (() => {
  let ctx = null;
  let masterGain = null;
  let filter = null;
  let noiseGain = null;
  let running = false;
  let muted = true;
  let chordTimer = null;
  let chordIndex = 0;

  // A calm, slightly wistful loop (i - VI - III - VII in a minor-leaning key)
  const CHORDS = [
    [130.81, 164.81, 196.0, 261.63],   // C3 E3 G3 C4
    [116.54, 146.83, 174.61, 233.08],  // A#2 D3 F3 A#3
    [155.56, 196.0, 233.08, 311.13],   // D#3 G3 A#3 D#4
    [174.61, 220.0, 261.63, 349.23]    // F3 A3 C4 F4
  ];
  const CHORD_DURATION = 7.5; // seconds

  function ensureContext() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0; // starts silent; fades in on unmute

    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.3;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Gentle filtered noise bed for texture
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.25;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 0.6;

    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.015;

    noiseSource.connect(noiseFilter).connect(noiseGain).connect(masterGain);
    noiseSource.start();
  }

  function playChord(freqs, duration) {
    const now = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? -4 : 4);

      const g = ctx.createGain();
      const peak = 0.05 - i * 0.006;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(Math.max(peak, 0.012), now + duration * 0.35);
      g.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(g).connect(filter);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  function scheduleLoop() {
    if (!running) return;
    playChord(CHORDS[chordIndex % CHORDS.length], CHORD_DURATION);
    chordIndex++;
    chordTimer = setTimeout(scheduleLoop, CHORD_DURATION * 1000 * 0.92);
  }

  function start() {
    ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!running) {
      running = true;
      scheduleLoop();
    }
  }

  function setMuted(next) {
    muted = next;
    if (!ctx) return;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.55, now + 0.8);
  }

  function toggle() {
    start();
    setMuted(!muted);
    return !muted;
  }

  function isMuted() {
    return muted;
  }

  return { start, toggle, isMuted, setMuted };
})();
