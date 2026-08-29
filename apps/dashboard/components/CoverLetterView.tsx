'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { userApi } from '@/lib/api';
import {
  Mail,
  Sparkles,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  FileText,
  Send,
  Building,
  UserCheck,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

interface SavedCoverLetter {
  id: string;
  company: string;
  position: string;
  date: string;
  content: string;
}

const initialSavedLetters: SavedCoverLetter[] = [];

export const CoverLetterView: React.FC = () => {
  const toast = useToast();
  const [savedLetters, setSavedLetters] = useState<SavedCoverLetter[]>(initialSavedLetters);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [experienceHighlights, setExperienceHighlights] = useState('');
  const [tone, setTone] = useState<'Formal (Bahasa Indonesia)' | 'Professional (English)' | 'Persuasif & Antusias'>('Formal (Bahasa Indonesia)');

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic user name
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        setUserName(profile.fullName || profile.name || '');
        setUserEmail(profile.email || '');
      }
    }).catch(() => {});
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany || !targetPosition) return;

    setIsGenerating(true);
    setTimeout(() => {
      let resultText = '';

      if (tone === 'Professional (English)') {
        resultText = `Dear Hiring Team at ${targetCompany},

I am writing to express my strong interest in the ${targetPosition} role at ${targetCompany}. With over 4 years of hands-on experience in building scalable web applications using React, TypeScript, and modern web tech stacks, I am confident in my ability to add immediate value to your engineering team.

In my previous roles, I successfully ${experienceHighlights || 'led frontend optimization initiatives that improved page load speed by 40% and enhanced user engagement'}. My background aligns closely with the technical and collaborative requirements of ${targetCompany}.

Thank you for your time and consideration. I welcome the opportunity to discuss my application further in an interview.

Sincerely,
${userName || 'Kandidat'}
${userEmail || 'email@email.com'}`;
      } else if (tone === 'Persuasif & Antusias') {
        resultText = `Halo ${recruiterName || 'Tim Rekrutmen'} ${targetCompany},

Saya sangat antusias untuk mengajukan lamaran posisi ${targetPosition} di ${targetCompany}! Sebagai seorang profesional yang berfokus pada hasil, saya telah lama mengagumi inovasi dan dampak produk yang dihadirkan oleh ${targetCompany}.

Keahlian utama saya mencakup ${experienceHighlights || 'pengembangan aplikasi skala besar, pengoptimalan performa koding, dan arsitektur UI/UX yang responsif'}. Saya yakin kombinasi keterampilan teknis dan semangat kolaborasi saya akan membantu ${targetCompany} mencapai target strategisnya.

Terima kasih atas perhatian Anda. Saya sangat senang jika diberi kesempatan untuk berdiskusi lebih lanjut.

Salam hangat,
${userName || 'Kandidat'}`;
      } else {
        resultText = `Yth. ${recruiterName || 'Tim Rekrutmen'} ${targetCompany},

Melalui surat lamaran ini, saya menyampaikan minat yang besar untuk bergabung dengan ${targetCompany} sebagai ${targetPosition}. Berdasarkan latar belakang profesional saya dalam industri teknologi, saya memiliki kompetensi yang selaras dengan kualifikasi yang Anda butuhkan.

Secara khusus, pengalaman saya meliputi ${experienceHighlights || 'pengembangan aplikasi web performa tinggi dengan React dan Node.js, serta pengalaman memimpin kolaborasi tim teknis'}. Saya siap membawa dedikasi dan kemampuan ini untuk mendukung visi ${targetCompany}.

Terima kasih atas kesempatan dan waktu yang Bapak/Ibu berikan. Saya berharap dapat berdiskusi dalam sesi wawancara.

Hormat saya,
${userName || 'Kandidat'}
${userEmail || 'email@email.com'}`;
      }

      setGeneratedLetter(resultText);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedLetter) return;
    const newLetter: SavedCoverLetter = {
      id: `cl-${savedLetters.length + 1}`,
      company: targetCompany || 'Perusahaan Target',
      position: targetPosition || 'Posisi Pekerjaan',
      date: 'Hari ini',
      content: generatedLetter,
    };
    setSavedLetters([newLetter, ...savedLetters]);
    toast.success('Surat Lamaran Tersimpan', 'Surat lamaran berhasil disimpan ke daftar dokumen kamu.');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedLetters((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standardized */}
      <PageHeader
        title="Pembuat Surat Lamaran"
        subtitle="Susun surat lamaran kerja yang persuasif, disesuaikan dengan posisi target dan standar perusahaan multinasional secara instan."
        icon={Mail}
        badge="Cover Letter AI"
        stats={[
          { label: 'Tersimpan', value: `${savedLetters.length} Draf`, icon: FileText },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Generator Left */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Parameter Surat Lamaran
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Perusahaan Target *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Shopee Indonesia"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Posisi Pekerjaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Senior Frontend Developer"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Recruiter (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Rina Hartati"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Gaya Bahasa / Tone
              </label>
              <CustomSelect
                value={tone}
                onChange={(val) => setTone(val as any)}
                options={[
                  'Formal (Bahasa Indonesia)',
                  'Professional (English)',
                  'Persuasif & Antusias',
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Highlight Pengalaman Kunci
              </label>
              <textarea
                rows={3}
                placeholder="Sebutkan prestasi utama kamu (e.g., Memimpin migrasi React, meningkatkan performa web 40%)..."
                value={experienceHighlights}
                onChange={(e) => setExperienceHighlights(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Menyusun Surat...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Susun Surat Lamaran Otomatis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Result Right */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hasil Susunan Surat
                </h3>
              </div>
              {generatedLetter && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Text'}</span>
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span>Simpan Dokumen</span>
                  </button>
                  <a
                    href="/mailer"
                    className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-[#1738D1]/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim via Auto Mailer</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[300px] mt-3 whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {generatedLetter ? (
                generatedLetter
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16 space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">Isi formulir di samping lalu klik &quot;Susun Surat Lamaran Otomatis&quot;.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Cover Letters List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          Daftar Surat Lamaran Tersimpan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedLetters.map((letter) => (
            <div
              key={letter.id}
              className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {letter.position}
                  </h4>
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {letter.company}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSaved(letter.id)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-[10px] border border-slate-100 dark:border-slate-800">
                {letter.content}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Diperbarui: {letter.date}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(letter.content);
                    toast.success('Teks Tersalin', 'Surat lamaran berhasil disalin ke clipboard!');
                  }}
                  className="font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  Salin Teks Lengkap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
