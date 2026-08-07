'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Calendar,
  Trash2,
  MapPin,
  Kanban,
  List,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

export interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  location: string;
  appliedDate: string;
  status: 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak';
  salary: string;
  notes: string;
  portal: string;
  portalUrl?: string;
}

const initialApplications: ApplicationItem[] = [
  {
    id: 'app-1',
    company: 'PT Tokopedia',
    position: 'Senior Frontend Engineer',
    location: 'Jakarta (Hybrid)',
    appliedDate: '18 Juli 2026',
    status: 'Interview',
    salary: 'Rp 18.000.000 - Rp 25.000.000',
    notes: 'Interview User dijadwalkan tanggal 25 Juli 2026 jam 10:00 WIB',
    portal: 'LinkedIn',
    portalUrl: 'https://linkedin.com/jobs',
  },
  {
    id: 'app-2',
    company: 'Gojek (GoTo Group)',
    position: 'React Native Developer',
    location: 'Jakarta (Onsite)',
    appliedDate: '15 Juli 2026',
    status: 'Offering',
    salary: 'Rp 22.000.000',
    notes: 'Offering letter sudah diterima, batas konfirmasi hingga 28 Juli 2026',
    portal: 'Glints',
    portalUrl: 'https://glints.com/id',
  },
  {
    id: 'app-3',
    company: 'PT Astra International',
    position: 'Full Stack Web Developer',
    location: 'Jakarta Selatan',
    appliedDate: '10 Juli 2026',
    status: 'Screening',
    salary: 'Rp 15.000.000 - Rp 20.000.000',
    notes: 'Menunggu hasil kuis koding online ATS',
    portal: 'JobStreet',
    portalUrl: 'https://jobstreet.co.id',
  },
  {
    id: 'app-4',
    company: 'Bank Central Asia (BCA)',
    position: 'IT Specialist Developer',
    location: 'Tangerang',
    appliedDate: '02 Juli 2026',
    status: 'Terkirim',
    salary: 'Rp 14.000.000',
    notes: 'Lamaran via portal resmi BCA Careers',
    portal: 'Website Perusahaan',
    portalUrl: 'https://karir.bca.co.id',
  },
  {
    id: 'app-5',
    company: 'Shopee Indonesia',
    position: 'UI/UX Specialist',
    location: 'Jakarta',
    appliedDate: '20 Juni 2026',
    status: 'Ditolak',
    salary: 'Rp 16.000.000',
    notes: 'Posisi telah terisi oleh kandidat internal',
    portal: 'KitaLulus',
    portalUrl: 'https://kitalulus.com',
  },
];

const KANBAN_COLUMNS: Array<{
  status: ApplicationItem['status'];
  label: string;
  colorClass: string;
  badgeBg: string;
}> = [
  {
    status: 'Terkirim',
    label: 'Terkirim',
    colorClass: 'border-sky-500/30 bg-sky-500/5',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    status: 'Screening',
    label: 'Screening',
    colorClass: 'border-violet-500/30 bg-violet-500/5',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
  {
    status: 'Interview',
    label: 'Interview',
    colorClass: 'border-amber-500/30 bg-amber-500/5',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    status: 'Offering',
    label: 'Offering',
    colorClass: 'border-emerald-500/30 bg-emerald-500/5',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    status: 'Ditolak',
    label: 'Ditolak',
    colorClass: 'border-rose-500/30 bg-rose-500/5',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
];

export interface CardColorPalette {
  bg: string;
  border: string;
  hoverBorder: string;
  accentBar: string;
  companyText: string;
  tagBg: string;
  tagText: string;
  iconColor: string;
  dotBg: string;
}

const CARD_PALETTES: CardColorPalette[] = [
  // 1. Vibrant Rose / Coral
  {
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
    accentBar: 'bg-gradient-to-r from-rose-400 to-pink-500',
    companyText: 'text-rose-700 dark:text-rose-300 font-bold',
    tagBg: 'bg-rose-100/90 dark:bg-rose-900/60',
    tagText: 'text-rose-800 dark:text-rose-200',
    iconColor: 'text-rose-500',
    dotBg: 'bg-rose-500',
  },
  // 2. Bright Amber / Peach
  {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-200/90 dark:border-amber-800/60',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
    accentBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    companyText: 'text-amber-700 dark:text-amber-300 font-bold',
    tagBg: 'bg-amber-100/90 dark:bg-amber-900/60',
    tagText: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500',
    dotBg: 'bg-amber-500',
  },
  // 3. Fresh Emerald / Mint
  {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-200/90 dark:border-emerald-800/60',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    accentBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    companyText: 'text-emerald-700 dark:text-emerald-300 font-bold',
    tagBg: 'bg-emerald-100/90 dark:bg-emerald-900/60',
    tagText: 'text-emerald-800 dark:text-emerald-200',
    iconColor: 'text-emerald-500',
    dotBg: 'bg-emerald-500',
  },
  // 4. Vibrant Sky / Cyan
  {
    bg: 'bg-sky-50/90 dark:bg-sky-950/40',
    border: 'border-sky-200/90 dark:border-sky-800/60',
    hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
    accentBar: 'bg-gradient-to-r from-sky-400 to-blue-500',
    companyText: 'text-sky-700 dark:text-sky-300 font-bold',
    tagBg: 'bg-sky-100/90 dark:bg-sky-900/60',
    tagText: 'text-sky-800 dark:text-sky-200',
    iconColor: 'text-sky-500',
    dotBg: 'bg-sky-500',
  },
  // 5. Electric Violet / Purple
  {
    bg: 'bg-violet-50/90 dark:bg-violet-950/40',
    border: 'border-violet-200/90 dark:border-violet-800/60',
    hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-500',
    accentBar: 'bg-gradient-to-r from-violet-400 to-purple-500',
    companyText: 'text-violet-700 dark:text-violet-300 font-bold',
    tagBg: 'bg-violet-100/90 dark:bg-violet-900/60',
    tagText: 'text-violet-800 dark:text-violet-200',
    iconColor: 'text-violet-500',
    dotBg: 'bg-violet-500',
  },
  // 6. Royal Indigo / Blue
  {
    bg: 'bg-indigo-50/90 dark:bg-indigo-950/40',
    border: 'border-indigo-200/90 dark:border-indigo-800/60',
    hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    accentBar: 'bg-gradient-to-r from-indigo-400 to-blue-600',
    companyText: 'text-indigo-700 dark:text-indigo-300 font-bold',
    tagBg: 'bg-indigo-100/90 dark:bg-indigo-900/60',
    tagText: 'text-indigo-800 dark:text-indigo-200',
    iconColor: 'text-indigo-500',
    dotBg: 'bg-indigo-500',
  },
  // 7. Bright Teal / Turquoise
  {
    bg: 'bg-teal-50/90 dark:bg-teal-950/40',
    border: 'border-teal-200/90 dark:border-teal-800/60',
    hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
    accentBar: 'bg-gradient-to-r from-teal-400 to-cyan-500',
    companyText: 'text-teal-700 dark:text-teal-300 font-bold',
    tagBg: 'bg-teal-100/90 dark:bg-teal-900/60',
    tagText: 'text-teal-800 dark:text-teal-200',
    iconColor: 'text-teal-500',
    dotBg: 'bg-teal-500',
  },
  // 8. Hot Fuchsia / Pink
  {
    bg: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/40',
    border: 'border-fuchsia-200/90 dark:border-fuchsia-800/60',
    hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
    accentBar: 'bg-gradient-to-r from-fuchsia-400 to-pink-600',
    companyText: 'text-fuchsia-700 dark:text-fuchsia-300 font-bold',
    tagBg: 'bg-fuchsia-100/90 dark:bg-fuchsia-900/60',
    tagText: 'text-fuchsia-800 dark:text-fuchsia-200',
    iconColor: 'text-fuchsia-500',
    dotBg: 'bg-fuchsia-500',
  },
];

const getCardPalette = (id: string): CardColorPalette => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_PALETTES.length;
  return CARD_PALETTES[index];
};

export const TrackerView: React.FC = () => {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApplications);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Pointer Drag and Drop State
  const [activeDragItem, setActiveDragItem] = useState<ApplicationItem | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState<number>(280);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationItem['status'] | null>(null);

  const handlePointerDownCard = (e: React.PointerEvent<HTMLDivElement>, app: ApplicationItem) => {
    // Skip if clicking delete button
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setActiveDragItem(app);
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: offsetX, y: offsetY });
    setDragWidth(rect.width);
    setDragOverColumn(app.status);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });

      const elemBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const colElem = elemBelow?.closest('[data-column-status]');
      if (colElem) {
        const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
        setDragOverColumn(targetStatus);
      } else {
        setDragOverColumn(null);
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      const elemBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const colElem = elemBelow?.closest('[data-column-status]');
      if (colElem) {
        const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
        handleUpdateStatus(app.id, targetStatus);
      }

      setActiveDragItem(null);
      setDragOverColumn(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAppliedDate, setNewAppliedDate] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationItem['status']>('Terkirim');
  const [newSalary, setNewSalary] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPortal, setNewPortal] = useState('LinkedIn');
  const [customPortal, setCustomPortal] = useState('');
  const [newPortalUrl, setNewPortalUrl] = useState('');

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newPosition) return;

    const finalPortal = newPortal === 'Lainnya' ? (customPortal.trim() || 'Custom Portal') : newPortal;

    const newApp: ApplicationItem = {
      id: `app-${apps.length + 1}`,
      company: newCompany,
      position: newPosition,
      location: newLocation || 'Jakarta',
      appliedDate: newAppliedDate || 'Hari ini',
      status: newStatus,
      salary: newSalary || '-',
      notes: newNotes,
      portal: finalPortal,
      portalUrl: newPortalUrl.trim(),
    };

    setApps([newApp, ...apps]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCompany('');
    setNewPosition('');
    setNewLocation('');
    setNewAppliedDate('');
    setNewStatus('Terkirim');
    setNewSalary('');
    setNewNotes('');
    setNewPortal('LinkedIn');
    setCustomPortal('');
    setNewPortalUrl('');
  };

  const handleDeleteApp = (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateStatus = (id: string, status: ApplicationItem['status']) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const filteredApps = apps.filter((a) => {
    const matchesFilter = filterStatus === 'Semua' || a.status === filterStatus;
    const matchesSearch =
      a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.portal || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Table Sorting State
  type SortField = 'company' | 'position' | 'location' | 'appliedDate' | 'salary' | 'status' | 'portal';
  type SortDirection = 'asc' | 'desc';

  const [sortField, setSortField] = useState<SortField | null>('appliedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredApps = [...filteredApps].sort((a, b) => {
    if (!sortField) return 0;

    let valA: string | number = '';
    let valB: string | number = '';

    if (sortField === 'company') {
      valA = a.company.toLowerCase();
      valB = b.company.toLowerCase();
    } else if (sortField === 'position') {
      valA = a.position.toLowerCase();
      valB = b.position.toLowerCase();
    } else if (sortField === 'location') {
      valA = a.location.toLowerCase();
      valB = b.location.toLowerCase();
    } else if (sortField === 'appliedDate') {
      valA = a.appliedDate.toLowerCase();
      valB = b.appliedDate.toLowerCase();
    } else if (sortField === 'salary') {
      valA = a.salary.toLowerCase();
      valB = b.salary.toLowerCase();
    } else if (sortField === 'portal') {
      valA = (a.portal || '').toLowerCase();
      valB = (b.portal || '').toLowerCase();
    } else if (sortField === 'status') {
      const statusOrder: Record<string, number> = {
        'Terkirim': 1,
        'Screening': 2,
        'Interview': 3,
        'Offering': 4,
        'Ditolak': 5,
      };
      valA = statusOrder[a.status] || 99;
      valB = statusOrder[b.status] || 99;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadgeClass = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Offering':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Interview':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Screening':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-400 border-violet-200 dark:border-violet-800/50';
      case 'Terkirim':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-400 border-sky-200 dark:border-sky-800/50';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const counts = {
    total: apps.length,
    terkirim: apps.filter((a) => a.status === 'Terkirim' || a.status === 'Screening').length,
    interview: apps.filter((a) => a.status === 'Interview').length,
    offering: apps.filter((a) => a.status === 'Offering').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0D3BD9] rounded-xl p-6 text-white border border-blue-500/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 font-semibold text-xs mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Manajemen Lamaran Pekerjaan</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Tracker Lamaran Kerja
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Pantau status semua lamaran kerja kamu dari interview hingga offering letter dalam satu dashboard terpusat.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D3BD9] hover:bg-[#0B33BD] text-white font-bold text-xs shadow-md transition-all shrink-0 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lamaran Baru</span>
          </button>
        </div>

        {/* Mini Pipeline Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Lamaran</span>
            <span className="text-xl font-black text-white">{counts.total}</span>
          </div>
          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Proses Screening</span>
            <span className="text-xl font-black text-sky-300">{counts.terkirim}</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Tahap Interview</span>
            <span className="text-xl font-black text-amber-300">{counts.interview}</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Job Offering</span>
            <span className="text-xl font-black text-emerald-300">{counts.offering}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher (Kanban vs Table), Search, and Status Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel List</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perusahaan atau posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {['Semua', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="space-y-3">
          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 items-start min-h-[450px]">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = filteredApps.filter((a) => a.status === col.status);
              const isOver = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  data-column-status={col.status}
                  className={`snap-center shrink-0 w-[85vw] sm:w-[320px] lg:w-auto rounded-xl border transition-all duration-200 p-3 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs ${
                    isOver
                      ? 'border-violet-500 ring-2 ring-violet-500/40 bg-violet-50/50 dark:bg-violet-950/30 scale-[1.01]'
                      : `${col.colorClass}`
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${col.badgeBg}`}>
                        {col.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards List in Column */}
                  <div className="space-y-3 min-h-[220px] transition-all">
                    {columnApps.length === 0 ? (
                      <div className={`p-6 text-center text-slate-400 text-[11px] border border-dashed rounded-lg transition ${
                        isOver ? 'border-violet-400 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold' : 'border-slate-200 dark:border-slate-800'
                      }`}>
                        {isOver ? 'Lepas di sini' : 'Kosong (Tarik kartu ke sini)'}
                      </div>
                    ) : (
                      columnApps.map((app) => {
                        const isDragging = activeDragItem?.id === app.id;

                        if (isDragging) {
                          return (
                            <div
                              key={app.id}
                              className="h-[95px] rounded-xl border-2 border-dashed border-violet-400/60 bg-violet-50/40 dark:bg-violet-950/20 transition-all flex items-center justify-center text-violet-500 dark:text-violet-400 text-xs font-semibold select-none"
                            >
                              Pindahkan ke kolom baru...
                            </div>
                          );
                        }

                        const palette = getCardPalette(app.id);

                        return (
                          <div
                            key={app.id}
                            onPointerDown={(e) => handlePointerDownCard(e, app)}
                            className={`group ${palette.bg} rounded-xl p-3.5 border ${palette.border} ${palette.hoverBorder} shadow-2xs hover:shadow-md transition-all space-y-2.5 cursor-grab active:cursor-grabbing relative select-none touch-none overflow-hidden`}
                          >
                            {/* Top Accent Strip */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${palette.accentBar}`} />

                            <div className="flex items-start justify-between gap-2 pt-0.5">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-2 h-2 rounded-full ${palette.dotBg} shrink-0`} />
                                  <h4
                                    className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                                    title={app.position}
                                  >
                                    {app.position}
                                  </h4>
                                </div>
                                <p
                                  className={`text-[11px] ${palette.companyText} mt-1 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                                  title={app.company}
                                >
                                  {app.company}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApp(app.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 transition p-1 shrink-0 cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.location}>
                                  {app.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Calendar className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.appliedDate}>
                                  {app.appliedDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Globe className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                {app.portalUrl ? (
                                  <a
                                    href={app.portalUrl.startsWith('http') ? app.portalUrl : `https://${app.portalUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-bold hover:underline flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer"
                                    title={`Buka portal ${app.portal} (${app.portalUrl})`}
                                  >
                                    <span>{app.portal || 'Direct'}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                                  </a>
                                ) : (
                                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium" title={app.portal || 'Direct'}>
                                    {app.portal || 'Direct'}
                                  </span>
                                )}
                              </div>
                              {app.salary !== '-' && (
                                <div className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md ${palette.tagBg} ${palette.tagText} max-w-full min-w-0 mt-1`}>
                                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.salary}>
                                    {app.salary}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Card Overlay Saat Ditarik (100% Solid Card Tanpa Bayangan Transparan) */}
          {activeDragItem && (() => {
            const dragPalette = getCardPalette(activeDragItem.id);
            return (
              <div
                style={{
                  position: 'fixed',
                  left: dragPos.x - dragOffset.x,
                  top: dragPos.y - dragOffset.y,
                  width: dragWidth,
                  pointerEvents: 'none',
                  zIndex: 9999,
                }}
                className={`${dragPalette.bg} rounded-xl p-3.5 border-2 border-violet-500 shadow-2xl scale-[1.03] rotate-1 space-y-2.5 opacity-100 ring-4 ring-violet-500/20 select-none overflow-hidden`}
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${dragPalette.accentBar}`} />

                <div className="flex items-start justify-between gap-2 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${dragPalette.dotBg} shrink-0`} />
                      <h4
                        className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                        title={activeDragItem.position}
                      >
                        {activeDragItem.position}
                      </h4>
                    </div>
                    <p
                      className={`text-[11px] ${dragPalette.companyText} mt-1 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                      title={activeDragItem.company}
                    >
                      {activeDragItem.company}
                    </p>
                  </div>
                  <div className="text-slate-400 p-1 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.location}>
                      {activeDragItem.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.appliedDate}>
                      {activeDragItem.appliedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    {activeDragItem.portalUrl ? (
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-bold flex items-center gap-1 text-violet-600 dark:text-violet-400">
                        <span>{activeDragItem.portal || 'Direct'}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                      </span>
                    ) : (
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium" title={activeDragItem.portal || 'Direct'}>
                        {activeDragItem.portal || 'Direct'}
                      </span>
                    )}
                  </div>
                  {activeDragItem.salary !== '-' && (
                    <div className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md ${dragPalette.tagBg} ${dragPalette.tagText} max-w-full min-w-0 mt-1`}>
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.salary}>
                        {activeDragItem.salary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 2: LIST TABEL */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('position')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'position' || sortField === 'company' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Perusahaan & Posisi</span>
                      {sortField === 'position' || sortField === 'company' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('location')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'location' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Lokasi</span>
                      {sortField === 'location' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('appliedDate')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'appliedDate' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Tanggal Melamar</span>
                      {sortField === 'appliedDate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('portal')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'portal' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Portal Melamar</span>
                      {sortField === 'portal' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('salary')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'salary' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Ekspektasi Gaji</span>
                      {sortField === 'salary' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className={`flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer select-none ${
                        sortField === 'status' ? 'text-violet-600 dark:text-violet-400 font-black' : ''
                      }`}
                    >
                      <span>Status Seleksi</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {sortedAndFilteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada lamaran ditemukan.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {app.position}
                        </div>
                        <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{app.company}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.appliedDate}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Globe className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          {app.portalUrl ? (
                            <a
                              href={app.portalUrl.startsWith('http') ? app.portalUrl : `https://${app.portalUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold"
                              title={`Buka link ${app.portal}`}
                            >
                              <span>{app.portal || '-'}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                            </a>
                          ) : (
                            <span>{app.portal || '-'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                        {app.salary}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="w-32">
                          <CustomSelect
                            value={app.status}
                            onChange={(val) =>
                              handleUpdateStatus(app.id, val as ApplicationItem['status'])
                            }
                            options={['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="p-4 max-w-xs text-slate-500 dark:text-slate-400 text-xs truncate">
                        {app.notes || '-'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sidebar Drawer Tambah Lamaran (Dari Kanan) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          {/* Backdrop click listener */}
          <div
            className="absolute inset-0"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 dark:bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-600/20 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Tambah Lamaran Kerja
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Isi detail lamaran baru untuk dipantau di Kanban Board
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tutup Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Form */}
            <form onSubmit={handleAddApplication} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nama Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT GoTo Gojek Tokopedia"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Posisi Pekerjaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senior Frontend Engineer"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lokasi Kerja
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta (Hybrid)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Tanggal Melamar
                    </label>
                    <input
                      type="text"
                      placeholder="23 Juli 2026"
                      value={newAppliedDate}
                      onChange={(e) => setNewAppliedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lamar Melalui Portal
                    </label>
                    <CustomSelect
                      value={newPortal}
                      onChange={(val) => setNewPortal(val)}
                      options={[
                        'LinkedIn',
                        'JobStreet',
                        'KitaLulus',
                        'Glints',
                        'Kalibrr',
                        'Website Perusahaan',
                        'Email Recruiter',
                        { value: 'Lainnya', label: 'Lainnya (Isi Sendiri / Custom)' },
                      ]}
                      placeholder="Pilih Portal Melamar"
                    />
                  </div>

                  {newPortal === 'Lainnya' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Nama Portal Custom <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Indeed / Deel / Karir.com / Telegram"
                        value={customPortal}
                        onChange={(e) => setCustomPortal(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Link / URL Lowongan Portal <span className="text-slate-400 font-normal">(Hyperlink Opsional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: https://linkedin.com/jobs/view/123456"
                      value={newPortalUrl}
                      onChange={(e) => setNewPortalUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Status Tahapan
                    </label>
                    <CustomSelect
                      value={newStatus}
                      onChange={(val) => setNewStatus(val as ApplicationItem['status'])}
                      options={['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                      placeholder="Pilih Status"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Gaji Ekspektasi
                    </label>
                    <input
                      type="text"
                      placeholder="Rp 15.000.000"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Catatan interview, kontak HRD/Recruiter, link lowongan, dsb..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan Lamaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

