import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      action,
      visitor_id,
      session_id,
      user_id,
      url,
      path,
      title,
      device,
      traffic,
      activity_type,
      activity_name,
      metadata,
      duration_increment_sec,
    } = payload;

    if (!visitor_id || !session_id) {
      return NextResponse.json({ success: false, message: 'visitor_id and session_id are required' }, { status: 400 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const now = new Date();

    if (action === 'page_view') {
      // 1. Check or Upsert Visitor
      const existingVisitor = await prisma.visitor.findUnique({
        where: { visitor_id },
      });

      if (!existingVisitor) {
        await prisma.visitor.create({
          data: {
            visitor_id,
            user_id: user_id || null,
            first_seen: now,
            last_seen: now,
            is_active: true,
            current_page: path || '/',
            current_title: title || 'Home',
            total_visits: 1,
            total_pageviews: 1,
            device_type: device?.device_type || 'Desktop',
            browser: device?.browser || 'Unknown',
            browser_version: device?.browser_version || '',
            os: device?.os || 'Unknown',
            screen_resolution: device?.screen_resolution || '',
            ip_address: ip,
            first_referrer: traffic?.referrer || null,
            traffic_source: traffic?.traffic_source || 'Direct',
            utm_source: traffic?.utm_source || null,
            utm_medium: traffic?.utm_medium || null,
            utm_campaign: traffic?.utm_campaign || null,
            utm_content: traffic?.utm_content || null,
            utm_term: traffic?.utm_term || null,
          },
        });
      } else {
        await prisma.visitor.update({
          where: { visitor_id },
          data: {
            last_seen: now,
            is_active: true,
            current_page: path || existingVisitor.current_page,
            current_title: title || existingVisitor.current_title,
            total_pageviews: { increment: 1 },
            user_id: user_id || existingVisitor.user_id,
            device_type: device?.device_type || existingVisitor.device_type,
            browser: device?.browser || existingVisitor.browser,
            os: device?.os || existingVisitor.os,
            screen_resolution: device?.screen_resolution || existingVisitor.screen_resolution,
          },
        });
      }

      // 2. Check or Upsert Session
      const existingSession = await prisma.visitorSession.findUnique({
        where: { session_id },
      });

      if (!existingSession) {
        await prisma.visitorSession.create({
          data: {
            session_id,
            visitor_id,
            user_id: user_id || null,
            started_at: now,
            last_active_at: now,
            duration_sec: 0,
            entry_page: path || '/',
            exit_page: path || '/',
            pageviews_count: 1,
            referrer: traffic?.referrer || null,
            traffic_source: traffic?.traffic_source || 'Direct',
            utm_source: traffic?.utm_source || null,
            utm_medium: traffic?.utm_medium || null,
            utm_campaign: traffic?.utm_campaign || null,
            device_type: device?.device_type || 'Desktop',
            browser: device?.browser || 'Unknown',
            os: device?.os || 'Unknown',
            ip_address: ip,
          },
        });

        if (existingVisitor) {
          await prisma.visitor.update({
            where: { visitor_id },
            data: { total_visits: { increment: 1 } },
          });
        }
      } else {
        await prisma.visitorSession.update({
          where: { session_id },
          data: {
            last_active_at: now,
            exit_page: path || existingSession.exit_page,
            pageviews_count: { increment: 1 },
            user_id: user_id || existingSession.user_id,
          },
        });
      }

      // 3. Create PageView record
      await prisma.visitorPageView.create({
        data: {
          visitor_id,
          session_id,
          url: url || path || '/',
          path: path || '/',
          title: title || 'Untitled',
          referrer: traffic?.referrer || null,
          created_at: now,
        },
      });

      // 4. Create Activity record
      await prisma.visitorActivity.create({
        data: {
          visitor_id,
          session_id,
          user_id: user_id || null,
          activity_type: 'PAGE_VIEW',
          activity_name: `Buka Halaman: ${title || path || '/'}`,
          page_path: path || '/',
          metadata: {
            url,
            traffic_source: traffic?.traffic_source,
            referrer: traffic?.referrer,
          },
          created_at: now,
        },
      });

      return NextResponse.json({ success: true, action: 'page_view_recorded' });
    }

    if (action === 'heartbeat') {
      const incrementSec = Math.max(1, Math.min(duration_increment_sec || 25, 120));

      await prisma.visitor.updateMany({
        where: { visitor_id },
        data: {
          last_seen: now,
          is_active: true,
          current_page: path || undefined,
          current_title: title || undefined,
          total_duration_sec: { increment: incrementSec },
          ...(user_id ? { user_id } : {}),
        },
      });

      await prisma.visitorSession.updateMany({
        where: { session_id },
        data: {
          last_active_at: now,
          exit_page: path || undefined,
          duration_sec: { increment: incrementSec },
          ...(user_id ? { user_id } : {}),
        },
      });

      return NextResponse.json({ success: true, action: 'heartbeat_recorded' });
    }

    if (action === 'activity') {
      await prisma.visitorActivity.create({
        data: {
          visitor_id,
          session_id,
          user_id: user_id || null,
          activity_type: activity_type || 'CUSTOM_EVENT',
          activity_name: activity_name || 'Aktivitas Pengguna',
          page_path: path || '/',
          metadata: metadata || null,
          created_at: now,
        },
      });

      await prisma.visitor.updateMany({
        where: { visitor_id },
        data: {
          last_seen: now,
          is_active: true,
          ...(user_id ? { user_id } : {}),
        },
      });

      return NextResponse.json({ success: true, action: 'activity_recorded' });
    }

    if (action === 'link_user') {
      if (!user_id) {
        return NextResponse.json({ success: false, message: 'user_id is required' }, { status: 400 });
      }

      await prisma.visitor.updateMany({
        where: { visitor_id },
        data: { user_id },
      });

      await prisma.visitorSession.updateMany({
        where: { visitor_id, user_id: null },
        data: { user_id },
      });

      await prisma.visitorActivity.updateMany({
        where: { visitor_id, user_id: null },
        data: { user_id },
      });

      // Also record an activity
      await prisma.visitorActivity.create({
        data: {
          visitor_id,
          session_id,
          user_id,
          activity_type: 'USER_LINKED',
          activity_name: 'Akun Terhubung (Login / Register)',
          page_path: path || '/',
          created_at: now,
        },
      });

      return NextResponse.json({ success: true, action: 'user_linked' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Visitor Track API] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
