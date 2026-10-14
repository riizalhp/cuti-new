import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

function getDataFilePath(): string {
  // Try relative to apps/admin -> apps/dashboard/.data/bug-reports.json
  const dashboardPath = path.resolve(process.cwd(), '../dashboard/.data/bug-reports.json');
  if (fs.existsSync(dashboardPath) || fs.existsSync(path.dirname(dashboardPath))) {
    return dashboardPath;
  }
  // Fallback to local admin .data
  return path.join(process.cwd(), '.data', 'bug-reports.json');
}

async function readReports(): Promise<BugReportItem[]> {
  const filePath = getDataFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as BugReportItem[];
  } catch (error) {
    console.error('[Admin BugReports API] Error reading data file:', error);
    return [];
  }
}

async function writeReports(reports: BugReportItem[]): Promise<void> {
  const filePath = getDataFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Admin BugReports API] Error writing data file:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const statusQuery = url.searchParams.get('status');
    const categoryQuery = url.searchParams.get('category');
    const severityQuery = url.searchParams.get('severity');
    const ticketIdQuery = url.searchParams.get('ticket_id');

    const allReports = await readReports();

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

    let filtered = allReports;
    if (statusQuery && statusQuery !== 'all') {
      filtered = filtered.filter((r) => r.status === statusQuery);
    }
    if (categoryQuery && categoryQuery !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryQuery);
    }
    if (severityQuery && severityQuery !== 'all') {
      filtered = filtered.filter((r) => r.severity === severityQuery);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: filtered,
      stats: {
        total: allReports.length,
        open: allReports.filter((r) => r.status === 'open').length,
        in_progress: allReports.filter((r) => r.status === 'in_review' || r.status === 'in_progress').length,
        resolved: allReports.filter((r) => r.status === 'resolved').length,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/bug-reports (Admin)] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat laporan bug.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
        admin_name: admin_name || 'Admin Employr',
        admin_email: admin_email || undefined,
        message_html: reply_html.trim(),
        created_at: now,
      });

      // Auto update status to in_progress if currently open
      if (ticket.status === 'open') {
        ticket.status = 'in_progress';
      }
    }

    ticket.updated_at = now;
    allReports[index] = ticket;
    await writeReports(allReports);

    return NextResponse.json({
      success: true,
      message: 'Balasan dan status berhasil diperbarui.',
      ticket,
    });
  } catch (error: any) {
    console.error('[POST /api/bug-reports (Admin)] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui tiket.' },
      { status: 500 }
    );
  }
}
