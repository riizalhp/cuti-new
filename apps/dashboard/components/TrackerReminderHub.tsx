'use client';

import React, { useState } from 'react';
import {
  BellRing,
  Clock,
  ExternalLink,
  Copy,
  Check,
  FileText,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  TrackerReminder,
  getReminderTemplateText,
  ReminderUrgency,
} from '@/lib/trackerReminders';
import { SwipeableReminderCard } from '@/components/SwipeableReminderCard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {/* Drawer Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-bold text-base text-slate-900 dark:text-white">
                    Pusat Pengingat Lamaran
                  </SheetTitle>
                  <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    {reminders.length} Aktif
                  </span>
                </div>
                <SheetDescription className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Pantau progres, jadwal interview, dan rekomendasi follow-up
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Filter Pills */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <Tabs value={filter} onValueChange={(val) => setFilter(val as any)}>
              <TabsList variant="pill" className="overflow-x-auto w-full justify-start gap-1">
                <TabsTrigger value="all" className="text-xs">
                  Semua ({reminders.length})
                </TabsTrigger>
                <TabsTrigger value="critical" className="text-xs">
                  Mendesak / Penting
                </TabsTrigger>
                <TabsTrigger value="follow_up" className="text-xs">
                  Follow-up HRD
                </TabsTrigger>
                <TabsTrigger value="interview" className="text-xs">
                  Interview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Drawer Body - Reminder List */}
          <SheetBody className="p-5 space-y-3.5 flex-1">
            {filteredReminders.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3 dark:text-slate-400">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/50">
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
                            <span className={`px-2 py-0.5 rounded-[10px] text-caption font-bold border flex items-center gap-1.5 ${badge.class}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                            {reminder.dueLabel && (
                              <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                <span>{reminder.dueLabel}</span>
                              </span>
                            )}
                          </div>

                          {onDismissReminder && (
                            <IconButton
                              variant="ghost"
                              size="sm"
                              label="Tandai Selesai"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => onDismissReminder(reminder.id)}
                              className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 dark:text-slate-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </IconButton>
                          )}
                        </div>

                        {/* Target Company & Title */}
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                              {reminder.title}
                            </h4>
                          </div>
                          <p className="text-caption font-semibold text-orange-700 dark:text-orange-400 mt-0.5">
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
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleCopyTemplate(reminder)}
                                className="flex items-center gap-1.5"
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
                              </Button>
                              <IconButton
                                variant="ghost"
                                size="sm"
                                label="Lihat Template Lengkap"
                                onClick={() => handleOpenPreview(reminder)}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </IconButton>
                            </div>
                          ) : reminder.actionType === 'open_url' && reminder.portalUrl ? (
                            <a
                              href={reminder.portalUrl.startsWith('http') ? reminder.portalUrl : `https://${reminder.portalUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                            >
                              <span>{reminder.actionText || 'Buka Link'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                if (reminder.appId && onSelectApp) {
                                  onSelectApp(reminder.appId);
                                }
                                onClose();
                              }}
                              className="flex items-center gap-1"
                            >
                              <span>{reminder.actionText || 'Lihat Lamaran'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {onDismissReminder && (
                            <button
                              type="button"
                              onClick={() => onDismissReminder(reminder.id)}
                              className="text-caption font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer dark:text-slate-400"
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
          </SheetBody>

          {/* Drawer Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex sm:flex-row items-center justify-between">
            <div className="flex items-center gap-1.5 text-caption text-slate-600 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
              <span>Pengingat diperbarui otomatis setiap hari</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal Preview Template */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg w-full p-6 space-y-4">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <DialogTitle className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-700 dark:text-orange-400" />
              <span>Template Email / Pesan Sopan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300">
              Kamu bisa langsung menyalin atau menyesuaikan teks pesan ini sebelum dikirim ke HRD:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <textarea
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight + 6}px`;
                }
              }}
              readOnly
              value={previewTemplate?.text || ''}
              className="w-full p-3 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 text-slate-900 dark:text-white font-sans leading-relaxed resize-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 select-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>
              Kembali
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (previewTemplate) {
                  navigator.clipboard.writeText(previewTemplate.text);
                  setPreviewTemplate(null);
                }
              }}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Pesan</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
