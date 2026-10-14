/**
 * Client Notification & Attention Helper — Employr
 * Menangani feedback visual & audio saat proses panjang (ekstraksi, analisis) selesai.
 */
import { playSuccessChime } from './sfx';

export interface ProcessCompleteNotifyOptions {
  /** Putar audio chime lembut jika tab sedang di latar belakang? (default: true) */
  soundOnBackground?: boolean;
  /** Ubah judul tab browser jika user sedang alt-tab? (default: true) */
  flashTabTitle?: boolean;
}

/**
 * Panggil fungsi ini saat proses async (LinkedIn, CV Screener, Match) selesai di frontend.
 */
export function notifyProcessCompletion(
  _title = 'Analisis Selesai',
  options: ProcessCompleteNotifyOptions = {}
) {
  if (typeof window === 'undefined') return;

  const { soundOnBackground = true, flashTabTitle = true } = options;
  const isBackgroundTab = typeof document !== 'undefined' && document.hidden;

  // 1. Audio Chime (Hanya diputar atau diprioritaskan saat tab sedang di latar belakang agar tidak mengagetkan)
  if (!soundOnBackground || isBackgroundTab) {
    playSuccessChime(0.08); // 8% volume, sangat lembut
  }

  // 2. Tab Title Alert (Flash judul tab jika user sedang alt-tab)
  if (flashTabTitle && isBackgroundTab) {
    const originalTitle = document.title;
    document.title = `(1) Selesai! • ${originalTitle}`;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = originalTitle;
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // 3. Trigger revalidasi lonceng header agar angka notifikasi langsung ter-update
  window.dispatchEvent(new CustomEvent('notification:refresh'));
}
