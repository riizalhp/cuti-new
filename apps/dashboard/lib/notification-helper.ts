import { prisma } from '@employr/db';
import crypto from 'crypto';

type NotificationCategory =
  | 'ORDER'
  | 'MEMBERSHIP'
  | 'TRACKER'
  | 'CAREER'
  | 'REFERRAL'
  | 'DRAFT'
  | 'OPPORTUNITY';

type NotificationPriority = 'CRITICAL' | 'IMPORTANT' | 'INFORMATIONAL' | 'SUCCESS';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  actionUrl?: string;
}

/**
 * Membuat baris notifikasi untuk user. Fire-and-forget safe:
 * dipanggil dengan await dalam flow penting, atau .catch(() => {}) bila best-effort.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notifications.create({
      data: {
        id: crypto.randomUUID(),
        user_id: input.userId,
        title: input.title,
        message: input.message,
        category: input.category,
        priority: input.priority ?? 'INFORMATIONAL',
        action_url: input.actionUrl ?? null,
      },
    });
  } catch (err) {
    // Tidak boleh menggagalkan operasi utama karena notifikasi gagal tersimpan
    console.error('[createNotification] Failed:', err);
    return null;
  }
}
