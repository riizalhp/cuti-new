/**
 * Validasi cepat paket @cuti/faq:
 *   npx tsx scripts/validate.ts  (dari packages/faq)
 * Memeriksa: jumlah artikel, kategori valid, slug unik, frontmatter lengkap,
 * dan hasil pencarian untuk beberapa query umum.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.join(__dirname, ".."));

const faq = await import("../src/index.ts");

const { loadArticles, FAQ_CATEGORIES, searchFaq, renderMarkdown } = faq;

const articles = loadArticles();
console.log(`\n📚 ${articles.length} artikel dimuat`);

const categorySlugs = new Set(FAQ_CATEGORIES.map((c) => c.slug));
const slugs = new Set<string>();
let errors = 0;

for (const a of articles) {
  if (!a.title) { console.log(`✗ ${a.slug}: title kosong`); errors++; }
  if (!a.description) { console.log(`✗ ${a.slug}: description kosong`); errors++; }
  if (!categorySlugs.has(a.category)) { console.log(`✗ ${a.slug}: kategori tidak dikenal '${a.category}'`); errors++; }
  if (slugs.has(a.slug)) { console.log(`✗ slug duplikat: ${a.slug}`); errors++; }
  slugs.add(a.slug);
  if (!renderMarkdown(a.body).trim()) { console.log(`✗ ${a.slug}: body tidak ter-render`); errors++; }
}

// Pastikan setiap kategori punya minimal 1 artikel
for (const c of FAQ_CATEGORIES) {
  const count = articles.filter((a) => a.category === c.slug).length;
  if (count === 0) { console.log(`✗ kategori ${c.slug}: 0 artikel`); errors++; }
  else console.log(`  ${c.label.padEnd(24)} ${count} artikel`);
}

console.log("\n🔎 Uji pencarian:");
const queries = [
  "cara cetak CV ke PDF",
  "bagaimana cara download cv saya",
  "tracker lamaran kerja",
  "cara tambah lamaran baru",
  "kode voucher promo pembayaran",
  "check in harian misi koin",
  "cara login daftar akun",
  "lupa password",
  "jasa cv dibuatkan hrd",
  "skor ats biar naik",
  "pembayaran qris",
  "referral ajak teman",
  "zzzz tidak ada kata ini",
  "asdfghjkl qwerty",
];
for (const q of queries) {
  const r = searchFaq(q, 2);
  const top = r.hits[0];
  console.log(
    `  "${q}" → ${r.answered ? "✅" : "⚠️"} ${top ? `${top.article.title} (${(top.score * 100).toFixed(1)}%)` : "tidak ada hit"}`
  );
}

console.log(`\n${errors === 0 ? "✅ SEMUA VALID" : `❌ ${errors} ERROR`}`);
process.exit(errors === 0 ? 0 : 1);
