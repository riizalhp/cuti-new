export interface TranscriptCue {
  time: number; // in seconds
  timestamp: string; // e.g. "01:15"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: string;
  durationSeconds?: number;
  videoUrl?: string;
  videoPoster?: string;
  transcript?: TranscriptCue[];
  readingContent?: string;
  quizQuestions?: QuizQuestion[];
  isCompleted?: boolean;
}

export interface SyllabusModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  estimatedHours: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  partner: {
    name: string;
    logo: string;
    type: 'University' | 'Tech Company' | 'Institute';
    verified: boolean;
  };
  instructor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  subject: 'Artificial Intelligence' | 'Data Science' | 'Computer Science' | 'Business & Career' | 'UI/UX Design';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  credentialType: 'Professional Certificate' | 'Specialization' | 'Course' | 'Mini-Degree';
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  duration: string;
  totalHours: string;
  language: string;
  thumbnail: string;
  bannerImage: string;
  learningOutcomes: string[];
  skillsGained: string[];
  syllabus: SyllabusModule[];
  faqs: { question: string; answer: string }[];
  reviews: { name: string; avatar: string; rating: number; date: string; comment: string }[];
}

export const COURSES: Course[] = [
  {
    id: 'course-ai-101',
    slug: 'machine-learning-specialization',
    title: 'Machine Learning & Modern AI Specialization',
    subtitle: 'Kuasai fondasi Machine Learning modern, Deep Learning, Supervised & Unsupervised Learning dengan Python & Scikit-Learn.',
    partner: {
      name: 'Stanford University & DeepLearning.AI',
      logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80',
      type: 'University',
      verified: true,
    },
    instructor: {
      name: 'Prof. Andrew Ng',
      role: 'Founder DeepLearning.AI & Adjunct Professor di Stanford University',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bio: 'Pelopor riset AI global, mantan Kepala Stanford AI Lab, dan pengajar lebih dari 5 juta insinyur AI di seluruh dunia.',
    },
    subject: 'Artificial Intelligence',
    level: 'Beginner',
    credentialType: 'Specialization',
    rating: 4.9,
    reviewCount: 24350,
    enrolledCount: 68420,
    duration: '4 Minggu (4-6 jam/minggu)',
    totalHours: '22 Jam Total',
    language: 'Bahasa Indonesia & English Subtitle',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    learningOutcomes: [
      'Membangun model Machine Learning Supervised (Regresi Linier, Regresi Logistik) dari nol dengan Python.',
      'Menerapkan Neural Networks dan Deep Learning menggunakan PyTorch & Scikit-Learn.',
      'Melakukan evaluasi metrik akurasi, Precision/Recall, dan optimasi Hyperparameter model.',
      'Merancang sistem Machine Learning siap produksi dengan data pipeline industri nyata.',
    ],
    skillsGained: [
      'Machine Learning',
      'Python',
      'Artificial Intelligence',
      'Scikit-Learn',
      'Neural Networks',
      'Data Modeling',
    ],
    syllabus: [
      {
        id: 'mod-1',
        weekNumber: 1,
        title: 'Pengantar Machine Learning & Supervised Learning',
        description: 'Pahami definisi dasar AI vs ML, konsep model regresi linier, cost function, dan algoritma gradient descent.',
        estimatedHours: '5 Jam Belajar',
        lessons: [
          {
            id: 'les-1-1',
            title: '1.1 Selamat Datang di Dunia Machine Learning',
            type: 'video',
            duration: '08:45',
            durationSeconds: 525,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Halo semuanya dan selamat datang di Program Spesialisasi Machine Learning modern.' },
              { time: 25, timestamp: '00:25', text: 'Machine Learning hari ini telah menjadi mesin utama pendorong revolusi kecerdasan buatan di seluruh industri.' },
              { time: 55, timestamp: '00:55', text: 'Dalam modul pertama ini, kita akan mempelajari konsep paling fundamental: Supervised Learning vs Unsupervised Learning.' },
              { time: 105, timestamp: '01:45', text: 'Pada Supervised Learning, kita memberikan algoritma kumpulan data yang sudah memiliki label kebenaran (ground truth).' },
              { time: 160, timestamp: '02:40', text: 'Contoh klasiknya adalah memprediksi harga rumah berdasarkan luas tanah dan jumlah kamar tidur.' },
              { time: 220, timestamp: '03:40', text: 'Di sesi berikutnya, kita akan membedah formula matematika di balik Linear Regression dan Cost Function.' },
            ],
          },
          {
            id: 'les-1-2',
            title: '1.2 Memahami Cost Function & Gradient Descent',
            type: 'reading',
            duration: '15 Menit',
            readingContent: `# Memahami Cost Function & Gradient Descent

Dalam Supervised Learning dengan Regresi Linier, tujuan utama model adalah menemukan garis terbaik yang meminimalkan selisih antara nilai prediksi $(\\hat{y})$ dan nilai target aktual $(y)$.

### 1. Model Hipotesis
Formula prediksi linier dituliskan sebagai:
$$f_{w,b}(x) = wx + b$$

Dimana:
* $w$ adalah bobot (*weight* atau kemiringan/slope).
* $b$ adalah bias (*intercept*).
* $x$ adalah fitur input data.

### 2. Mean Squared Error (MSE) Cost Function
Untuk mengukur seberapa meleset model kita dari data asli, kita menggunakan fungsi biaya kuadrat rata-rata:
$$J(w,b) = \\frac{1}{2m} \\sum_{i=1}^{m} (f_{w,b}(x^{(i)}) - y^{(i)})^2$$

Tujuan optimasi adalah mencari nilai parameter $w$ dan $b$ sedemikian sehingga $J(w,b)$ mencapai nilai minimum global.

### 3. Algoritma Gradient Descent
Gradient Descent memperbarui nilai parameter secara berulang menuruni lereng kecuraman fungsi biaya:
$$w := w - \\alpha \\frac{\\partial}{\\partial w} J(w,b)$$
$$b := b - \\alpha \\frac{\\partial}{\\partial b} J(w,b)$$

Dimana $\\alpha$ adalah **Learning Rate** (kecepatan belajar). Jika $\\alpha$ terlalu besar, algoritma bisa melompat liar dan divergen; jika terlalu kecil, konvergensi akan berjalan sangat lambat.`,
          },
          {
            id: 'les-1-3',
            title: '1.3 Kuis Evaluasi: Konsep Supervised Learning',
            type: 'quiz',
            duration: '15 Menit',
            quizQuestions: [
              {
                id: 'q-1',
                question: 'Manakah dari skenario berikut yang merupakan contoh murni dari Supervised Learning?',
                options: [
                  'Mengelompokkan pengguna e-commerce menjadi 5 segmen tanpa label sebelumnya.',
                  'Memprediksi apakah sebuah email masuk kategori SPAM atau BUKAN berdasarkan ribuan email berlabel historis.',
                  'Algoritma catur yang belajar sendiri melalui eksperimen berulang tanpa reward.',
                  'Mengurangi dimensi gambar resolusi tinggi tanpa data target.',
                ],
                correctAnswerIndex: 1,
                explanation: 'Supervised Learning menggunakan data berpasangan (fitur input dan label target yang sudah diketahui). Klasifikasi email spam dengan data historis berlabel adalah contoh representatif.',
              },
              {
                id: 'q-2',
                question: 'Apa dampak yang terjadi jika Learning Rate (alpha) disetel terlalu tinggi pada Gradient Descent?',
                options: [
                  'Model belajar terlalu lambat dan memakan memori berlebih.',
                  'Nilai bobot tidak pernah berubah dari inisialisasi awal.',
                  'Fungsi biaya dapat melesat melompati titik minimum dan mengalami divergensi (gagal konvergen).',
                  'Hasil akurasi selalu mencapai 100% tanpa overfitting.',
                ],
                correctAnswerIndex: 2,
                explanation: 'Learning rate yang terlalu besar membuat langkah pembaruan bobot melompati lembah minimum, menyebabkan nilai cost function terus membesar dan divergen.',
              },
              {
                id: 'q-3',
                question: 'Fungsi utama dari Cost Function J(w,b) dalam regresi linier adalah...',
                options: [
                  'Menentukan jumlah data training yang harus diikutsertakan.',
                  'Mengukur kuantitas kesalahan (error) antara prediksi model dengan target aktual pada data latihan.',
                  'Menghitung kecepatan kartu grafis (GPU) saat melatih model.',
                  'Mengubah format data teks menjadi representasi vektor numerik.',
                ],
                correctAnswerIndex: 1,
                explanation: 'Cost function berperan sebagai metrik penilai seberapa presisi prediksi garis model terhadap sebaran titik data aktual.',
              },
            ],
          },
        ],
      },
      {
        id: 'mod-2',
        weekNumber: 2,
        title: 'Klasifikasi & Logistic Regression',
        description: 'Beralih dari prediksi angka kontinu ke klasifikasi biner dan multi-kelas menggunakan fungsi Sigmoid dan Decision Boundary.',
        estimatedHours: '6 Jam Belajar',
        lessons: [
          {
            id: 'les-2-1',
            title: '2.1 Mengapa Regresi Linier Kurang Tepat untuk Klasifikasi',
            type: 'video',
            duration: '11:20',
            durationSeconds: 680,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Selamat datang di minggu kedua. Sekarang kita masuk ke ranah klasifikasi.' },
              { time: 35, timestamp: '00:35', text: 'Ketika kita mencoba menggunakan regresi linier biasa untuk memprediksi probabilitas biner 0 atau 1, garis prediksi bisa menghasilkan angka di bawah 0 atau di atas 1.' },
              { time: 90, timestamp: '01:30', text: 'Inilah alasan kita membutuhkan Fungsi Sigmoid (Logistic Function) untuk memetakan output ke rentang probabilitas absolut 0 sampai 1.' },
            ],
          },
          {
            id: 'les-2-2',
            title: '2.2 Decision Boundary & Regularisasi',
            type: 'reading',
            duration: '20 Menit',
            readingContent: `# Decision Boundary & Mengatasi Overfitting dengan Regularisasi

Ketika model klasifikasi kita memiliki fitur yang sangat banyak atau derajat polinomial tinggi, model rentan mengalami **overfitting** (menghafal noise data training tanpa kemampuan generalisasi).

### Formula Fungsi Sigmoid:
$$g(z) = \\frac{1}{1 + e^{-z}}$$

Ketika $z = \\vec{w} \\cdot \\vec{x} + b \\ge 0$, maka $g(z) \\ge 0.5$, dan model memprediksi kelas 1.

### Regularisasi L2 (Ridge)
Untuk mencegah bobot $w$ membengkak terlalu besar, kita menambahkan penalti regularisasi $\\lambda$ ke dalam fungsi biaya:
$$J_{reg}(\\vec{w},b) = J(\\vec{w},b) + \\frac{\\lambda}{2m} \\sum_{j=1}^{n} w_j^2$$`,
          },
          {
            id: 'les-2-3',
            title: '2.3 Kuis Evaluasi: Logistic Regression & Regularisasi',
            type: 'quiz',
            duration: '15 Menit',
            quizQuestions: [
              {
                id: 'q-2-1',
                question: 'Berapakah output dari fungsi Sigmoid g(z) ketika nilai z = 0?',
                options: ['0.0', '0.5', '1.0', '-1.0'],
                correctAnswerIndex: 1,
                explanation: 'g(0) = 1 / (1 + e^0) = 1 / (1 + 1) = 0.5. Nilai 0.5 ini merupakan titik ambang (threshold) keputusan standar.',
              },
            ],
          },
        ],
      },
      {
        id: 'mod-3',
        weekNumber: 3,
        title: 'Neural Networks & Deep Learning Basics',
        description: 'Arsitektur Multi-layer Perceptron, Forward Propagation, dan Aktivasi ReLU.',
        estimatedHours: '6 Jam Belajar',
        lessons: [
          {
            id: 'les-3-1',
            title: '3.1 Struktur Lapisan Jaringan Syaraf Tiruan (Neural Network)',
            type: 'video',
            duration: '14:15',
            durationSeconds: 855,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1516116211227-bbc13c72e276?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Di minggu ke-3 ini, kita akan melompat ke arsitektur Deep Learning modern.' },
              { time: 40, timestamp: '00:40', text: 'Sebuah neuron menerima input vektor x, menghitung kombinasi linier wx+b, dan meneruskannya ke fungsi aktivasi non-linier seperti ReLU.' },
            ],
          },
        ],
      },
      {
        id: 'mod-4',
        weekNumber: 4,
        title: 'Evaluasi Model & Best Practices Industri',
        description: 'Train/Validation/Test Split, Bias vs Variance, Precision-Recall, dan Deployment ke Server.',
        estimatedHours: '5 Jam Belajar',
        lessons: [
          {
            id: 'les-4-1',
            title: '4.1 Diagnostik Model: High Bias vs High Variance',
            type: 'video',
            duration: '12:50',
            durationSeconds: 770,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Mari kita pelajari cara mendiagnosis apakah model Anda mengalami underfitting atau overfitting.' },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Apakah program ini membutuhkan keahlian matematika tinggi?',
        answer: 'Tidak! Dasar aljabar linier dan kalkulus sederhana sudah cukup karena semua intuisi matematika dijelaskan secara visual dan aplikatif menggunakan kode Python.',
      },
      {
        question: 'Apakah sertifikat yang diterbitkan dapat diverifikasi?',
        answer: 'Ya, setiap siswa yang menyelesaikan seluruh materi dan lulus kuis dengan skor ≥ 80% akan mendapatkan Sertifikat Digital Resmi dengan ID Kredensial unik dan QR Code.',
      },
    ],
    reviews: [
      {
        name: 'Rian Pratama',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '3 hari yang lalu',
        comment: 'Penjelasan Prof. Andrew Ng sangat jernih! Transkrip sinkron dan kuis latihannya benar-benar membantu pemahaman konsep AI dari nol.',
      },
      {
        name: 'Siti Nurhaliza',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '1 minggu yang lalu',
        comment: 'Fitur catatan timestamp dan AI tutor sangat membantu saat saya lupa rumus gradient descent. Sangat direkomendasikan!',
      },
    ],
  },
  {
    id: 'course-data-google',
    slug: 'google-data-analytics-certificate',
    title: 'Google Data Analytics Professional Certificate',
    subtitle: 'Siapkan karier impian sebagai Data Analyst siap kerja dengan SQL, Spreadsheet, Tableau, dan R Programming dari tim pakar Google.',
    partner: {
      name: 'Google Career Certificates',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      type: 'Tech Company',
      verified: true,
    },
    instructor: {
      name: 'Google Data Insights Team',
      role: 'Senior Data Analysts & Lead Instructors di Google LLC',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      bio: 'Praktisi data senior di Google dengan pengalaman mengolah petabyte data untuk produk Search, YouTube, dan Android.',
    },
    subject: 'Data Science',
    level: 'Beginner',
    credentialType: 'Professional Certificate',
    rating: 4.8,
    reviewCount: 38900,
    enrolledCount: 92400,
    duration: '6 Minggu (5-8 jam/minggu)',
    totalHours: '32 Jam Total',
    language: 'Bahasa Indonesia & English Subtitle',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    learningOutcomes: [
      'Memahami siklus hidup data: Ask, Prepare, Process, Analyze, Share, dan Act.',
      'Menulis kueri SQL kompleks (JOIN, GROUP BY, Window Functions) untuk agregasi data berskala besar.',
      'Membuat visualisasi data interaktif dan dashboard bisnis menggunakan Tableau.',
      'Melakukan analisis statistik dan manipulasi dataframe menggunakan bahasa pemrograman R.',
    ],
    skillsGained: [
      'SQL',
      'Data Analytics',
      'Tableau',
      'Spreadsheets',
      'R Programming',
      'Data Visualization',
    ],
    syllabus: [
      {
        id: 'mod-g-1',
        weekNumber: 1,
        title: 'Foundations: Data, Data, Everywhere',
        description: 'Memahami cara berpikir analitis, ekosistem data, dan peran strategis data analyst di era digital.',
        estimatedHours: '6 Jam Belajar',
        lessons: [
          {
            id: 'les-g-1-1',
            title: '1.1 Pengantar Analisis Data Modern',
            type: 'video',
            duration: '09:12',
            durationSeconds: 552,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Selamat datang di Program Sertifikasi Profesional Google Data Analytics.' },
              { time: 20, timestamp: '00:20', text: 'Data ada di sekitar kita, mulai dari aplikasi ride-hailing hingga platform streaming musik.' },
              { time: 60, timestamp: '01:00', text: 'Tugas data analyst adalah mengubah data mentah yang berantakan menjadi wawasan bisnis yang bernilai tinggi.' },
            ],
          },
          {
            id: 'les-g-1-2',
            title: '1.2 Kuis: Siklus Hidup Analisis Data',
            type: 'quiz',
            duration: '10 Menit',
            quizQuestions: [
              {
                id: 'q-g-1',
                question: 'Tahap pertama dalam 6 fase analisis data menurut metodologi Google adalah...',
                options: ['Process (Memproses data)', 'Ask (Mendefinisikan masalah & pertanyaan bisnis)', 'Analyze (Menganalisis pola)', 'Share (Membagikan insight)'],
                correctAnswerIndex: 1,
                explanation: 'Tahap pertama selalu "Ask", yaitu mengidentifikasi pertanyaan bisnis dan tujuan analisis sebelum menyentuh data mentah.',
              },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        question: 'Apakah saya butuh latar belakang IT atau Statistika?',
        answer: 'Tidak, sertifikat ini dirancang dari level dasar (beginner-friendly) hingga siap kerja.',
      },
    ],
    reviews: [
      {
        name: 'Daffa Ramadhan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '5 hari yang lalu',
        comment: 'Studi kasus dari Google sangat riil dan materi SQL-nya sangat mudah dipahami pemula.',
      },
    ],
  },
  {
    id: 'course-meta-frontend',
    slug: 'meta-frontend-developer-certificate',
    title: 'Meta Front-End Developer Professional Certificate',
    subtitle: 'Kuasai React 19, Next.js, JavaScript Modern, dan UI/UX interaktif dari para perekayasa perangkat lunak di Meta.',
    partner: {
      name: 'Meta Platforms Inc.',
      logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=80',
      type: 'Tech Company',
      verified: true,
    },
    instructor: {
      name: 'Meta Staff Software Engineers',
      role: 'Lead UI/UX Architects di Meta (Facebook, Instagram, WhatsApp)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      bio: 'Insinyur senior yang merancang arsitektur React, Next.js, dan komponen web berskala miliaran pengguna.',
    },
    subject: 'Computer Science',
    level: 'Intermediate',
    credentialType: 'Professional Certificate',
    rating: 4.9,
    reviewCount: 31200,
    enrolledCount: 74500,
    duration: '5 Minggu (5-7 jam/minggu)',
    totalHours: '28 Jam Total',
    language: 'Bahasa Indonesia & English Subtitle',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    learningOutcomes: [
      'Membangun antarmuka web responsif dan dinamis dengan React Hooks & State Management.',
      'Mengoptimalkan performa web dengan Server-Side Rendering dan Next.js App Router.',
      'Menerapkan pengujian unit otomatis menggunakan Jest dan React Testing Library.',
      'Menyelesaikan proyek portofolio aplikasi web interaktif siap lamar ke industri global.',
    ],
    skillsGained: [
      'React.js',
      'JavaScript ES6+',
      'Next.js',
      'HTML5/CSS3',
      'Responsive Web Design',
      'Version Control (Git)',
    ],
    syllabus: [
      {
        id: 'mod-m-1',
        weekNumber: 1,
        title: 'React Fundamentals & Component Architecture',
        description: 'JSX, State & Props, Life-cycle hooks, dan modularisasi komponen.',
        estimatedHours: '5 Jam Belajar',
        lessons: [
          {
            id: 'les-m-1-1',
            title: '1.1 Filosofi Komponen & Deklaratif UI di React',
            type: 'video',
            duration: '10:30',
            durationSeconds: 630,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Halo! Selamat datang di program spesialisasi Meta Front-End Engineering.' },
              { time: 30, timestamp: '00:30', text: 'React mengubah cara kita membangun antarmuka web melalui pemikiran berbasis komponen modular.' },
            ],
          },
        ],
      },
    ],
    faqs: [],
    reviews: [],
  },
  {
    id: 'course-ui-design',
    slug: 'ui-ux-design-specialization',
    title: 'UI/UX Design Masterclass & Product Strategy',
    subtitle: 'Rancang antarmuka aplikasi digital yang intuitif, estetis, dan berbasis riset pengguna dengan Figma dan Design System.',
    partner: {
      name: 'Universitas Indonesia & Design Guild',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=80',
      type: 'University',
      verified: true,
    },
    instructor: {
      name: 'Andini Kusuma, M.Ds.',
      role: 'Principal Product Designer & Dosen Fakultas Ilmu Komputer UI',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
      bio: 'Praktisi desain produk berpengalaman 10+ tahun di startup unicorn dan konsultan riset UX di Asia Tenggara.',
    },
    subject: 'UI/UX Design',
    level: 'Beginner',
    credentialType: 'Specialization',
    rating: 4.9,
    reviewCount: 15400,
    enrolledCount: 39100,
    duration: '4 Minggu (4-5 jam/minggu)',
    totalHours: '16 Jam Total',
    language: 'Bahasa Indonesia',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
    learningOutcomes: [
      'Menjalankan riset pengguna, membuat User Persona, dan Empathy Mapping.',
      'Menyusun Wireframing, User Flow, dan Prototyping interaktif di Figma.',
      'Membangun Design System berskala dengan Auto-layout, Variants, dan Token warna.',
      'Melakukan Usability Testing dan iterasi desain berbasis metrik kuantitatif.',
    ],
    skillsGained: [
      'Figma',
      'UI Design',
      'UX Research',
      'Design Systems',
      'Prototyping',
      'Usability Testing',
    ],
    syllabus: [
      {
        id: 'mod-u-1',
        weekNumber: 1,
        title: 'Fondasi Human-Centered Design & UX Research',
        description: 'Prinsip psikologi desain, hukum Gestalt, dan wawancara pengguna.',
        estimatedHours: '4 Jam Belajar',
        lessons: [
          {
            id: 'les-u-1-1',
            title: '1.1 Apa yang Membuat Sebuah Desain Berfungsi Baik?',
            type: 'video',
            duration: '07:45',
            durationSeconds: 465,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Desain bukan sekadar tentang estetika warna, tetapi bagaimana sebuah produk menyelesaikan masalah pengguna secara efisien.' },
            ],
          },
        ],
      },
    ],
    faqs: [],
    reviews: [],
  },
  {
    id: 'course-business-fintech',
    slug: 'business-fintech-digital-strategy',
    title: 'Fintech & Digital Business Strategy in Southeast Asia',
    subtitle: 'Pelajari model bisnis fintech, ekosistem pembayaran digital (QRIS, E-Wallet, P2P), dan strategi pertumbuhan produk di Indonesia.',
    partner: {
      name: 'IBM & Fintech Institute',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
      type: 'Tech Company',
      verified: true,
    },
    instructor: {
      name: 'Budi Hartono, MBA',
      role: 'Head of Strategic Growth & Ex-Fintech VP',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      bio: 'Eksekutif fintech dengan rekam jejak memimpin ekspansi layanan pembayaran digital dan inklusi keuangan.',
    },
    subject: 'Business & Career',
    level: 'Intermediate',
    credentialType: 'Course',
    rating: 4.8,
    reviewCount: 9800,
    enrolledCount: 22600,
    duration: '3 Minggu (3-4 jam/minggu)',
    totalHours: '12 Jam Total',
    language: 'Bahasa Indonesia',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    learningOutcomes: [
      'Membedah arsitektur pembayaran digital, Payment Gateway, dan regulasi Bank Indonesia.',
      'Menghitung metrik performa produk (CAC, LTV, Retention Rate, Churn Rate).',
      'Merancang strategi Go-to-Market untuk produk digital di pasar berkembang.',
    ],
    skillsGained: [
      'Fintech',
      'Business Strategy',
      'Unit Economics',
      'Product Management',
      'Financial Modeling',
    ],
    syllabus: [
      {
        id: 'mod-b-1',
        weekNumber: 1,
        title: 'Ekosistem Pembayaran Digital & Inklusi Keuangan',
        description: 'Perkembangan QRIS, Open Banking API, dan transformasi perbankan.',
        estimatedHours: '4 Jam Belajar',
        lessons: [
          {
            id: 'les-b-1-1',
            title: '1.1 Peta Lanskap Fintech di Asia Tenggara',
            type: 'video',
            duration: '08:30',
            durationSeconds: 510,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoPoster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
            transcript: [
              { time: 0, timestamp: '00:00', text: 'Selamat datang di kursus Strategi Bisnis Fintech dan Digital.' },
            ],
          },
        ],
      },
    ],
    faqs: [],
    reviews: [],
  },
];
