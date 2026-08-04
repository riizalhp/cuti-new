'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Target,
  Briefcase,
  FileText,
  Settings,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Edit3,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Database,
  Cpu,
  Activity,
  UserCheck,
  UserX,
  DollarSign,
  Lock,
  Unlock,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  ArrowLeft,
  User,
  Sun,
  Moon,
  ShieldCheck,
  Link,
  Key,
  EyeOff,
  Globe,
  Bot,
  Server,
  Calendar,
  AlertCircle,
  Percent,
  Layers,
  Send,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  plan: 'Free' | 'Pro Member' | 'Lifetime';
  status: 'Aktif' | 'Ditangguhkan';
  joinedDate: string;
  cvCreated: number;
}

interface CvOrderProgressItem {
  id: string;
  clientName: string;
  clientEmail: string;
  packageType: 'CV ATS Starter' | 'CV Pro & Cover Letter' | 'VIP Career & Coaching';
  targetRole: string;
  requestDate: string; // kapan masuk permintaan
  targetCompletionDate: string; // kapan selesai
  assignedTo: string; // siapa yang mengerjakan
  assignedRole: string; // Peran HR / Recruiter / Consultant
  progressPercent: number; // progress cv yang dikerjakan (0-100)
  status: 'Masuk Permintaan' | 'Dalam Pengerjaan' | 'Review Quality Control' | 'Selesai' | 'Revisi';
  notes: string;
}

interface TransactionItem {
  id: string;
  user: string;
  email: string;
  plan: string;
  amount: string;
  method: string;
  date: string;
  status: 'Berhasil' | 'Pending' | 'Gagal';
  proofUrl?: string;
}

interface MissionItem {
  id: string;
  title: string;
  category: 'Harian' | 'Mingguan' | 'Referral' | 'Spesial';
  rewardPoints: number;
  rewardCash: number;
  completedCount: number;
  status: 'Aktif' | 'Nonaktif';
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract';
  salary: string;
  applicants: number;
  status: 'Aktif' | 'Ditutup';
}

interface AdminDashboardViewProps {}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = () => {
  const router = useRouter();
  const onSwitchToUserPortal = () => router.push('/beranda');

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'cv-orders' | 'users' | 'transactions' | 'missions' | 'jobs' | 'content' | 'system'
  >('overview');

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'All' | 'Free' | 'Pro Member' | 'Lifetime'>('All');
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<'All' | 'Berhasil' | 'Pending' | 'Gagal'>('All');
  const [jobSearch, setJobSearch] = useState('');

  // CV Orders Search & Filters
  const [cvOrderSearch, setCvOrderSearch] = useState('');
  const [cvOrderStatusFilter, setCvOrderStatusFilter] = useState<string>('All');
  const [cvOrderWorkerFilter, setCvOrderWorkerFilter] = useState<string>('All');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // CV Progress Orders State
  const [cvOrdersList, setCvOrdersList] = useState<CvOrderProgressItem[]>([
    {
      id: 'CV-ORD-801',
      clientName: 'Andi Pratama',
      clientEmail: 'andi.pratama@email.com',
      packageType: 'CV Pro & Cover Letter',
      targetRole: 'Senior Product Manager - GoTo',
      requestDate: '23 Jul 2026, 08:15 WIB',
      targetCompletionDate: '24 Jul 2026, 17:00 WIB',
      assignedTo: 'Siti Aminah, M.Psi',
      assignedRole: 'Senior HR Specialist',
      progressPercent: 65,
      status: 'Dalam Pengerjaan',
      notes: 'Draft CV 2 Halaman dioptimasi keyword ATS. Menunggu sinkronisasi Cover Letter.',
    },
    {
      id: 'CV-ORD-802',
      clientName: 'Budi Santoso',
      clientEmail: 'budi.santoso@yahoo.com',
      packageType: 'VIP Career & Coaching',
      targetRole: 'Lead Data Analyst - Bank Mandiri',
      requestDate: '23 Jul 2026, 09:30 WIB',
      targetCompletionDate: '25 Jul 2026, 12:00 WIB',
      assignedTo: 'Ahmad Fikri, S.Psi',
      assignedRole: 'Lead Career Consultant',
      progressPercent: 20,
      status: 'Masuk Permintaan',
      notes: 'Data berkas baru terverifikasi. Menunggu sesi coaching & audit CV awal.',
    },
    {
      id: 'CV-ORD-803',
      clientName: 'Dewi Lestari',
      clientEmail: 'dewi.lestari@tech.id',
      packageType: 'CV Pro & Cover Letter',
      targetRole: 'Senior UX Researcher - Traveloka',
      requestDate: '22 Jul 2026, 14:00 WIB',
      targetCompletionDate: '23 Jul 2026, 16:00 WIB',
      assignedTo: 'Rina Febriani, S.Kom',
      assignedRole: 'Senior Tech Recruiter',
      progressPercent: 90,
      status: 'Review Quality Control',
      notes: 'Pemeriksaan tata bahasa & verifikasi skor ATS (92/100). Siap dikirim ke klien.',
    },
    {
      id: 'CV-ORD-804',
      clientName: 'Siti Rahmawati',
      clientEmail: 'siti.rahma@gmail.com',
      packageType: 'CV ATS Starter',
      targetRole: 'HR Generalist - Telkom Indonesia',
      requestDate: '22 Jul 2026, 10:00 WIB',
      targetCompletionDate: '23 Jul 2026, 10:00 WIB',
      assignedTo: 'Rizky Kurniawan',
      assignedRole: 'AI CV Specialist',
      progressPercent: 100,
      status: 'Selesai',
      notes: 'File PDF & DOCX sudah dikirim via WhatsApp & Email. Klien puas.',
    },
    {
      id: 'CV-ORD-805',
      clientName: 'Fajar Nugraha',
      clientEmail: 'fajar.nug@gmail.com',
      packageType: 'CV Pro & Cover Letter',
      targetRole: 'Full Stack Engineer - Shopee',
      requestDate: '23 Jul 2026, 07:00 WIB',
      targetCompletionDate: '24 Jul 2026, 12:00 WIB',
      assignedTo: 'Siti Aminah, M.Psi',
      assignedRole: 'Senior HR Specialist',
      progressPercent: 45,
      status: 'Dalam Pengerjaan',
      notes: 'Penyusunan ringkasan eksekutif dan poin kuantitatif prestasi (STAR method).',
    },
    {
      id: 'CV-ORD-806',
      clientName: 'Rina Kusuma',
      clientEmail: 'rina.kusuma@gmail.com',
      packageType: 'VIP Career & Coaching',
      targetRole: 'Digital Marketing Lead - Tokopedia',
      requestDate: '21 Jul 2026, 16:30 WIB',
      targetCompletionDate: '22 Jul 2026, 18:00 WIB',
      assignedTo: 'Ahmad Fikri, S.Psi',
      assignedRole: 'Lead Career Consultant',
      progressPercent: 80,
      status: 'Revisi',
      notes: 'Klien meminta penambahan portofolio kampanye TikTok Ads tahun 2025. Revisi sedang diproses.',
    },
  ]);

  // Modals for CV Orders
  const [isAddCvOrderModalOpen, setIsAddCvOrderModalOpen] = useState(false);
  const [editingCvOrder, setEditingCvOrder] = useState<CvOrderProgressItem | null>(null);

  // Form States for New CV Order
  const [newCvClientName, setNewCvClientName] = useState('');
  const [newCvClientEmail, setNewCvClientEmail] = useState('');
  const [newCvPackageType, setNewCvPackageType] = useState<'CV ATS Starter' | 'CV Pro & Cover Letter' | 'VIP Career & Coaching'>('CV Pro & Cover Letter');
  const [newCvTargetRole, setNewCvTargetRole] = useState('');
  const [newCvAssignedTo, setNewCvAssignedTo] = useState('Siti Aminah, M.Psi');
  const [newCvAssignedRole, setNewCvAssignedRole] = useState('Senior HR Specialist');
  const [newCvTargetDate, setNewCvTargetDate] = useState('25 Jul 2026, 17:00 WIB');

  // Sample Mock Data
  const [usersList, setUsersList] = useState<UserItem[]>([
    { id: 'USR-001', name: 'Andi Pratama', email: 'andi.pratama@email.com', role: 'User', plan: 'Lifetime', status: 'Aktif', joinedDate: '12 Jan 2026', cvCreated: 8 },
    { id: 'USR-002', name: 'Siti Rahmawati', email: 'siti.rahma@gmail.com', role: 'User', plan: 'Pro Member', status: 'Aktif', joinedDate: '05 Feb 2026', cvCreated: 14 },
    { id: 'USR-003', name: 'Budi Santoso', email: 'budi.santoso@yahoo.com', role: 'User', plan: 'Free', status: 'Aktif', joinedDate: '20 Mar 2026', cvCreated: 2 },
    { id: 'USR-004', name: 'Dewi Lestari', email: 'dewi.lestari@tech.id', role: 'User', plan: 'Pro Member', status: 'Aktif', joinedDate: '01 Apr 2026', cvCreated: 11 },
    { id: 'USR-005', name: 'Rizky Febrian', email: 'rizky.f@outlook.com', role: 'User', plan: 'Free', status: 'Ditangguhkan', joinedDate: '18 Mei 2026', cvCreated: 0 },
    { id: 'USR-006', name: 'Maya Indah', email: 'maya.indah@design.co', role: 'Admin', plan: 'Lifetime', status: 'Aktif', joinedDate: '01 Jan 2026', cvCreated: 25 },
  ]);

  const [transactionsList, setTransactionsList] = useState<TransactionItem[]>([
    { id: 'TRX-9821', user: 'Siti Rahmawati', email: 'siti.rahma@gmail.com', plan: 'Pro Member (1 Bulan)', amount: 'Rp 49.000', method: 'QRIS / GoPay', date: '22 Jul 2026 - 14:20', status: 'Berhasil' },
    { id: 'TRX-9820', user: 'Dewi Lestari', email: 'dewi.lestari@tech.id', plan: 'Lifetime Pass Pro', amount: 'Rp 149.000', method: 'Transfer BCA', date: '22 Jul 2026 - 11:05', status: 'Berhasil' },
    { id: 'TRX-9819', user: 'Fajar Nugraha', email: 'fajar.nug@gmail.com', plan: 'Pro Member (1 Bulan)', amount: 'Rp 49.000', method: 'Mandiri VA', date: '21 Jul 2026 - 19:40', status: 'Pending' },
    { id: 'TRX-9818', user: 'Rina Kusuma', email: 'rina.kusuma@gmail.com', plan: 'Lifetime Pass Pro', amount: 'Rp 149.000', method: 'Credit Card', date: '21 Jul 2026 - 16:15', status: 'Gagal' },
    { id: 'TRX-9817', user: 'Hendra Setiawan', email: 'hendra.s@gmail.com', plan: 'Pro Member (1 Bulan)', amount: 'Rp 49.000', method: 'ShopeePay', date: '20 Jul 2026 - 09:30', status: 'Berhasil' },
  ]);

  const [missionsList, setMissionsList] = useState<MissionItem[]>([
    { id: 'MIS-101', title: 'Lengkapi Data Profil Career Readiness', category: 'Harian', rewardPoints: 50, rewardCash: 5000, completedCount: 1420, status: 'Aktif' },
    { id: 'MIS-102', title: 'Buat & Download CV ATS Pertama', category: 'Spesial', rewardPoints: 100, rewardCash: 10000, completedCount: 3890, status: 'Aktif' },
    { id: 'MIS-103', title: 'Simulasi Interview AI (Minimal 3 Pertanyaan)', category: 'Mingguan', rewardPoints: 75, rewardCash: 7500, completedCount: 950, status: 'Aktif' },
    { id: 'MIS-104', title: 'Undang 3 Teman Bergabung dengan Kode Referral', category: 'Referral', rewardPoints: 200, rewardCash: 25000, completedCount: 512, status: 'Aktif' },
  ]);

  const [jobsList, setJobsList] = useState<JobPosting[]>([
    { id: 'JOB-301', title: 'Senior Frontend Developer (React/Next.js)', company: 'PT Bank Central Asia Tbk', location: 'Jakarta Selatan (Hybrid)', type: 'Full-time', salary: 'Rp 15.000.000 - Rp 22.000.000', applicants: 84, status: 'Aktif' },
    { id: 'JOB-302', title: 'AI Prompt Engineer & Data Analyst', company: 'Tokopedia / GoTo', location: 'Jakarta Selatan (Full Remote)', type: 'Remote', salary: 'Rp 12.000.000 - Rp 18.000.000', applicants: 142, status: 'Aktif' },
    { id: 'JOB-303', title: 'Digital Marketing & Content Specialist', company: 'Shopee Indonesia', location: 'Jakarta Barat (On-site)', type: 'Full-time', salary: 'Rp 8.000.000 - Rp 12.000.000', applicants: 65, status: 'Aktif' },
    { id: 'JOB-304', title: 'HR Generalist & Talent Acquisition', company: 'PT Telkom Indonesia', location: 'Bandung (Hybrid)', type: 'Full-time', salary: 'Rp 9.000.000 - Rp 13.000.000', applicants: 98, status: 'Aktif' },
  ]);

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddMissionModalOpen, setIsAddMissionModalOpen] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'Free' | 'Pro Member' | 'Lifetime'>('Pro Member');

  // New Mission Form State
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionCategory, setNewMissionCategory] = useState<'Harian' | 'Mingguan' | 'Referral' | 'Spesial'>('Harian');
  const [newMissionPoints, setNewMissionPoints] = useState(50);
  const [newMissionCash, setNewMissionCash] = useState(5000);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobType, setNewJobType] = useState<'Full-time' | 'Remote' | 'Hybrid' | 'Contract'>('Full-time');
  const [newJobSalary, setNewJobSalary] = useState('Rp 8.000.000 - Rp 12.000.000');

  // System Config State
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('openai');
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('https://api.openai.com/v1');
  const [openaiApiKey, setOpenaiApiKey] = useState('sk-proj-7a8b9c1d2e3f4g5h6i7j8k9l0m');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [aiRateLimit, setAiRateLimit] = useState('50 request / menit');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApprovePayment, setAutoApprovePayment] = useState(true);

  // Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser: UserItem = {
      id: `USR-00${usersList.length + 1}`,
      name: newUserName,
      email: newUserEmail,
      role: 'User',
      plan: newUserPlan,
      status: 'Aktif',
      joinedDate: 'Hari Ini',
      cvCreated: 0,
    };
    setUsersList([newUser, ...usersList]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Pengguna baru ${newUser.name} berhasil ditambahkan!`);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsersList(
      usersList.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Aktif' ? 'Ditangguhkan' : 'Aktif';
          showToast(`Status pengguna ${u.name} diubah menjadi ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleUpgradeUserPlan = (id: string) => {
    setUsersList(
      usersList.map((u) => {
        if (u.id === id) {
          showToast(`Akun ${u.name} berhasil di-upgrade ke Lifetime Pass Pro!`);
          return { ...u, plan: 'Lifetime' };
        }
        return u;
      })
    );
  };

  const handleApproveTx = (id: string) => {
    setTransactionsList(
      transactionsList.map((tx) => {
        if (tx.id === id) {
          showToast(`Transaksi ${tx.id} berhasil diverifikasi!`);
          return { ...tx, status: 'Berhasil' };
        }
        return tx;
      })
    );
  };

  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle) return;
    const newMission: MissionItem = {
      id: `MIS-${missionsList.length + 101}`,
      title: newMissionTitle,
      category: newMissionCategory,
      rewardPoints: Number(newMissionPoints),
      rewardCash: Number(newMissionCash),
      completedCount: 0,
      status: 'Aktif',
    };
    setMissionsList([newMission, ...missionsList]);
    setIsAddMissionModalOpen(false);
    setNewMissionTitle('');
    showToast(`Misi "${newMission.title}" berhasil dibuat!`);
  };

  const handleToggleMissionStatus = (id: string) => {
    setMissionsList(
      missionsList.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
          showToast(`Status misi "${m.title}" diubah menjadi ${nextStatus}`);
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) return;
    const newJob: JobPosting = {
      id: `JOB-${jobsList.length + 301}`,
      title: newJobTitle,
      company: newJobCompany,
      location: newJobLocation || 'Jakarta (Hybrid)',
      type: newJobType,
      salary: newJobSalary,
      applicants: 0,
      status: 'Aktif',
    };
    setJobsList([newJob, ...jobsList]);
    setIsAddJobModalOpen(false);
    setNewJobTitle('');
    setNewJobCompany('');
    showToast(`Lowongan "${newJob.title}" berhasil ditambahkan!`);
  };

  const handleToggleJobStatus = (id: string) => {
    setJobsList(
      jobsList.map((j) => {
        if (j.id === id) {
          const nextStatus = j.status === 'Aktif' ? 'Ditutup' : 'Aktif';
          showToast(`Status lowongan "${j.title}" diubah menjadi ${nextStatus}`);
          return { ...j, status: nextStatus };
        }
        return j;
      })
    );
  };

  // CV Order Handlers
  const handleAddCvOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvClientName || !newCvClientEmail || !newCvTargetRole) return;
    const now = new Date();
    const formattedNow = `${now.getDate()} Jul 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newOrder: CvOrderProgressItem = {
      id: `CV-ORD-80${cvOrdersList.length + 1}`,
      clientName: newCvClientName,
      clientEmail: newCvClientEmail,
      packageType: newCvPackageType,
      targetRole: newCvTargetRole,
      requestDate: formattedNow,
      targetCompletionDate: newCvTargetDate || '25 Jul 2026, 17:00 WIB',
      assignedTo: newCvAssignedTo,
      assignedRole: newCvAssignedRole,
      progressPercent: 10,
      status: 'Masuk Permintaan',
      notes: 'Permintaan pengerjaan CV baru saja dibuat oleh admin.',
    };
    setCvOrdersList([newOrder, ...cvOrdersList]);
    setIsAddCvOrderModalOpen(false);
    setNewCvClientName('');
    setNewCvClientEmail('');
    setNewCvTargetRole('');
    showToast(`Order pengerjaan CV baru untuk ${newOrder.clientName} berhasil dibuat!`);
  };

  const handleUpdateCvProgress = (id: string, newPercent: number, newStatus?: CvOrderProgressItem['status'], newNotes?: string) => {
    setCvOrdersList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedStatus = newStatus || (newPercent === 100 ? 'Selesai' : newPercent >= 85 ? 'Review Quality Control' : 'Dalam Pengerjaan');
          showToast(`Progress CV ${item.clientName} diubah menjadi ${newPercent}% (${updatedStatus})`);
          return {
            ...item,
            progressPercent: newPercent,
            status: updatedStatus,
            notes: newNotes !== undefined ? newNotes : item.notes,
          };
        }
        return item;
      })
    );
  };

  const handleAssignCvWorker = (id: string, assignedTo: string, assignedRole: string) => {
    setCvOrdersList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          showToast(`Penanggung jawab CV ${item.clientName} diubah ke ${assignedTo}`);
          return {
            ...item,
            assignedTo,
            assignedRole,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteCvOrder = (id: string) => {
    setCvOrdersList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Order CV ${id} berhasil dihapus.`);
  };

  // Filtered CV Orders
  const filteredCvOrders = cvOrdersList.filter((c) => {
    const matchSearch =
      c.clientName.toLowerCase().includes(cvOrderSearch.toLowerCase()) ||
      c.clientEmail.toLowerCase().includes(cvOrderSearch.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(cvOrderSearch.toLowerCase()) ||
      c.targetRole.toLowerCase().includes(cvOrderSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(cvOrderSearch.toLowerCase());
    const matchStatus = cvOrderStatusFilter === 'All' || c.status === cvOrderStatusFilter;
    const matchWorker = cvOrderWorkerFilter === 'All' || c.assignedTo === cvOrderWorkerFilter;
    return matchSearch && matchStatus && matchWorker;
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchPlan = userPlanFilter === 'All' || u.plan === userPlanFilter;
    return matchSearch && matchPlan;
  });

  // Filtered Transactions
  const filteredTransactions = transactionsList.filter((tx) => {
    const matchSearch = tx.id.toLowerCase().includes(txSearch.toLowerCase()) || tx.user.toLowerCase().includes(txSearch.toLowerCase()) || tx.email.toLowerCase().includes(txSearch.toLowerCase());
    const matchStatus = txStatusFilter === 'All' || tx.status === txStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered Jobs
  const filteredJobs = jobsList.filter((j) => {
    return j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-violet-500/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Control Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                Portal Super Admin
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Normal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Dashboard Administrator CUTI
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pusat kendali utama pengguna, transaksi keuangan, misi harian, database lowongan kerja, dan konfigurasi engine AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onSwitchToUserPortal && (
              <button
                onClick={onSwitchToUserPortal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transition group"
              >
                <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali ke Dashboard User</span>
              </button>
            )}
            <button
              onClick={() => showToast('Data dashboard berhasil diperbarui!')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 text-violet-400" />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => showToast('Laporan bulanan berhasil diunduh (PDF)')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'overview'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan & Stat</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cv-orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'cv-orders'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Progress CV</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
            {cvOrdersList.filter((c) => c.status !== 'Selesai').length} Proses
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'users'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'transactions'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Transaksi</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {transactionsList.filter((t) => t.status === 'Pending').length} Pending
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('missions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'missions'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Misi & Cuan</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'jobs'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Lowongan Kerja</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'system'
              ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Sistem & AI</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Pengguna</span>
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">24.850</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% bulan ini</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                18.200 Gratis | 6.650 Pro Member
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Pendapatan</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">Rp 184,25 Jt</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+24.2% dibanding Juni</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                Rata-rata Rp 6,1 Jt / hari
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">CV ATS Dibuat</span>
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">142.890</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+32.1% aktif dikirim</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                Skor ATS rata-rata: 84 / 100
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sesi Interview AI</span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">48.210</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+15.6% peningkatan</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                Respon Gemini API: 1,2s
              </p>
            </div>
          </div>

          {/* Activity Log & Quick System Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Actions & Monitor */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Performance Overview Card */}
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Status Infrastruktur & Engine AI
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Semua Layanan Normal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-violet-500" />
                      <span>Gemini AI Model</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Gemini 2.0 Flash</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Latency 1.2s (Optimal)</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Database className="w-3.5 h-3.5 text-violet-500" />
                      <span>Database Firestore</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">99,98% Uptime</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Koneksi Stabil</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Payment Gateway</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Midtrans & QRIS</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Auto Verification</p>
                  </div>
                </div>
              </div>

              {/* CV Progress Monitor Widget in Overview */}
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-500" />
                      <span>Live Monitor Pengerjaan & Request CV</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Progress pembuatan CV, penanggung jawab spesialis HR, waktu masuk & target selesai.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('cv-orders')}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>Kelola Semua ({cvOrdersList.length})</span>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>

                <div className="space-y-3">
                  {cvOrdersList.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{order.clientName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                              {order.id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {order.packageType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.targetRole}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              order.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : order.status === 'Review Quality Control'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : order.status === 'Dalam Pengerjaan'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : order.status === 'Revisi'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
                            }`}
                          >
                            {order.status} ({order.progressPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            order.progressPercent === 100
                              ? 'bg-emerald-500'
                              : order.progressPercent >= 75
                              ? 'bg-violet-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${order.progressPercent}%` }}
                        ></div>
                      </div>

                      {/* Workers & Time Detail */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-violet-500" />
                          <span>Pengerjaan oleh: <strong className="text-slate-800 dark:text-slate-200">{order.assignedTo}</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>Masuk: <strong className="text-slate-700 dark:text-slate-300">{order.requestDate}</strong></span>
                          <span>Selesai: <strong className="text-emerald-600 dark:text-emerald-400">{order.targetCompletionDate}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Pending Transactions Preview */}
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Transaksi Menunggu Verifikasi Manual</span>
                  </h3>
                  <button
                    onClick={() => setActiveAdminTab('transactions')}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {transactionsList.filter((t) => t.status === 'Pending').map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{tx.user}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            {tx.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tx.plan} - <span className="font-bold text-slate-800 dark:text-slate-200">{tx.amount}</span> ({tx.method})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveTx(tx.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                          Verifikasi Pembayaran
                        </button>
                      </div>
                    </div>
                  ))}
                  {transactionsList.filter((t) => t.status === 'Pending').length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">Tidak ada transaksi yang memerlukan verifikasi manual saat ini.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Shortcuts & System Log */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-500" />
                  <span>Aksi Cepat Admin</span>
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsAddCvOrderModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Input Order CV Baru</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-500 -rotate-90" />
                  </button>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span>Tambah Pengguna Baru</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                  </button>

                  <button
                    onClick={() => setIsAddMissionModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-amber-500" />
                      <span>Buat Misi Cuan Baru</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                  </button>

                  <button
                    onClick={() => setIsAddJobModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      <span>Posting Lowongan Kerja</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                  </button>
                </div>
              </div>

              {/* System Audit Trail Log */}
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Log Aktivitas Admin</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      User <span className="text-violet-600 dark:text-violet-400 font-bold">Dewi Lestari</span> di-upgrade ke Pro.
                    </p>
                    <span className="text-[10px] text-slate-400">10 menit lalu oleh SuperAdmin</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Lowongan <span className="text-violet-600 dark:text-violet-400 font-bold">Senior Frontend Dev</span> ditambahkan.
                    </p>
                    <span className="text-[10px] text-slate-400">1 jam lalu oleh Admin Maya</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Misi <span className="text-violet-600 dark:text-violet-400 font-bold">Lengkapi Data Readiness</span> diperbarui.
                    </p>
                    <span className="text-[10px] text-slate-400">3 jam lalu oleh System AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CV PROGRESS MANAGEMENT */}
      {activeAdminTab === 'cv-orders' && (
        <div className="space-y-6">
          {/* Header & Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Permintaan Masuk</span>
                <Clock className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{cvOrdersList.length}</p>
              <p className="text-[10px] text-slate-400">Total order pengerjaan CV terdaftar</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Sedang Dikerjakan</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {cvOrdersList.filter((c) => c.status === 'Dalam Pengerjaan' || c.status === 'Masuk Permintaan').length}
              </p>
              <p className="text-[10px] text-slate-400">Penyusunan draft & optimasi ATS</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Review Quality Control</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {cvOrdersList.filter((c) => c.status === 'Review Quality Control').length}
              </p>
              <p className="text-[10px] text-slate-400">Tahap audit skor & proofreading HR</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Selesai & Terkirim</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {cvOrdersList.filter((c) => c.status === 'Selesai').length}
              </p>
              <p className="text-[10px] text-slate-400">Terkirim ke email & WhatsApp klien</p>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama klien, email, penanggung jawab HR, atau ID order..."
                  value={cvOrderSearch}
                  onChange={(e) => setCvOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={cvOrderStatusFilter}
                  onChange={(e) => setCvOrderStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 pr-8 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Semua Status Pengerjaan</option>
                  <option value="Masuk Permintaan">Masuk Permintaan</option>
                  <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                  <option value="Review Quality Control">Review Quality Control</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Revisi">Revisi</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Specialist Filter */}
              <div className="relative">
                <select
                  value={cvOrderWorkerFilter}
                  onChange={(e) => setCvOrderWorkerFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 pr-8 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Semua Penanggung Jawab</option>
                  <option value="Siti Aminah, M.Psi">Siti Aminah, M.Psi</option>
                  <option value="Ahmad Fikri, S.Psi">Ahmad Fikri, S.Psi</option>
                  <option value="Rina Febriani, S.Kom">Rina Febriani, S.Kom</option>
                  <option value="Rizky Kurniawan">Rizky Kurniawan</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => setIsAddCvOrderModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Input Request CV Baru</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">ID & Paket CV</th>
                  <th className="p-4">Pemohon / Klien</th>
                  <th className="p-4">Kapan Masuk Permintaan</th>
                  <th className="p-4">Kapan Selesai (SLA)</th>
                  <th className="p-4">Siapa Yang Mengerjakan</th>
                  <th className="p-4">Progress CV & Status</th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4 text-center">Aksi / Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCvOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      <span className="block text-violet-600 dark:text-violet-400">{order.id}</span>
                      <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-slate-400">
                        {order.packageType}
                      </span>
                    </td>

                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{order.clientName}</span>
                        <span className="text-[10px] text-slate-400 block">{order.clientEmail}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {order.targetRole}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                        <span>{order.requestDate}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{order.targetCompletionDate}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{order.assignedTo}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-5">{order.assignedRole}</span>
                      </div>
                    </td>

                    <td className="p-4 space-y-1.5 min-w-[170px]">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            order.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.status === 'Review Quality Control'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : order.status === 'Dalam Pengerjaan'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : order.status === 'Revisi'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{order.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            order.progressPercent === 100
                              ? 'bg-emerald-500'
                              : order.progressPercent >= 75
                              ? 'bg-violet-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${order.progressPercent}%` }}
                        ></div>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                        &quot;{order.notes}&quot;
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingCvOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-50 hover:bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 dark:text-violet-300 transition flex items-center gap-1"
                          title="Update Progress & Pekerja"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>

                        {order.progressPercent < 100 && (
                          <button
                            onClick={() => handleUpdateCvProgress(order.id, 100, 'Selesai')}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1"
                            title="Tandai Selesai"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCvOrder(order.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Hapus Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCvOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      Tidak ada data pengerjaan CV yang sesuai dengan pencarian atau filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengguna berdasarkan nama atau email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Paket:</span>
              </div>
              <div className="relative">
                <select
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value as any)}
                  className="px-3 py-2 pr-8 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Semua Paket</option>
                  <option value="Free">Free Member</option>
                  <option value="Pro Member">Pro Member</option>
                  <option value="Lifetime">Lifetime Pass</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">ID & Nama</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Peran</th>
                  <th className="p-4">Paket Status</th>
                  <th className="p-4">Status Akun</th>
                  <th className="p-4">Tanggal Bergabung</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.plan === 'Lifetime' || u.plan === 'Pro Member'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {u.status === 'Aktif' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{u.joinedDate}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {u.plan === 'Free' && (
                          <button
                            onClick={() => handleUpgradeUserPlan(u.id)}
                            title="Upgrade ke Lifetime Pass Pro"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          title={u.status === 'Aktif' ? 'Tangguhkan Pengguna' : 'Aktifkan Pengguna'}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'Aktif'
                              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                          }`}
                        >
                          {u.status === 'Aktif' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS MANAGEMENT */}
      {activeAdminTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi berdasarkan ID, nama, atau email..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">Status:</span>
              <div className="relative">
                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value as any)}
                  className="px-3 py-2 pr-8 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Semua Transaksi</option>
                  <option value="Berhasil">Berhasil</option>
                  <option value="Pending">Pending</option>
                  <option value="Gagal">Gagal</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">ID Transaksi</th>
                  <th className="p-4">Pembeli</th>
                  <th className="p-4">Paket Dibelikan</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Metode Bayar</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{tx.id}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{tx.user}</span>
                        <span className="text-[10px] text-slate-400">{tx.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{tx.plan}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{tx.amount}</td>
                    <td className="p-4 text-slate-500">{tx.method}</td>
                    <td className="p-4 text-slate-500">{tx.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tx.status === 'Berhasil'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {tx.status === 'Pending' ? (
                        <button
                          onClick={() => handleApproveTx(tx.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                        >
                          Setujui
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MISSIONS MANAGEMENT */}
      {activeAdminTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Misi & Cuan Komunitas</h3>
              <p className="text-xs text-slate-500">Kelola misi harian, reward poin, dan hadiah uang tunai rupiah.</p>
            </div>
            <button
              onClick={() => setIsAddMissionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Misi Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missionsList.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 mb-1 inline-block">
                      {m.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{m.title}</h4>
                  </div>
                  <button
                    onClick={() => handleToggleMissionStatus(m.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                      m.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {m.status}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reward Poin</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">+{m.rewardPoints} Poin</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reward Cash</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Rp {m.rewardCash.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Diselesaikan</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{m.completedCount} Pengguna</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: JOBS MANAGEMENT */}
      {activeAdminTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari lowongan berdasarkan posisi atau perusahaan..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={() => setIsAddJobModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lowongan Kerja</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Posisi & Perusahaan</th>
                  <th className="p-4">Lokasi & Tipe</th>
                  <th className="p-4">Kisaran Gaji</th>
                  <th className="p-4 text-center">Pelamar</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{j.title}</span>
                        <span className="text-[10px] text-slate-400">{j.company}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">{j.location}</span>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">{j.type}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{j.salary}</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">{j.applicants} Pelamar</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        j.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleJobStatus(j.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          j.status === 'Aktif'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50'
                        }`}
                      >
                        {j.status === 'Aktif' ? 'Tutup' : 'Buka Kembali'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM & AI CONFIG */}
      {activeAdminTab === 'system' && (
        <div className="space-y-6">
          {/* Provider Selection Header Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-violet-900/90 via-slate-900 to-slate-900 border border-violet-800/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Pusat Konfigurasi Engine AI System</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Multi-Provider
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Atur model bahasa yang digunakan untuk pembuatan CV ATS otomatis, analisa skor readiness, dan wawancara AI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setAiProvider('openai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  aiProvider === 'openai'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>OpenAI Compatible</span>
              </button>
              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  aiProvider === 'gemini'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Google Gemini</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: OPENAI COMPATIBLE CONFIGURATION */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Konfigurasi OpenAI Compatible API
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mendukung OpenAI, Groq, OpenRouter, Together AI, vLLM, dan Ollama Local Endpoint.
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  aiProvider === 'openai'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {aiProvider === 'openai' ? 'Engine Aktif' : 'Engine Standby'}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Input Link / Base URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-violet-500" />
                      <span>Input Link Base URL / Endpoint API</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">/v1/chat/completions</span>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://api.openai.com/v1"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                  
                  {/* Endpoint Presets Quick Buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenaiBaseUrl('https://api.openai.com/v1');
                        setOpenaiModel('gpt-4o-mini');
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      OpenAI Official
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenaiBaseUrl('https://api.groq.com/openai/v1');
                        setOpenaiModel('llama-3.3-70b-versatile');
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      Groq Cloud
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenaiBaseUrl('https://openrouter.ai/api/v1');
                        setOpenaiModel('deepseek/deepseek-r1');
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      OpenRouter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenaiBaseUrl('http://localhost:11434/v1');
                        setOpenaiModel('llama3');
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      Ollama Local
                    </button>
                  </div>
                </div>

                {/* Input API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Input API Key OpenAI Compatible</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Rahasian & Terenkripsi</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      required
                      placeholder="sk-proj-..."
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      title={showApiKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Input Model Name */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Model AI (Model Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile, deepseek-r1"
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pastikan nama model sesuai dengan yang didukung oleh provider endpoint yang digunakan.
                  </p>
                </div>

                {/* Action Buttons: Test Connection & Save */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestingConnection(true);
                      setTimeout(() => {
                        setIsTestingConnection(false);
                        showToast(`Koneksi ke Endpoint (${openaiBaseUrl}) Berhasil Terhubung!`);
                      }, 1200);
                    }}
                    disabled={isTestingConnection}
                    className="flex-1 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    {isTestingConnection ? (
                      <RefreshCw className="w-4 h-4 text-violet-500 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>{isTestingConnection ? 'Menguji Koneksi...' : 'Uji Koneksi API'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAiProvider('openai');
                      showToast('Konfigurasi OpenAI Compatible berhasil disimpan & diaktifkan!');
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan &amp; Aktifkan OpenAI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: GOOGLE GEMINI AI CONFIGURATION */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Konfigurasi Google Gemini AI Engine
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Engine bawaan Google GenAI SDK untuk kecepatan tinggi.
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  aiProvider === 'gemini'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {aiProvider === 'gemini' ? 'Engine Aktif' : 'Engine Standby'}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pilihan AI Model Default Gemini
                  </label>
                  <div className="relative">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
                    >
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Sangat Cepat & Disarankan)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & Complex CV)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standar Balanced)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Batas Kuota AI Non-Pro (Free Member)
                  </label>
                  <input
                    type="text"
                    value={aiRateLimit}
                    onChange={(e) => setAiRateLimit(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAiProvider('gemini');
                      showToast('Konfigurasi Google Gemini AI berhasil disimpan & diaktifkan!');
                    }}
                    className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan &amp; Aktifkan Gemini</span>
                  </button>
                </div>
              </div>

              {/* System Maintenance & Cache Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>Sistem &amp; Mode Pemeliharaan</span>
                </h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Mode Maintenance</span>
                    <span className="text-[10px] text-slate-400">Batasi akses sementara pengguna.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(`Mode maintenance ${!maintenanceMode ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      maintenanceMode
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {maintenanceMode ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Cache server & database berhasil dibersihkan!')}
                  className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition border border-slate-200 dark:border-slate-700 text-xs"
                >
                  Bersihkan Cache Server
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tambah Pengguna Baru</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Gunawan"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. budi@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Paket Akses</label>
                <div className="relative">
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as any)}
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Free">Free Member</option>
                    <option value="Pro Member">Pro Member (1 Bulan)</option>
                    <option value="Lifetime">Lifetime Pass Pro</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-sm"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MISSION */}
      {isAddMissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Buat Misi & Cuan Baru</h3>
              <button onClick={() => setIsAddMissionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMission} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Misi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bagikan CV ATS ke LinkedIn"
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kategori</label>
                <div className="relative">
                  <select
                    value={newMissionCategory}
                    onChange={(e) => setNewMissionCategory(e.target.value as any)}
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Referral">Referral</option>
                    <option value="Spesial">Spesial</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reward Poin</label>
                  <input
                    type="number"
                    value={newMissionPoints}
                    onChange={(e) => setNewMissionPoints(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reward Cash (Rp)</label>
                  <input
                    type="number"
                    value={newMissionCash}
                    onChange={(e) => setNewMissionCash(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMissionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm"
                >
                  Simpan Misi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD JOB */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tambah Lowongan Kerja</h3>
              <button onClick={() => setIsAddJobModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Posisi Pekerjaan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Engineer (Go/Node.js)"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Perusahaan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PT Goto Gojek Tokopedia"
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Lokasi</label>
                <input
                  type="text"
                  placeholder="e.g. Jakarta Selatan (Hybrid)"
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipe Kerjasama</label>
                  <div className="relative">
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value as any)}
                      className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Contract">Contract</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kisaran Gaji</label>
                  <input
                    type="text"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-sm"
                >
                  Publish Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CV ORDER */}
      {isAddCvOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Input Request CV Baru</h3>
              </div>
              <button onClick={() => setIsAddCvOrderModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCvOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Pemohon / Klien</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Andi Pratama"
                  value={newCvClientName}
                  onChange={(e) => setNewCvClientName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Klien</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. andi.pratama@email.com"
                  value={newCvClientEmail}
                  onChange={(e) => setNewCvClientEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Paket Layanan</label>
                  <div className="relative">
                    <select
                      value={newCvPackageType}
                      onChange={(e) => setNewCvPackageType(e.target.value as any)}
                      className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="CV ATS Starter">CV ATS Starter</option>
                      <option value="CV Pro & Cover Letter">CV Pro & Cover Letter</option>
                      <option value="VIP Career & Coaching">VIP Career & Coaching</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Posisi / Job</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Product Manager"
                    value={newCvTargetRole}
                    onChange={(e) => setNewCvTargetRole(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Penanggung Jawab</label>
                  <div className="relative">
                    <select
                      value={newCvAssignedTo}
                      onChange={(e) => {
                        setNewCvAssignedTo(e.target.value);
                        if (e.target.value.includes('Siti')) setNewCvAssignedRole('Senior HR Specialist');
                        else if (e.target.value.includes('Ahmad')) setNewCvAssignedRole('Lead Career Consultant');
                        else if (e.target.value.includes('Rina')) setNewCvAssignedRole('Senior Tech Recruiter');
                        else setNewCvAssignedRole('AI CV Specialist');
                      }}
                      className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="Siti Aminah, M.Psi">Siti Aminah, M.Psi</option>
                      <option value="Ahmad Fikri, S.Psi">Ahmad Fikri, S.Psi</option>
                      <option value="Rina Febriani, S.Kom">Rina Febriani, S.Kom</option>
                      <option value="Rizky Kurniawan">Rizky Kurniawan</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Selesai (SLA)</label>
                  <input
                    type="text"
                    value={newCvTargetDate}
                    onChange={(e) => setNewCvTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCvOrderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-sm"
                >
                  Simpan & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / UPDATE CV ORDER PROGRESS */}
      {editingCvOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Update Progress CV</h3>
                <p className="text-[10px] text-slate-400">{editingCvOrder.id} - {editingCvOrder.clientName}</p>
              </div>
              <button onClick={() => setEditingCvOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Persentase Progress CV</label>
                  <span className="font-bold text-violet-600 dark:text-violet-400 text-sm">{editingCvOrder.progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingCvOrder.progressPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditingCvOrder({
                      ...editingCvOrder,
                      progressPercent: val,
                      status: val === 100 ? 'Selesai' : val >= 85 ? 'Review Quality Control' : val > 0 ? 'Dalam Pengerjaan' : 'Masuk Permintaan',
                    });
                  }}
                  className="w-full accent-violet-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (Masuk)</span>
                  <span>50% (Drafting)</span>
                  <span>85% (QC Review)</span>
                  <span>100% (Selesai)</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Pengerjaan</label>
                <div className="relative">
                  <select
                    value={editingCvOrder.status}
                    onChange={(e) => setEditingCvOrder({ ...editingCvOrder, status: e.target.value as any })}
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Masuk Permintaan">Masuk Permintaan</option>
                    <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                    <option value="Review Quality Control">Review Quality Control</option>
                    <option value="Revisi">Revisi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Penanggung Jawab Pengerjaan</label>
                <div className="relative">
                  <select
                    value={editingCvOrder.assignedTo}
                    onChange={(e) => {
                      const worker = e.target.value;
                      let role = 'Senior HR Specialist';
                      if (worker.includes('Ahmad')) role = 'Lead Career Consultant';
                      else if (worker.includes('Rina')) role = 'Senior Tech Recruiter';
                      else if (worker.includes('Rizky')) role = 'AI CV Specialist';
                      setEditingCvOrder({ ...editingCvOrder, assignedTo: worker, assignedRole: role });
                    }}
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Siti Aminah, M.Psi">Siti Aminah, M.Psi (Senior HR Specialist)</option>
                    <option value="Ahmad Fikri, S.Psi">Ahmad Fikri, S.Psi (Lead Career Consultant)</option>
                    <option value="Rina Febriani, S.Kom">Rina Febriani, S.Kom (Senior Tech Recruiter)</option>
                    <option value="Rizky Kurniawan">Rizky Kurniawan (AI CV Specialist)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Pengerjaan / Status Detail</label>
                <textarea
                  rows={3}
                  value={editingCvOrder.notes}
                  onChange={(e) => setEditingCvOrder({ ...editingCvOrder, notes: e.target.value })}
                  placeholder="Catatan pengerjaan atau detail revisi dari klien..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCvOrder(null)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateCvProgress(
                      editingCvOrder.id,
                      editingCvOrder.progressPercent,
                      editingCvOrder.status,
                      editingCvOrder.notes
                    );
                    handleAssignCvWorker(editingCvOrder.id, editingCvOrder.assignedTo, editingCvOrder.assignedRole);
                    setEditingCvOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
