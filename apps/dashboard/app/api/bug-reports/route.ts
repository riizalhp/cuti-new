import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthUser } from '@/lib/server-auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export interface BugReportReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

export interface BugReportItem {
  id: string;
  ticket_code: string;
  user_id: string;
  user_email: string;
  user_name: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  page_url?: string;
  system_info?: {
    browser?: string;
    os?: string;
    screen_resolution?: string;
    device_type?: string;
    online?: boolean;
    user_agent?: string;
  };
  attachments?: Array<{
    name: string;
    data_url: string;
    size: number;
  }>;
  status: 'open' | 'in_review' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: BugReportReply[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'bug-reports.json');

export async function readReports(): Promise<BugReportItem[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const content = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content) as BugReportItem[];
  } catch (error) {
    console.error('[BugReports API] Error reading data file:', error);
    return [];
  }
}

export async function writeReports(reports: BugReportItem[]): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (error) {
    console.error('[BugReports API] Error writing data file:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const url = new URL(req.url);
    const userIdQuery = url.searchParams.get('user_id');
    const ticketIdQuery = url.searchParams.get('ticket_id');

    const allReports = await readReports();

    // If requesting specific ticket
    if (ticketIdQuery) {
      const ticket = allReports.find(
        (r) => r.id === ticketIdQuery || r.ticket_code === ticketIdQuery
      );
      if (!ticket) {
        return NextResponse.json(
          { success: false, message: 'Tiket tidak ditemukan.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: ticket });
    }

    const effectiveUserId = authUser?.id || userIdQuery;

    if (!effectiveUserId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Filter reports belonging to this user
    const userReports = allReports.filter(
      (r) => r.user_id === effectiveUserId || (authUser?.email && r.user_email === authUser.email)
    );

    // Sort newest first
    userReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Strip heavy base64 data_urls from list payload for high performance
    const sanitizedReports = userReports.map((report) => ({
      ...report,
      attachments: report.attachments?.map((att) => ({
        name: att.name,
        size: att.size,
        data_url: '', // populated on-demand when user clicks detail
      })),
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedReports,
    });
  } catch (error: any) {
    console.error('[GET /api/bug-reports] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar laporan kendala.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category,
      severity,
      title,
      description,
      page_url,
      system_info,
      attachments,
      user_id: clientUserId,
      user_email: clientUserEmail,
      user_name: clientUserName,
    } = body;

    const authUser = await getAuthUser(req);
    const userId = authUser?.id || clientUserId || 'anonymous_user';
    const userEmail = authUser?.email || clientUserEmail || 'user@employr.id';
    const userName = authUser?.name || clientUserName || 'Pengguna Employr';

    // Rate limiting: max 10 bug reports per 5 minutes per user/IP
    const rateLimitKey = `bug_report:${userId}`;
    const rl = checkRateLimit(rateLimitKey, 10, 5 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak laporan dikirim dalam waktu singkat. Silakan tunggu beberapa menit.',
        },
        { status: 429 }
      );
    }

    // Input Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Judul kendala wajib diisi.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi kendala wajib diisi.' },
        { status: 400 }
      );
    }

    const validCategories = ['ui', 'feature', 'auth', 'payment', 'other'];
    const selectedCategory = validCategories.includes(category) ? category : 'other';

    const validSeverities = ['low', 'medium', 'high'];
    const selectedSeverity = validSeverities.includes(severity) ? severity : 'medium';

    // Generate unique 5-digit ticket code
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `BUG-${randomDigits}`;
    const now = new Date().toISOString();

    const newReport: BugReportItem = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticket_code: ticketCode,
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      category: selectedCategory,
      severity: selectedSeverity,
      title: title.trim().slice(0, 150),
      description: description.trim(),
      page_url: page_url ? String(page_url).slice(0, 255) : undefined,
      system_info: system_info || undefined,
      attachments: Array.isArray(attachments) ? attachments.slice(0, 3) : [],
      status: 'open',
      created_at: now,
      updated_at: now,
      replies: [],
    };

    const allReports = await readReports();
    allReports.unshift(newReport);
    await writeReports(allReports);

    return NextResponse.json({
      success: true,
      message: 'Laporan kendala berhasil dikirim.',
      ticket: newReport,
    });
  } catch (error: any) {
    console.error('[POST /api/bug-reports] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat menyimpan laporan.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, status, reply_html, admin_name, admin_email } = body;

    if (!ticket_id) {
      return NextResponse.json(
        { success: false, message: 'ticket_id wajib disertakan.' },
        { status: 400 }
      );
    }

    const allReports = await readReports();
    const index = allReports.findIndex(
      (r) => r.id === ticket_id || r.ticket_code === ticket_id
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan.' },
        { status: 404 }
      );
    }

    const ticket = allReports[index];
    const now = new Date().toISOString();

    if (status) {
      const validStatuses = ['open', 'in_review', 'in_progress', 'resolved'];
      if (validStatuses.includes(status)) {
        ticket.status = status;
      }
    }

    if (reply_html && typeof reply_html === 'string' && reply_html.trim().length > 0) {
      if (!ticket.replies) {
        ticket.replies = [];
      }
      ticket.replies.push({
        id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        admin_name: admin_name || 'Tim Support Employr',
        admin_email: admin_email || undefined,
        message_html: reply_html.trim(),
        created_at: now,
      });

      // Auto update status to in_progress if still open
      if (ticket.status === 'open') {
        ticket.status = 'in_progress';
      }
    }

    ticket.updated_at = now;
    allReports[index] = ticket;
    await writeReports(allReports);

    return NextResponse.json({
      success: true,
      message: 'Tiket berhasil diperbarui.',
      ticket,
    });
  } catch (error: any) {
    console.error('[PATCH /api/bug-reports] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui tiket.' },
      { status: 500 }
    );
  }
}
