'use client';

import React, { useState } from 'react';
import {
  BellRing,
  X,
  Clock,
  Send,
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  TrackerReminder,
  getReminderTemplateText,
  ReminderUrgency,
} from '@/lib/trackerReminders';
import { SwipeableReminderCard } from '@/components/SwipeableReminderCard';

interface TrackerReminderHubProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: TrackerReminder[];
  onDismissReminder?: (id: string) => void;
  onSelectApp?: (appId: string) => void;
}

export const TrackerReminderHub: React.FC<TrackerReminderHubProps> = ({
  isOpen,
  onClose,
  reminders,
  onDismissReminder,
  onSelectApp,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'follow_up' | 'interview'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{
    title: string;
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'critical') return r.urgency === 'critical' || r.urgency === 'high';
    if (filter === 'follow_up') return r.category === 'follow_up' || r.category === 'follow_up_kedua' || r.category === 'lamaran';
    if (filter === 'interview') return r.category === 'interview' || r.category === 'post_interview';
    return true;
  });

  const handleCopyTemplate = (reminder: TrackerReminder) => {
    if (!reminder.templateType) return;
    const text = getReminderTemplateText(
      reminder.templateType,
      reminder.company,
      reminder.position
    );
    navigator.clipboard.writeText(text);
    setCopiedId(reminder.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleOpenPreview = (reminder: TrackerReminder) => {
    if (!reminder.templateType) return;
    const text = getReminderTemplateText(
      reminder.templateType,
      reminder.company,
      reminder.position
    );
    setPreviewTemplate({
      title: reminder.title,
      text,
    });
  };

  const getUrgencyBadge = (urgency: ReminderUrgency) => {
    switch (urgency) {
      case 'critical':
        return {
          label: 'Mendesak',
          class: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
      case 'high':
        return {
          label: 'Penting',
          class: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
        };
      case 'medium':
        return {
          label: 'Waktunya Cek',
          class: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      default:
        return {
          label: 'Info',
          class: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dot: 'bg-sky-500',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
      {/* Backdrop listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Drawer Panel */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Pusat Pengingat Lamaran
                </h3>
                <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  {reminders.length} Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau progres, jadwal interview, dan rekomendasi follow-up
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Pengingat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto bg-slate-50/30 dark:bg-slate-900/40">
          {[
            { id: 'all', label: `Semua (${reminders.length})` },
            { id: 'critical', label: 'Mendesak / Penting' },
            { id: 'follow_up', label: 'Follow-up HRD' },
            { id: 'interview', label: 'Interview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body - Reminder List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredReminders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/50">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Semua Beres! Tidak Ada Pengingat
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Semua lamaran kerja kamu berada di jalurnya. Sistem akan otomatis mengingatkan jika ada tahapan yang butuh perhatian.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReminders.map((reminder) => {
                const badge = getUrgencyBadge(reminder.urgency);

                return (
                  <SwipeableReminderCard
                    key={reminder.id}
                    id={reminder.id}
                    onDismiss={onDismissReminder}
                  >
                    <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 shadow-2xs hover:shadow-md transition space-y-3 group">
                      {/* Top Bar: Urgency Badge & Due Text */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold border flex items-center gap-1.5 ${badge.class}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>
                          {reminder.dueLabel && (
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{reminder.dueLabel}</span>
                            </span>
                          )}
                        </div>

                        {onDismissReminder && (
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => onDismissReminder(reminder.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] p-1 rounded-md transition cursor-pointer"
                            title="Tandai Selesai"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Target Company & Title */}
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                            {reminder.title}
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                          {reminder.company} • {reminder.position}
                        </p>
                      </div>

                      {/* Conversational Message */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-[10px] border border-slate-100 dark:border-slate-700/50">
                        “{reminder.message}”
                      </p>

                      {/* Action Buttons */}
                      <div
                        className="flex flex-wrap items-center justify-between gap-2 pt-1"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {reminder.templateType ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyTemplate(reminder)}
                              className="px-3 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {copiedId === reminder.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Template Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Template Email</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(reminder)}
                              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer"
                              title="Lihat Template Lengkap"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : reminder.actionType === 'open_url' && reminder.portalUrl ? (
                          <a
                            href={reminder.portalUrl.startsWith('http') ? reminder.portalUrl : `https://${reminder.portalUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>{reminder.actionText || 'Buka Link'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (reminder.appId && onSelectApp) {
                                onSelectApp(reminder.appId);
                              }
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>{reminder.actionText || 'Lihat Lamaran'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDismissReminder && (
                          <button
                            type="button"
                            onClick={() => onDismissReminder(reminder.id)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                          >
                            Sudah Ditindaklanjuti
                          </button>
                        )}
                      </div>
                    </div>
                  </SwipeableReminderCard>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-orange-500" />
            <span>Pengingat diperbarui otomatis setiap hari</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Modal Preview Template */}
      {previewTemplate && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>Template Email / Pesan Sopan</span>
              </h4>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kamu bisa langsung menyalin atau menyesuaikan teks pesan ini sebelum dikirim ke HRD:
              </p>
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight + 6}px`;
                  }
                }}
                readOnly
                value={previewTemplate.text}
                className="w-full p-3 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 text-slate-900 dark:text-white font-sans leading-relaxed resize-none overflow-hidden focus:outline-none select-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-[10px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewTemplate.text);
                  setPreviewTemplate(null);
                }}
                className="px-5 py-2 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] text-white transition flex items-center gap-1.5 shadow-md shadow-[#1738D1]/20 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Pesan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
