import type { FaqCategory } from "./types";

/**
 * Kategori artikel di Pusat Bantuan (FAQ) Employr.
 * Urutan array ini menentukan urutan tampilan di situs FAQ.
 */
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    slug: "memulai",
    label: "Memulai",
    description:
      "Kenali Employr, buat akun, selesaikan onboarding, dan lengkapi profilmu.",
  },
  {
    slug: "cv-dokumen",
    label: "CV & Dokumen",
    description:
      "Buat CV ATS, cetak PDF, pahami skor ATS, layanan CV by HRD, dan surat lamaran.",
  },
  {
    slug: "evaluasi-optimasi",
    label: "Evaluasi & Optimasi",
    description:
      "Evaluasi CV dengan persona recruiter, cek kecocokan lowongan, dan optimasi LinkedIn.",
  },
  {
    slug: "lamaran-kerja",
    label: "Lamaran Kerja",
    description:
      "Kelola tracker lamaran, scan lowongan dari banyak portal, dan persiapan interview.",
  },
  {
    slug: "misi-reward",
    label: "Misi, Reward & Referral",
    description:
      "Kumpulkan Koin & XP lewat misi, check-in harian, dan ajak teman lewat referral.",
  },
  {
    slug: "pengembangan-karier",
    label: "Pengembangan Karier",
    description:
      "Ukur Career Readiness, ikuti kursus & sertifikasi, dan latihan soal.",
  },
  {
    slug: "membership-pembayaran",
    label: "Membership & Pembayaran",
    description:
      "Pilih paket keanggotaan, metode pembayaran, dan pakai voucher promo.",
  },
  {
    slug: "akun-bantuan",
    label: "Akun & Bantuan",
    description:
      "Keamanan akun, kendala umum yang sering terjadi, dan cara menghubungi Customer Service.",
  },
];

const CATEGORY_MAP = new Map(FAQ_CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): FaqCategory {
  return (
    CATEGORY_MAP.get(slug) ?? {
      slug,
      label: slug,
      description: "",
    }
  );
}

export function getCategoryLabel(slug: string): string {
  return getCategory(slug).label;
}
