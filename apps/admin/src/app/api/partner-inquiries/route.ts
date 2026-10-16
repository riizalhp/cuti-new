import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

export type InquiryType = 'EVENT_KAMPUS' | 'JOB_FAIR' | 'IKLAN_SPONSOR' | 'LAINNYA';
export type InquiryStatus = 'BARU' | 'DIHUBUNGI' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';

export interface PartnerInquiryItem {
  id: string;
  ticket_code: string;
  pic_name: string;
  institution_name: string;
  pic_email: string;
  pic_phone: string;
  inquiry_type: InquiryType;
  event_title: string;
  event_date?: string;
  proposal_url?: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

function getDataFilePath(): string {
  // 1. Coba apps/dashboard/.data/partner-inquiries.json
  const dashboardPath = path.resolve(process.cwd(), '../dashboard/.data/partner-inquiries.json');
  if (fs.existsSync(dashboardPath) || fs.existsSync(path.dirname(dashboardPath))) {
    return dashboardPath;
  }
  // 2. Coba apps/portal-loker/.data/partner-inquiries.json
  const portalPath = path.resolve(process.cwd(), '../portal-loker/.data/partner-inquiries.json');
  if (fs.existsSync(portalPath) || fs.existsSync(path.dirname(portalPath))) {
    return portalPath;
  }
  // 3. Fallback lokal apps/admin/.data/partner-inquiries.json
  const localDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(localDir, 'partner-inquiries.json');
}

async function readInquiries(): Promise<PartnerInquiryItem[]> {
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[admin/partner-inquiries] Gagal membaca file JSON:', e);
  }

  // Backup pembacaan dari PostgreSQL system_settings
  try {
    const setting = await prisma.system_settings.findUnique({
      where: { key: 'partner_inquiries_store' },
    });
    if (setting && setting.value) {
      const dbParsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      if (Array.isArray(dbParsed)) return dbParsed;
    }
  } catch (e) {
    console.warn('[admin/partner-inquiries] Gagal membaca dari database system_settings:', e);
  }

  return [];
}

async function writeInquiries(items: PartnerInquiryItem[]): Promise<void> {
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('[admin/partner-inquiries] Gagal menulis file JSON:', e);
  }

  // Backup persistensi ke database system_settings
  try {
    await prisma.system_settings.upsert({
      where: { key: 'partner_inquiries_store' },
      update: {
        value: JSON.stringify(items),
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        key: 'partner_inquiries_store',
        value: JSON.stringify(items),
        group: 'PARTNERSHIP',
        description: 'Persistent store pengajuan kemitraan & event kampus',
        updated_at: new Date(),
      },
    });
  } catch (e) {
    console.warn('[admin/partner-inquiries] Gagal update system_settings:', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    let items = await readInquiries();

    // Hitung statistik
    const stats = {
      total: items.length,
      baru: items.filter((i) => i.status === 'BARU').length,
      dihubungi: items.filter((i) => i.status === 'DIHUBUNGI').length,
      disetujui: items.filter((i) => i.status === 'DISETUJUI').length,
      selesai: items.filter((i) => i.status === 'SELESAI').length,
      ditolak: items.filter((i) => i.status === 'DITOLAK').length,
    };

    if (status && status !== 'all') {
      items = items.filter((i) => i.status === status);
    }

    if (type && type !== 'all') {
      items = items.filter((i) => i.inquiry_type === type);
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.ticket_code.toLowerCase().includes(search) ||
          i.pic_name.toLowerCase().includes(search) ||
          i.institution_name.toLowerCase().includes(search) ||
          i.event_title.toLowerCase().includes(search) ||
          i.pic_email.toLowerCase().includes(search) ||
          i.pic_phone.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      stats,
      data: items,
    });
  } catch (error: any) {
    console.error('[API Admin partner-inquiries GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data kemitraan' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengajuan wajib disertakan' },
        { status: 400 }
      );
    }

    const items = await readInquiries();
    const targetIndex = items.findIndex((i) => i.id === id);

    if (targetIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Data pengajuan kemitraan tidak ditemukan' },
        { status: 404 }
      );
    }

    const currentItem = items[targetIndex];
    const updatedItem: PartnerInquiryItem = {
      ...currentItem,
      status: status || currentItem.status,
      admin_notes: admin_notes !== undefined ? admin_notes : currentItem.admin_notes,
      updated_at: new Date().toISOString(),
    };

    items[targetIndex] = updatedItem;
    await writeInquiries(items);

    return NextResponse.json({
      success: true,
      message: 'Status pengajuan kemitraan berhasil diperbarui',
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('[API Admin partner-inquiries PATCH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui data pengajuan' },
      { status: 500 }
    );
  }
}
