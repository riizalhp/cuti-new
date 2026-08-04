'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Calendar,
  Trash2,
  DollarSign,
  MapPin,
  Kanban,
  List,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from 'lucide-react';

export interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  location: string;
  appliedDate: string;
  status: 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak';
  salary: string;
  notes: string;
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

export const TrackerView: React.FC = () => {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApplications);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Drag and Drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationItem['status'] | null>(null);

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAppliedDate, setNewAppliedDate] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationItem['status']>('Terkirim');
  const [newSalary, setNewSalary] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newPosition) return;

    const newApp: ApplicationItem = {
      id: `app-${apps.length + 1}`,
      company: newCompany,
      position: newPosition,
      location: newLocation || 'Jakarta',
      appliedDate: newAppliedDate || 'Hari ini',
      status: newStatus,
      salary: newSalary || '-',
      notes: newNotes,
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
      a.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Table Sorting State
  type SortField = 'company' | 'position' | 'location' | 'appliedDate' | 'salary' | 'status';
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
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 rounded-xl p-6 text-white border border-violet-800/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Job Application Tracker</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Tracker & Pipeline Lamaran Kerja
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Pantau seluruh riwayat lamaran, tahapan seleksi interview, hingga offering dalam format Kanban Board atau Tabel List.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
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
          {/* Quick Helper Banner */}
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-violet-500" />
              <span><strong>Drag & Drop:</strong> Tarik kartu lamaran dan lepas ke kolom status tujuan untuk memperbarui progress.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Auto-Sync Status</span>
          </div>

          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 items-start min-h-[450px]">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = filteredApps.filter((a) => a.status === col.status);
              const isOver = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverColumn !== col.status) {
                      setDragOverColumn(col.status);
                    }
                  }}
                  onDragLeave={(e) => {
                    // Check if leaving the column container
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverColumn(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverColumn(null);
                    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
                    if (appId) {
                      handleUpdateStatus(appId, col.status);
                    }
                    setDraggedAppId(null);
                  }}
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
                        const isDragging = draggedAppId === app.id;

                        return (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', app.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedAppId(app.id);
                            }}
                            onDragEnd={() => {
                              setDraggedAppId(null);
                              setDragOverColumn(null);
                            }}
                            className={`group bg-white dark:bg-slate-900 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-violet-400 dark:hover:border-violet-500 transition-all space-y-2.5 cursor-grab active:cursor-grabbing relative select-none ${
                              isDragging ? 'opacity-40 scale-95 border-dashed border-violet-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                                <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate">
                                    {app.position}
                                  </h4>
                                  <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-0.5 truncate">
                                    {app.company}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApp(app.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 transition p-1 shrink-0"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{app.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{app.appliedDate}</span>
                              </div>
                              {app.salary !== '-' && (
                                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                  <DollarSign className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{app.salary}</span>
                                </div>
                              )}
                            </div>

                            {app.notes && (
                              <p className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 border border-slate-100 dark:border-slate-800 ml-5">
                                {app.notes}
                              </p>
                            )}

                            {/* Quick Change Status Dropdown */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 pl-5">
                              <span className="text-[10px] text-slate-400 font-medium">Ubah Status:</span>
                              <div className="relative">
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(app.id, e.target.value as ApplicationItem['status'])
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] font-bold py-1 pl-2 pr-6 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                                >
                                  <option value="Terkirim">Terkirim</option>
                                  <option value="Screening">Screening</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Offering">Offering</option>
                                  <option value="Ditolak">Ditolak</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
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
        </div>
      )}

      {/* VIEW 2: LIST TABEL */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* Active Sort Bar Helper */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Urutan Tabel:</span>
              <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 font-semibold border border-violet-200 dark:border-violet-800 text-[11px]">
                {sortField === 'position' || sortField === 'company'
                  ? 'Posisi & Perusahaan'
                  : sortField === 'location'
                  ? 'Lokasi'
                  : sortField === 'appliedDate'
                  ? 'Tanggal Melamar'
                  : sortField === 'salary'
                  ? 'Ekspektasi Gaji'
                  : sortField === 'status'
                  ? 'Status Seleksi'
                  : 'Default'}
                {' '}({sortDirection === 'asc' ? 'A-Z / Lama ke Baru' : 'Z-A / Baru ke Lama'})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Klik judul kolom di tabel untuk mengubah urutan</span>
          </div>

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
                    <td colSpan={7} className="p-8 text-center text-slate-400">
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
                      <td className="p-4 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                        {app.salary}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateStatus(app.id, e.target.value as ApplicationItem['status'])
                            }
                            className={`pl-2.5 pr-7 py-1 rounded-lg text-xs font-bold border transition ${getStatusBadgeClass(
                              app.status
                            )} cursor-pointer focus:outline-none appearance-none`}
                          >
                            <option value="Terkirim">Terkirim</option>
                            <option value="Screening">Screening</option>
                            <option value="Interview">Interview</option>
                            <option value="Offering">Offering</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 opacity-70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Status Tahapan
                    </label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ApplicationItem['status'])}
                        className="w-full px-3.5 py-2.5 pr-9 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none appearance-none cursor-pointer transition font-medium"
                      >
                        <option value="Terkirim">Terkirim</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview">Interview</option>
                        <option value="Offering">Offering</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
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

