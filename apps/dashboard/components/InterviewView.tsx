'use client';

import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  BookOpen,
  HelpCircle,
  Video,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Send,
  Award,
  Clock,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Square,
  Bookmark,
  TrendingUp,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  category: 'HR' | 'Technical' | 'User' | 'Jebakan' | 'Behavioral';
  question: string;
  purpose: string;
  starGuide: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  avoidText: string;
  idealAnswer: string;
}

export const InterviewView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulasi' | 'bank' | 'jebakan' | 'checklist'>('simulasi');

  // AI Mock Interview Simulator State
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedLevel, setSelectedLevel] = useState('User & Technical');
  const [simQuestionIndex, setSimQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    sampleAnswer?: string;
  } | null>(null);

  const mockSimQuestions = [
    {
      role: 'Software Engineer',
      q: 'Ceritakan pengalaman Anda saat menangani bug kritis di lingkungan produksi (production) yang berdampak pada pengguna.',
      hint: 'Gunakan metode STAR (Situation, Task, Action, Result) dan sebutkan langkah mitigasi jangka panjang.',
    },
    {
      role: 'Software Engineer',
      q: 'Bagaimana Anda menjelaskan arsitektur teknis yang kompleks kepada stakeholder non-teknis atau tim produk?',
      hint: 'Fokus pada nilai bisnis, analogi sederhana, dan kolaborasi antartim.',
    },
    {
      role: 'Marketing Specialist',
      q: 'Bagaimana Anda merancang strategi kampanye digital saat anggaran (budget) dipotong hingga 50%?',
      hint: 'Tekankan prioritas saluran organik, ROI, optimasi konversi, dan retensi pelanggan.',
    },
    {
      role: 'Data Analyst',
      q: 'Bagaimana Anda memastikan integritas data ketika menemukan inkonsistensi pada laporan data keuangan?',
      hint: 'Jelaskan alur data cleansing, verifikasi sumber data, dan komunikasi dengan tim data engineer.',
    },
  ];

  // Bank Pertanyaan Interview
  const [expandedQId, setExpandedQId] = useState<string | null>('q1');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');

  const questionsList: QuestionItem[] = [
    {
      id: 'q1',
      category: 'HR',
      question: 'Ceritakan tentang diri Anda dan alasan Anda melamar di perusahaan kami.',
      purpose: 'Menilai kemampuan komunikasi mendasar, antusiasme, dan kesesuaian latar belakang dengan kualifikasi posisi.',
      starGuide: {
        situation: 'Jelaskan latar belakang pendidikan atau karir terkini yang relevan singkat saja (30 detik).',
        task: 'Sebutkan pencapaian kunci atau keahlian utama yang paling relevan dengan posisi ini.',
        action: 'Jelaskan bagaimana pengalaman tersebut membentuk value & skill Anda.',
        result: 'Tutup dengan alasan spesifik mengapa budaya & misi perusahaan ini membuat Anda tertarik.',
      },
      avoidText: 'Menceritakan riwayat hidup dari masa sekolah dasar atau hanya membaca ulang isi CV baris demi baris.',
      idealAnswer: 'Saya seorang profesional di bidang pengembang perangkat lunak dengan pengalaman 2+ tahun memimpin pembuatan aplikasi web berskala tinggi. Di peran terakhir, saya berhasil mengoptimalkan performa loading hingga 40%. Saya sangat mengagumi inovasi produk perusahaan ini di bidang FinTech dan yakin keahlian frontend saya dapat langsung memberikan dampak positif.',
    },
    {
      id: 'q2',
      category: 'Jebakan',
      question: 'Berapa ekspektasi gaji yang Anda harapkan untuk posisi ini?',
      purpose: 'Mengetahui standar nilai pasaran Anda, fleksibilitas anggaran perusahaan, dan tingkat kesadaran diri.',
      starGuide: {
        situation: 'Riset rentang gaji industri untuk peran dan level pengalaman Anda sebelum interview.',
        task: 'Berikan rentang (range) realistis berdasarkan riset dan total benefit.',
        action: 'Tekankan bahwa gaji bersifat fleksibel tergantung total fasilitas, tunjangan, dan jenjang karir.',
        result: 'Tanyakan rentang anggaran resmi dari perusahaan jika memungkinkan.',
      },
      avoidText: 'Menyebut angka pasti yang terlalu kaku tanpa riset, atau menjawab "terserah standar perusahaan saja".',
      idealAnswer: 'Berdasarkan riset industri dan tanggung jawab posisi ini, ekspektasi gaji saya berada di rentang Rp 8.000.000 hingga Rp 10.000.000. Namun, saya sangat terbuka untuk berdiskusi lebih lanjut menyesuaikan dengan keseluruhan paket benefit dan fasilitas dari perusahaan.',
    },
    {
      id: 'q3',
      category: 'Behavioral',
      question: 'Ceritakan momen ketika Anda menghadapi konflik dengan rekan kerja dan bagaimana penyelesaiannya.',
      purpose: 'Mengukur kecerdasan emosional (EQ), kemampuan resolusi konflik, dan profesionalisme kerja tim.',
      starGuide: {
        situation: 'Gambarkan situasi perbedaan pendapat secara obyektif tanpa menyalahkan pihak manapun.',
        task: 'Jelaskan tujuan bersama yang ingin dicapai tim saat itu.',
        action: 'Ceritakan langkah dialog profesional, mendengarkan aktif, dan penyelesaian berbasis data.',
        result: 'Sebutkan hasil positif dan pelajaran berharga yang mempererat hubungan kerja.',
      },
      avoidText: 'Membicarakan keburukan karakter rekan kerja atau mengklaim Anda selalu benar tanpa kompromi.',
      idealAnswer: 'Saat pengerjaan proyek X, saya dan desainer memiliki pandangan berbeda mengenai alur pendaftaran pengguna. Saya mengajak berdiskusi santai, menyajikan data hasil tes keterbacaan, dan akhirnya kami sepakat menggabungkan ide terbaik. Hasilnya, tingkat pendaftaran meningkat 25%.',
    },
    {
      id: 'q4',
      category: 'Jebakan',
      question: 'Apa kelemahan terbesar Anda dan bagaimana Anda mengatasinya?',
      purpose: 'Melihat tingkat self-awareness (kesadaran diri) dan komitmen pengembangan diri (growth mindset).',
      starGuide: {
        situation: 'Pilih kelemahan nyata yang TIDAK merusak kualifikasi inti posisi yang dilamar.',
        task: 'Jelaskan bagaimana kelemahan tersebut berdampak pada gaya kerja Anda.',
        action: 'Uraikan langkah nyata atau tools yang Anda gunakan secara konsisten untuk mengatasinya.',
        result: 'Tunjukkan bukti perbaikan nyata yang dirasakan di tempat kerja.',
      },
      avoidText: 'Menjawab "Saya tidak punya kelemahan" atau menggunakan jawaban klise seperti "Saya terlalu perfeksionis".',
      idealAnswer: 'Kelemahan saya adalah kadang terlalu fokus pada detail kecil sehingga berisiko memperlambat penyelesaian. Untuk mengatasinya, sekarang saya selalu menggunakan sistem prioritas Eisenhower Matrix dan timer pengerjaan agar manajemen waktu tetap efektif.',
    },
    {
      id: 'q5',
      category: 'User',
      question: 'Mengapa Anda memutuskan untuk resign dari posisi atau perusahaan Anda saat ini?',
      purpose: 'Menilai motivasi karir, loyalitas, dan sikap terhadap tempat kerja sebelumnya.',
      starGuide: {
        situation: 'Fokus pada pencarian tantangan baru dan pertumbuhan profesional jangka panjang.',
        task: 'Tunjukkan apresiasi pada pelajaran berharga di tempat kerja lama.',
        action: 'Hubungkan aspirasi karir Anda dengan peluang pertumbuhan di perusahaan baru.',
        result: 'Pastikan transisi terkesan positif dan proaktif.',
      },
      avoidText: 'Mengeluhkan gaji rendah, menjelekkan atasan, atau curhat masalah internal perusahaan lama.',
      idealAnswer: 'Saya sangat bersyukur atas kesempatan belajar di perusahaan sebelumnya. Namun, saat ini saya mencari tantangan baru untuk memimpin proyek skala nasional dan fokus pada pengembangan produk berbasis AI yang merupakan fokus utama dari posisi ini.',
    },
  ];

  const filteredQuestions = questionsList.filter((q) => {
    if (filterCategory === 'Semua') return true;
    return q.category === filterCategory;
  });

  // Checklist Persiapan Interview State
  const [checkListItems, setCheckListItems] = useState([
    { id: 'c1', timing: 'H-7 S/D H-3 INTERVIEW', text: 'Riset mendalam profil perusahaan, lini produk, berita terbaru, dan budaya kerja.', done: true },
    { id: 'c2', timing: 'H-7 S/D H-3 INTERVIEW', text: 'Pelajari deskripsi pekerjaan (Job Description) & cocokkan dengan pengalaman di CV.', done: true },
    { id: 'c3', timing: 'H-7 S/D H-3 INTERVIEW', text: 'Siapkan 3 contoh cerita metode STAR (Situation, Task, Action, Result) terbaik.', done: false },
    { id: 'c4', timing: 'H-1 INTERVIEW', text: 'Pilih & siapkan pakaian formal/semiformal yang rapi dan bersih.', done: false },
    { id: 'c5', timing: 'H-1 INTERVIEW', text: 'Cek koneksi internet, kamera, mikrofon, dan pencahayaan ruangan jika online.', done: false },
    { id: 'c6', timing: 'H-1 INTERVIEW', text: 'Cetak fisik CV & portofolio jika interview tatap muka langsung.', done: false },
    { id: 'c7', timing: 'HARI-H INTERVIEW', text: 'Hadir 15 menit lebih awal di ruang lokasi/panggilan rapat online.', done: false },
    { id: 'c8', timing: 'PASCA INTERVIEW', text: 'Kirimkan email Thank You Note (Ucapan Terima Kasih) maksimal 24 jam setelah interview.', done: false },
  ]);

  const toggleChecklist = (id: string) => {
    setCheckListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checkListItems.filter((item) => item.done).length;
  const progressPercent = Math.round((completedCount / checkListItems.length) * 100);

  // Handle AI Simulation Submit
  const handleSimulateSubmit = () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationResult({
        score: 88,
        feedback:
          'Jawaban Anda sangat terstruktur dengan baik. Anda berhasil menyampaikan alur perbaikan teknis secara kronologis dan profesional.',
        strengths: [
          'Penggunaan alur cerita metode STAR sangat runtut dan jelas.',
          'Menyoroti dampaknya pada efisiensi sistem dan kenyamanan pengguna.',
          'Menunjukkan kepemimpinan dan sikap tenang dalam kondisi krisis.',
        ],
        improvements: [
          'Tambahkan matrik kuantitatif terukur (contoh: persentase penurunan error atau kecepatan pemulihan).',
          'Sebutkan alat bantu penanganan log/monitoring yang digunakan secara spesifik.',
        ],
        sampleAnswer:
          'Saat terjadi kendala di server produksi, saya mengisolasi modul database yang bermasalah, memulihkan cadangan dalam 15 menit, dan menerapkan unit test otomatis untuk mencegah kejadian serupa.',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-700 rounded-[10px] p-6 text-white border border-navy-800 shadow-md font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs mb-1 uppercase tracking-wider">
              <Mic className="w-4 h-4" />
              <span>Panduan &amp; Simulasi Interview</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Pusat Persiapan Interview Karier
            </h2>
            <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
              Latih jawaban interview Anda dengan Evaluator Sistem, pelajari bank pertanyaan HR &amp; User, serta ikuti panduan bebas dari pertanyaan jebakan.
            </p>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-[10px] border border-white/15 flex items-center gap-3 shrink-0">
            <div className="p-2.5 rounded-[10px] bg-[#1738D1] text-white font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">Skor Kesiapan Interview</span>
              <span className="text-lg font-black text-white">85 / 100 (Siap Tempur)</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('simulasi')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'simulasi'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi Mock Interview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bank')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'bank'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bank Pertanyaan &amp; STAR Guide</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jebakan')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'jebakan'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Taktik Pertanyaan Jebakan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'checklist'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checklist Persiapan ({progressPercent}%)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SIMULASI MOCK INTERVIEW */}
      {activeSubTab === 'simulasi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Setup Simulasi */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span>Pengaturan Sesi Simulasi</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    Posisi / Peran Pekerjaan
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setEvaluationResult(null);
                        setUserAnswer('');
                      }}
                      className="w-full p-2.5 pr-9 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1738D1] appearance-none cursor-pointer text-xs"
                    >
                      <option value="Software Engineer">Software Engineer / Developer</option>
                      <option value="Marketing Specialist">Digital Marketing Specialist</option>
                      <option value="Data Analyst">Data Analyst &amp; BI</option>
                      <option value="HR Specialist">Human Resources Specialist</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    Tingkat / Jenis Interview
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full p-2.5 pr-9 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1738D1] appearance-none cursor-pointer text-xs"
                    >
                      <option value="HR Screening">HR Screening &amp; Behavioral</option>
                      <option value="User & Technical">User / Managerial &amp; Technical</option>
                      <option value="Director / Final">Director / Final Board Interview</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="p-3 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-300 font-bold">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span>Petunjuk Simulasi</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Ketik jawaban seolah-olah Anda sedang di depan pewawancara asli. Sistem akan menganalisis poin kekuatan &amp; area perbaikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace Simulasi Pertanyaan & Evaluasi */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-5 shadow-xs">
              {/* Question Header Box */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    Pertanyaan #{simQuestionIndex + 1} ({selectedRole})
                  </span>
                  <button
                    onClick={() => {
                      setSimQuestionIndex((prev) => (prev + 1) % mockSimQuestions.length);
                      setUserAnswer('');
                      setEvaluationResult(null);
                    }}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ganti Pertanyaan</span>
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-relaxed">
                  &quot;{mockSimQuestions[simQuestionIndex].q}&quot;
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Tips Jawaban: {mockSimQuestions[simQuestionIndex].hint}</span>
                </p>
              </div>

              {/* User Answer Textarea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Jawaban Anda:</span>
                  <span className="text-slate-400 font-normal">{userAnswer.length} karakter</span>
                </div>
                <textarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ketikkan jawaban Anda menggunakan metode STAR (Situation, Task, Action, Result)..."
                  className="w-full p-3.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setUserAnswer('');
                    setEvaluationResult(null);
                  }}
                  className="px-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Bersihkan
                </button>

                <button
                  onClick={handleSimulateSubmit}
                  disabled={!userAnswer.trim() || isEvaluating}
                  className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Menganalisis Jawaban...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Evaluasi Jawaban</span>
                    </>
                  )}
                </button>
              </div>

              {/* Evaluation Output Box */}
              {evaluationResult && (
                <div className="p-5 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-orange-100 dark:border-orange-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">Hasil Analisis Evaluator</span>
                    </div>
                    <div className="px-3 py-1 rounded-[10px] bg-[#1738D1] text-white font-black text-xs">
                      Skor: {evaluationResult.score} / 100
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {evaluationResult.feedback}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Strengths */}
                    <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kekuatan Jawaban:</span>
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
                        {evaluationResult.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="p-3 rounded-[10px] bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 space-y-2">
                      <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Area Pengembangan:</span>
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
                        {evaluationResult.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ideal Sample Answer */}
                  <div className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800/50 space-y-1.5 text-xs">
                    <span className="font-extrabold text-orange-950 dark:text-orange-200 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-orange-500" />
                      <span>Rekomendasi Contoh Jawaban STAR:</span>
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      &quot;{evaluationResult.sampleAnswer}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK PERTANYAAN & STAR GUIDE */}
      {activeSubTab === 'bank' && (
        <div className="space-y-5">
          {/* Filter Categories */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Filter Kategori Pertanyaan:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {['Semua', 'HR', 'User', 'Behavioral', 'Jebakan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#1738D1] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden shadow-xs transition"
                >
                  {/* Header Item */}
                  <button
                    onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                        {q.category}
                      </span>
                      <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">
                        {q.question}
                      </h4>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Body Expanded Detail */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-4 text-xs">
                      {/* Purpose */}
                      <div className="p-3 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-100 dark:border-orange-900/60 text-slate-700 dark:text-slate-300">
                        <strong className="text-orange-700 dark:text-orange-300 block mb-0.5">Tujuan Pewawancara Menanyakan Ini:</strong>
                        <p>{q.purpose}</p>
                      </div>

                      {/* STAR Framework */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>Panduan Struktur Metode STAR:</span>
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                          <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-black text-orange-600 dark:text-orange-400 block">S - Situation (Situasi):</span>
                            <p className="text-slate-600 dark:text-slate-400">{q.starGuide.situation}</p>
                          </div>
                          <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-black text-orange-600 dark:text-orange-400 block">T - Task (Tugas):</span>
                            <p className="text-slate-600 dark:text-slate-400">{q.starGuide.task}</p>
                          </div>
                          <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-black text-orange-600 dark:text-orange-400 block">A - Action (Aksi):</span>
                            <p className="text-slate-600 dark:text-slate-400">{q.starGuide.action}</p>
                          </div>
                          <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-black text-orange-600 dark:text-orange-400 block">R - Result (Hasil):</span>
                            <p className="text-slate-600 dark:text-slate-400">{q.starGuide.result}</p>
                          </div>
                        </div>
                      </div>

                      {/* Ideal Answer & Avoid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Contoh Jawaban Ideal:</span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">&quot;{q.idealAnswer}&quot;</p>
                        </div>

                        <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 space-y-1">
                          <span className="font-bold text-rose-800 dark:text-rose-300 block">Hindari Mengatakan Ini:</span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{q.avoidText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TAKTIK PERTANYAAN JEBAKAN */}
      {activeSubTab === 'jebakan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Taktik Nego Gaji tanpa Terjebak Murah</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Selalu gunakan teknik rentang (range) dengan riset standar industri. Jangan pernah menyebut 1 angka kaku di awal sebelum mengetahui detail kompensasi benefit menyeluruh (asuransi, bonus tahunan, insentif).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Menjelaskan Resign tanpa Mengeluh</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fokuskan alasan pada pencarian pertumbuhan karir profesional, skala tanggung jawab baru, dan minat khusus pada visi produk perusahaan target. Jangan mengkritik manajemen tempat kerja sebelumnya.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pertanyaan &quot;Ada Pertanyaan untuk Kami?&quot;</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Selalu siapkan minimal 2 pertanyaan cerdas untuk pewawancara. Contoh: &quot;Seperti apa ekspektasi kesuksesan untuk posisi ini dalam 90 hari pertama?&quot; atau &quot;Apa tantangan terbesar tim saat ini?&quot;
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Menjawab Periode Kosong (Career Gap)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Jelaskan aktivitas positif yang Anda lakukan selama jeda karir, seperti mengambil sertifikasi, proyek freelance, belajar keterampilan baru, atau kegiatan pengabdian komunitas.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CHECKLIST PERSIAPAN */}
      {activeSubTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Checklist Persiapan Interview Terstruktur</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tandai poin yang sudah selesai untuk memastikan Anda 100% siap saat menghadapi interview.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Kemajuan Checklist</span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                  {completedCount} dari {checkListItems.length} Selesai ({progressPercent}%)
                </span>
              </div>
              <div className="w-24 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#1738D1] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {checkListItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-[10px] border transition flex items-center justify-between gap-3 cursor-pointer ${
                  item.done
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button className="text-orange-600 dark:text-orange-400 shrink-0">
                    {item.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                  </button>
                  <span
                    className={`text-xs font-semibold ${
                      item.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                  {item.timing}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
