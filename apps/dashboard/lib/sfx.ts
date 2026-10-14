/**
 * Web Audio API Sound Synthesizer — Employr (AmbilCUTI)
 * Menghasilkan nada notifikasi lembut tanpa dependensi file eksternal (0 KB asset size).
 * Aman dari browser autoplay policy (fails gracefully).
 */

const STORAGE_KEY = 'employr_sound_notifications_enabled';

/**
 * Cek apakah preferensi suara diaktifkan oleh pengguna (default: true).
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

/**
 * Simpan preferensi suara pengguna.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('employr_sound_setting_changed', { detail: { enabled } })
    );
  } catch {}
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Memutar nada notifikasi "berhasil/selesai" (Soft Modern Chime - E6 ke A6)
 * @param volume Tingkat suara (default 0.1 / 10% agar lembut dan tidak mengejutkan)
 * @param force Paksa putar meskipun setting suara dimatikan (misal untuk tombol uji coba)
 */
export function playSuccessChime(volume = 0.1, force = false) {
  if (!force && !isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- Nada Pertama: E6 (1318.5 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);

    // Envelope lembut: attack cepat, decay natural
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.8, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.13);

    // --- Nada Kedua: A6 (1760 Hz) + Harmonik Kehangatan ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760.0, now + 0.08);

    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(volume, now + 0.095);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch {
    // Silent fail jika browser melarang pemutaran audio otomatis
  }
}

/**
 * Alternatif: Memutar dari file fisik /sounds/notification.wav jika browser mendukung
 */
export function playWavNotification(volume = 0.15, force = false) {
  if (typeof window === 'undefined') return;
  if (!force && !isSoundEnabled()) return;

  try {
    const audio = new Audio('/sounds/notification.wav');
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
      // Fallback ke Web Audio API sintetis jika pemutaran audio file diblokir
      playSuccessChime(volume, force);
    });
  } catch {
    playSuccessChime(volume, force);
  }
}
