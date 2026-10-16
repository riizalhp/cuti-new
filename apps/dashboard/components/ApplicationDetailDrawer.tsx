'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  ExternalLink,
  Trash2,
  CheckCircle2,
  CalendarCheck,
  FileCheck,
  Clock,
  Loader2,
  FileText,
  Check,
} from 'lucide-react';
import { ApplicationItem, formatSalaryInput } from './TrackerView';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { TrackerDatePicker } from '@/components/ui/TrackerDatePicker';
import { PortalSearchDropdown } from '@/components/ui/PortalSearchDropdown';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DEFAULT_INTERVIEW_CHECKLIST } from './InterviewScheduleModal';
import { DEFAULT_OFFERING_CHECKLIST } from './OfferingPreparationModal';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

interface ApplicationDetailDrawerProps {
  isOpen: boolean;
  app: ApplicationItem | null;
  onClose: () => void;
  onUpdate: (updatedApp: ApplicationItem) => Promise<void> | void;
  onDelete: (app: ApplicationItem) => void;
  onOpenInterviewModal?: (app: ApplicationItem) => void;
  onOpenOfferingModal?: (app: ApplicationItem) => void;
  onOpenPostInterviewModal?: (app: ApplicationItem) => void;
}


export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  isOpen,
  app,
  onClose,
  onUpdate,
  onDelete,
  onOpenInterviewModal,
  onOpenOfferingModal,
  onOpenPostInterviewModal,
}) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [status, setStatus] = useState<ApplicationItem['status']>('Terkirim');
  const [salary, setSalary] = useState('');
  const [portal, setPortal] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewChecklist, setInterviewChecklist] = useState<string[]>([]);
  const [offeringChecklist, setOfferingChecklist] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync internal state when active app changes
  useEffect(() => {
    if (app) {
      setCompany(app.company || '');
      setPosition(app.position || '');
      setLocation(app.location || '');
      setAppliedDate(app.appliedDate || '');
      setStatus(app.status || 'Terkirim');
      setSalary(app.salary && app.salary !== '-' ? app.salary : '');
      setPortal(app.portal || '');
      setPortalUrl(app.portalUrl || '');
      setNotes(app.notes || '');
      setInterviewChecklist(app.interviewChecklist || []);
      setOfferingChecklist(app.offeringChecklist || []);
    }
  }, [app]);

  if (!isOpen || !app) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedApp: ApplicationItem = {
        ...app,
        company: company.trim(),
        position: position.trim(),
        location: location.trim(),
        appliedDate: appliedDate.trim(),
        status,
        salary: salary.trim() || '-',
        portal: portal.trim(),
        portalUrl: portalUrl.trim(),
        notes: notes.trim(),
        interviewChecklist,
        offeringChecklist,
      };
      await onUpdate(updatedApp);
      onClose();
    } catch (err) {
      console.error('[ApplicationDetailDrawer] Failed to update application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col justify-between w-full sm:max-w-xl sm:h-full overflow-hidden">
        {/* Drawer Header */}
        <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center shadow-md shadow-cobalt-500/20 shrink-0">
              <Briefcase className="size-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">
                {app.position || 'Detail Lamaran'}
              </SheetTitle>
              <SheetDescription className="truncate mt-0.5">
                {app.company || 'Pantau status dan data lamaran'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Drawer Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <SheetBody className="p-6 space-y-6 flex-1">

            {/* Status Tahapan Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Status Tahapan
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val as ApplicationItem['status'])}
                options={['Tersimpan', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                placeholder="Pilih Status"
              />
            </div>

            {/* Contextual Modules based on current status */}
            {status === 'Interview' && (
              <div className="p-4 rounded-[10px] bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Sesi Wawancara &amp; Kesiapan
                    </span>
                  </div>
                  <span className="text-caption font-bold px-2.5 py-0.5 rounded-[6px] bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {interviewChecklist.length}/{DEFAULT_INTERVIEW_CHECKLIST.length} Siap
                  </span>
                </div>

                {app.interviewDate ? (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Jadwal: {app.interviewDate} {app.interviewTime ? `• ${app.interviewTime} ${app.interviewTimezone || 'WIB'}` : ''}
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Belum ada jam wawancara yang dicatat.
                  </p>
                )}

                {/* Progress Bar Kesiapan */}
                <div className="w-full bg-amber-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round((interviewChecklist.length / DEFAULT_INTERVIEW_CHECKLIST.length) * 100)}%`,
                    }}
                  />
                </div>

                {/* Daftar Persiapan Interview (Fluent Style) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Daftar Persiapan Interview:
                  </span>
                  {DEFAULT_INTERVIEW_CHECKLIST.map((item) => {
                    const isChecked = interviewChecklist.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setInterviewChecklist((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className={`p-2.5 rounded-[8px] border text-xs transition cursor-pointer flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-amber-100/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`size-4 rounded-[4px] border shrink-0 mt-0.5 flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {onOpenInterviewModal && (
                    <button
                      type="button"
                      onClick={() => onOpenInterviewModal(app)}
                      className="px-3 py-1.5 rounded-[8px] bg-amber-700 hover:bg-amber-700 text-white font-bold text-caption shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Atur Jadwal &amp; Jam Wawancara</span>
                    </button>
                  )}
                  {onOpenPostInterviewModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPostInterviewModal(app)}
                      className="px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-50 font-bold text-caption transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Catat Hasil Interview</span>
                    </button>
                  )}
                </div>

                {app.interviewNotes && (
                  <div className="text-caption bg-white dark:bg-slate-900/80 p-2.5 rounded-[8px] border border-amber-200/80 dark:border-amber-800/60 text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block">
                      Catatan Evaluasi Wawancara:
                    </span>
                    <p className="whitespace-pre-wrap">{app.interviewNotes}</p>
                  </div>
                )}
              </div>
            )}

            {status === 'Offering' && (
              <div className="p-4 rounded-[10px] bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/80 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Penawaran Kerja (Offering Letter)
                    </span>
                  </div>
                  <span className="text-caption font-bold px-2.5 py-0.5 rounded-[6px] bg-emerald-700 text-white">
                    {offeringChecklist.length}/{DEFAULT_OFFERING_CHECKLIST.length} Siap
                  </span>
                </div>

                {(app.offerDeadline || app.offeringStartDate) && (
                  <div className="text-xs space-y-0.5 text-emerald-800 dark:text-emerald-300">
                    {app.offerDeadline && <p>Batas Konfirmasi: <span className="font-bold">{app.offerDeadline}</span></p>}
                    {app.offeringStartDate && <p>Mulai Bekerja: <span className="font-bold">{app.offeringStartDate}</span></p>}
                  </div>
                )}

                {/* Progress Bar Kesiapan Offering */}
                <div className="w-full bg-emerald-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round((offeringChecklist.length / DEFAULT_OFFERING_CHECKLIST.length) * 100)}%`,
                    }}
                  />
                </div>

                {/* Daftar Persiapan Offering (Fluent Style) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Daftar Telaah &amp; Persiapan Offering:
                  </span>
                  {DEFAULT_OFFERING_CHECKLIST.map((item) => {
                    const isChecked = offeringChecklist.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setOfferingChecklist((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className={`p-2.5 rounded-[8px] border text-xs transition cursor-pointer flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-emerald-100/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`size-4 rounded-[4px] border shrink-0 mt-0.5 flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {onOpenOfferingModal && (
                  <button
                    type="button"
                    onClick={() => onOpenOfferingModal(app)}
                    className="px-3 py-1.5 rounded-[8px] bg-emerald-700 hover:bg-emerald-700 text-white font-bold text-caption shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Buka Panduan Lengkap &amp; Template Balasan</span>
                  </button>
                )}
              </div>
            )}

            {/* Identitas Pokok Lamaran */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Posisi Pekerjaan <span className="text-rose-700 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senior Frontend Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nama Perusahaan <span className="text-rose-700 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT GoTo Gojek Tokopedia"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Lokasi Kerja
                </label>
                <CitySearchInput
                  value={location}
                  onChange={(val) => setLocation(val)}
                  placeholder="Cari Kota / Kab di Indonesia (contoh: Jakarta Selatan, Surabaya)..."
                  size="md"
                  cityOnly={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Tanggal Melamar
                  </label>
                  <TrackerDatePicker
                    value={appliedDate}
                    onChange={(val) => setAppliedDate(val)}
                    placeholder="Pilih Tanggal"
                    align="left"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Portal Sumber
                  </label>
                  <PortalSearchDropdown
                    value={portal}
                    onChange={(portalName, defaultUrl) => {
                      setPortal(portalName);
                      if (defaultUrl && !portalUrl) {
                        setPortalUrl(defaultUrl);
                      }
                    }}
                    placeholder="Portal loker..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Gaji / Kompensasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 8.000.000"
                  value={salary}
                  onChange={(e) => setSalary(formatSalaryInput(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Link / URL Lowongan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: linkedin.com/jobs/view/..."
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                  />
                  {portalUrl && (
                    <a
                      href={portalUrl.startsWith('http') ? portalUrl : `https://${portalUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-cobalt-500 dark:text-blue-400 transition flex items-center justify-center shrink-0"
                      title="Buka tautan lowongan di tab baru"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Catatan Tambahan
                </label>
                <AutoResizeTextarea
                  minHeight={80}
                  maxHeight={260}
                  rows={3}
                  placeholder="Catatan kontak recruiter, info penting perusahaan, hasil seleksi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition resize-none"
                />
              </div>
            </div>

          </SheetBody>

          {/* Sticky Drawer Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2.5">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(app)}
            >
              <Trash2 className="size-3.5" />
              <span>Hapus Lamaran</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
              >
                <span>Simpan Perubahan</span>
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
