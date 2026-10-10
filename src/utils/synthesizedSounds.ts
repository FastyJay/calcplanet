// Generates valid WAV data URIs using Web Audio mathematics
// Zero external network dependencies, 100% reliable playback

function createWavDataUri(samples: Float32Array, sampleRate: number = 44100): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Convert buffer to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// 1. MLG Airhorn Sound Generator
export function generateAirhornWav(): string {
  const sampleRate = 44100;
  const duration = 1.35;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  // Airhorn bursts
  const bursts = [
    { start: 0.0, end: 0.22, freq: 466.16 }, // Bb4
    { start: 0.26, end: 0.48, freq: 466.16 },
    { start: 0.52, end: 1.25, freq: 466.16 },
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const b of bursts) {
      if (t >= b.start && t <= b.end) {
        const localT = t - b.start;
        const burstDur = b.end - b.start;
        
        // Characteristic multi-harmonic buzz with slight pitch wobble
        const wobble = 1 + 0.03 * Math.sin(localT * 45);
        const f0 = b.freq * wobble;
        
        // Multi-oscillator brass wave (saw + square harmonics)
        const harm1 = Math.sin(2 * Math.PI * f0 * localT);
        const harm2 = 0.7 * Math.sin(2 * Math.PI * f0 * 1.5 * localT);
        const harm3 = 0.5 * Math.sin(2 * Math.PI * f0 * 2 * localT);
        const harm4 = 0.4 * Math.sin(2 * Math.PI * f0 * 3 * localT);
        const harm5 = 0.3 * (Math.sin(2 * Math.PI * f0 * 4 * localT) > 0 ? 1 : -1);
        
        let env = 1;
        if (localT < 0.03) env = localT / 0.03;
        else if (localT > burstDur - 0.06) env = (burstDur - localT) / 0.06;

        sample += (harm1 + harm2 + harm3 + harm4 + harm5) * 0.25 * env;
      }
    }
    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

// 2. Vine Boom / Heavy 808 Bass Impact
export function generateVineBoomWav(): string {
  const sampleRate = 44100;
  const duration = 1.6;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Fast pitch drop from 140Hz to 32Hz
    const pitch = 32 + 108 * Math.exp(-t * 8);
    const sub = Math.sin(2 * Math.PI * pitch * t);
    
    // Distorted punch at the start
    const punch = Math.exp(-t * 22) * (Math.random() * 2 - 1) * 0.5;
    const body = Math.tanh((sub + punch) * 2.2);
    const env = Math.exp(-t * 2.5);

    samples[i] = body * env * 0.85;
  }

  return createWavDataUri(samples, sampleRate);
}

// 3. Retro Coin Sound (Super Mario style)
export function generateCoinWav(): string {
  const sampleRate = 44100;
  const duration = 0.55;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.08) {
      // First tone (B5 ~ 987.77 Hz)
      const square = Math.sin(2 * Math.PI * 987.77 * t) > 0 ? 1 : -1;
      sample = square * 0.35;
    } else {
      // Second tone (E6 ~ 1318.51 Hz)
      const t2 = t - 0.08;
      const square = Math.sin(2 * Math.PI * 1318.51 * t2) > 0 ? 1 : -1;
      const env = Math.exp(-t2 * 6.5);
      sample = square * 0.4 * env;
    }

    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

// 4. Level Up Arpeggio
export function generateLevelUpWav(): string {
  const sampleRate = 44100;
  const duration = 0.95;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  // Arpeggio notes: C5, E5, G5, C6, G5, C6
  const notes = [
    { start: 0.0, end: 0.12, freq: 523.25 },
    { start: 0.12, end: 0.24, freq: 659.25 },
    { start: 0.24, end: 0.36, freq: 783.99 },
    { start: 0.36, end: 0.50, freq: 1046.50 },
    { start: 0.50, end: 0.62, freq: 783.99 },
    { start: 0.62, end: 0.95, freq: 1046.50 },
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const n of notes) {
      if (t >= n.start && t <= n.end) {
        const localT = t - n.start;
        const dur = n.end - n.start;
        // Chiptune pulse wave
        const wave = Math.sin(2 * Math.PI * n.freq * localT) + 0.3 * Math.sin(4 * Math.PI * n.freq * localT);
        let env = 1;
        if (localT > dur - 0.04) env = (dur - localT) / 0.04;
        sample += wave * 0.3 * env;
      }
    }
    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

// 5. Tada Victory Fanfare
export function generateVictoryWav(): string {
  const sampleRate = 44100;
  const duration = 1.2;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  const notes = [
    { start: 0.0, end: 0.15, freq: 587.33 }, // D5
    { start: 0.15, end: 0.30, freq: 587.33 }, // D5
    { start: 0.30, end: 0.45, freq: 587.33 }, // D5
    { start: 0.45, end: 1.15, freq: 880.00 }, // A5
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const n of notes) {
      if (t >= n.start && t <= n.end) {
        const localT = t - n.start;
        const dur = n.end - n.start;
        const brass = Math.sin(2 * Math.PI * n.freq * localT) + 
                      0.5 * Math.sin(2 * Math.PI * n.freq * 2 * localT) +
                      0.3 * Math.sin(2 * Math.PI * n.freq * 3 * localT);
        let env = Math.min(1, localT / 0.02) * Math.min(1, (dur - localT) / 0.08);
        sample += brass * 0.28 * env;
      }
    }
    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

// 6. Laser Zap Sound
export function generateLaserWav(): string {
  const sampleRate = 44100;
  const duration = 0.45;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Rapid exponential pitch dive from 2400Hz to 120Hz
    const freq = 120 + 2280 * Math.exp(-t * 14);
    const wave = Math.sin(2 * Math.PI * freq * t);
    const env = Math.exp(-t * 6);
    samples[i] = wave * env * 0.45;
  }

  return createWavDataUri(samples, sampleRate);
}

// 7. Warning Siren
export function generateSirenWav(): string {
  const sampleRate = 44100;
  const duration = 1.5;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Oscillating alarm frequency
    const freq = 750 + 250 * Math.sin(2 * Math.PI * 2.5 * t);
    const square = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.7 : -0.7;
    const sine = Math.sin(2 * Math.PI * freq * t) * 0.3;
    const env = t < 1.3 ? 1 : (1.5 - t) / 0.2;
    samples[i] = (square + sine) * 0.35 * env;
  }

  return createWavDataUri(samples, sampleRate);
}
