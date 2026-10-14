import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthUser } from '@/lib/server-auth';
import { checkRateLimit } from '@/lib/rate-limiter';

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

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'feature-requests.json');

export async function readFeatureRequests(): Promise<FeatureRequestItem[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const content = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content) as FeatureRequestItem[];
  } catch (error) {
    console.error('[FeatureRequests API] Error reading data file:', error);
    return [];
  }
}

export async function writeFeatureRequests(items: FeatureRequestItem[]): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error('[FeatureRequests API] Error writing data file:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const url = new URL(req.url);
    const userIdQuery = url.searchParams.get('user_id');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const requestIdQuery = url.searchParams.get('request_id');

    const allRequests = await readFeatureRequests();
    const effectiveUserId = authUser?.id || userIdQuery;

    // Specific item request (private verification)
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

      // Check ownership/privacy: user can only view their own request
      if (
        effectiveUserId &&
        item.user_id !== effectiveUserId &&
        (!authUser?.email || item.user_email !== authUser.email)
      ) {
        return NextResponse.json(
          { success: false, message: 'Saran fitur tidak ditemukan atau Anda tidak memiliki akses.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, data: item });
    }

    if (!effectiveUserId) {
      return NextResponse.json({
        success: true,
        data: [],
        current_user_id: null,
      });
    }

    // Filter strictly to the authenticated user's requests (100% private)
    let filtered = allRequests.filter(
      (r) => r.user_id === effectiveUserId || (authUser?.email && r.user_email === authUser.email)
    );

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.problem_statement.toLowerCase().includes(q) ||
          r.request_code.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Strip heavy base64 data_urls from list payload for high performance
    const sanitizedList = filtered.map((item) => ({
      ...item,
      attachments: item.attachments?.map((att) => ({
        name: att.name,
        size: att.size,
        data_url: '', // populated on-demand when user clicks detail
      })),
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedList,
      current_user_id: effectiveUserId || null,
    });
  } catch (error) {
    console.error('[FeatureRequests GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limit check
    const rateLimitKey = `feature_request:${authUser?.id || ip}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mengirim saran lagi.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      title,
      category,
      problem_statement,
      expected_behavior,
      attachments,
      user_name,
      user_email,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Judul saran fitur wajib diisi.' },
        { status: 400 }
      );
    }

    if (!problem_statement || !problem_statement.trim()) {
      return NextResponse.json(
        { success: false, message: 'Penjelasan manfaat / masalah wajib diisi.' },
        { status: 400 }
      );
    }

    const userId = authUser?.id || (body.user_id ? String(body.user_id) : 'guest-' + Date.now());
    const userEmail = authUser?.email || user_email || 'pengguna@employr.id';
    const userName = authUser?.name || user_name || 'Pengguna Employr';

    const requestCode = `REQ-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const newId = `fr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newRequest: FeatureRequestItem = {
      id: newId,
      request_code: requestCode,
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      title: title.trim(),
      category: category || 'other',
      problem_statement: problem_statement.trim(),
      expected_behavior: expected_behavior ? expected_behavior.trim() : undefined,
      attachments: Array.isArray(attachments) ? attachments.slice(0, 5) : [],
      votes_count: 1,
      voter_ids: [userId],
      status: 'under_review',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: [],
    };

    const currentList = await readFeatureRequests();
    currentList.unshift(newRequest);
    await writeFeatureRequests(currentList);

    return NextResponse.json(
      {
        success: true,
        message: 'Saran fitur berhasil dikirim! Terima kasih atas kontribusimu.',
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[FeatureRequests POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json();
    const { request_id, action, user_id } = body;

    if (!request_id) {
      return NextResponse.json(
        { success: false, message: 'request_id wajib disertakan.' },
        { status: 400 }
      );
    }

    const currentList = await readFeatureRequests();
    const itemIndex = currentList.findIndex(
      (r) => r.id === request_id || r.request_code === request_id
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Saran fitur tidak ditemukan.' },
        { status: 404 }
      );
    }

    const effectiveUserId = authUser?.id || user_id || 'anonymous';
    const item = currentList[itemIndex];

    if (action === 'toggle_vote') {
      const alreadyVoted = item.voter_ids.includes(effectiveUserId);
      if (alreadyVoted) {
        // Remove vote
        item.voter_ids = item.voter_ids.filter((id) => id !== effectiveUserId);
        item.votes_count = Math.max(0, item.votes_count - 1);
      } else {
        // Add vote
        item.voter_ids.push(effectiveUserId);
        item.votes_count += 1;
      }
      item.updated_at = new Date().toISOString();
      currentList[itemIndex] = item;
      await writeFeatureRequests(currentList);

      return NextResponse.json({
        success: true,
        data: {
          id: item.id,
          votes_count: item.votes_count,
          has_voted: !alreadyVoted,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Aksi tidak dikenali.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[FeatureRequests PATCH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.' },
      { status: 500 }
    );
  }
}
