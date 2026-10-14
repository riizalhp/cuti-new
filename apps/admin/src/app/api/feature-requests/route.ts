import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface FeatureRequestReply {
  id: string;
  admin_name: string;
  admin_email?: string;
  message_html: string;
  created_at: string;
}

export interface FeatureRequestItem {
  id: string;
  request_code: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  category: string;
  problem_statement: string;
  expected_behavior?: string;
  attachments?: Array<{
    name: string;
    data_url: string;
    size: number;
  }>;
  votes_count: number;
  voter_ids: string[];
  status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  replies?: FeatureRequestReply[];
}

function getDataFilePath(): string {
  const dashboardPath = path.resolve(process.cwd(), '../dashboard/.data/feature-requests.json');
  if (fs.existsSync(dashboardPath) || fs.existsSync(path.dirname(dashboardPath))) {
    return dashboardPath;
  }
  return path.join(process.cwd(), '.data', 'feature-requests.json');
}

async function readRequests(): Promise<FeatureRequestItem[]> {
  const filePath = getDataFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as FeatureRequestItem[];
  } catch (error) {
    console.error('[Admin FeatureRequests API] Error reading data file:', error);
    return [];
  }
}

async function writeRequests(requests: FeatureRequestItem[]): Promise<void> {
  const filePath = getDataFilePath();
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Admin FeatureRequests API] Error writing data file:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const statusQuery = url.searchParams.get('status');
    const categoryQuery = url.searchParams.get('category');
    const searchQuery = url.searchParams.get('search');
    const requestIdQuery = url.searchParams.get('request_id');

    const allRequests = await readRequests();

    if (requestIdQuery) {
      const item = allRequests.find(
        (r) => r.id === requestIdQuery || r.request_code === requestIdQuery
      );
      if (!item) {
        return NextResponse.json(
          { success: false, message: 'Saran fitur tidak ditemukan.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    let filtered = [...allRequests];

    if (statusQuery && statusQuery !== 'all') {
      filtered = filtered.filter((r) => r.status === statusQuery);
    }

    if (categoryQuery && categoryQuery !== 'all') {
      filtered = filtered.filter((r) => r.category === categoryQuery);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.problem_statement.toLowerCase().includes(q) ||
          r.user_name.toLowerCase().includes(q) ||
          r.user_email.toLowerCase().includes(q) ||
          r.request_code.toLowerCase().includes(q)
      );
    }

    // Sort by votes count, then date
    filtered.sort((a, b) => {
      if (b.votes_count !== a.votes_count) {
        return b.votes_count - a.votes_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const stats = {
      total: allRequests.length,
      under_review: allRequests.filter((r) => r.status === 'under_review').length,
      planned: allRequests.filter((r) => r.status === 'planned').length,
      in_progress: allRequests.filter((r) => r.status === 'in_progress').length,
      completed: allRequests.filter((r) => r.status === 'completed').length,
      declined: allRequests.filter((r) => r.status === 'declined').length,
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
    });
  } catch (error) {
    console.error('[Admin FeatureRequests GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mengambil data saran fitur.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      request_id,
      status,
      admin_notes,
      reply_html,
      admin_name,
      admin_email,
    } = body;

    if (!request_id) {
      return NextResponse.json(
        { success: false, message: 'request_id wajib disertakan.' },
        { status: 400 }
      );
    }

    const allRequests = await readRequests();
    const itemIndex = allRequests.findIndex(
      (r) => r.id === request_id || r.request_code === request_id
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Saran fitur tidak ditemukan.' },
        { status: 404 }
      );
    }

    const item = allRequests[itemIndex];

    if (status) {
      item.status = status;
    }

    if (typeof admin_notes === 'string') {
      item.admin_notes = admin_notes;
    }

    if (reply_html && reply_html.trim() && reply_html !== '<p></p>') {
      const newReply: FeatureRequestReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        admin_name: admin_name || 'Admin Tim Produk',
        admin_email: admin_email || 'product@employr.id',
        message_html: reply_html.trim(),
        created_at: new Date().toISOString(),
      };

      if (!item.replies) item.replies = [];
      item.replies.push(newReply);
    }

    item.updated_at = new Date().toISOString();
    allRequests[itemIndex] = item;
    await writeRequests(allRequests);

    return NextResponse.json({
      success: true,
      message: 'Saran fitur berhasil diperbarui.',
      data: item,
    });
  } catch (error) {
    console.error('[Admin FeatureRequests PATCH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memperbarui saran fitur.' },
      { status: 500 }
    );
  }
}
