import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);

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
      hostname: payloadHostname,
      domain: payloadDomain,
      device,
      traffic,
      activity_type,
      activity_name,
      metadata,
      duration_increment_sec,
    } = payload;

    if (!visitor_id || !session_id) {
      return NextResponse.json(
        { success: false, message: 'visitor_id and session_id are required' },
        { status: 400, headers }
      );
    }

    // Extract hostname / domain cleanly
    let detectedHostname = payloadHostname || '';
    if (!detectedHostname && url) {
      try {
        detectedHostname = new URL(url).hostname;
      } catch {}
    }
    const detectedDomain = payloadDomain || (detectedHostname ? detectedHostname.replace(/:\d+$/, '') : null);

    const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const now = new Date();

    if (action === 'page_view') {
      // 1. Check or Upsert Visitor
      const existingVisitor = await (prisma as any).visitor.findUnique({
        where: { visitor_id },
      });

      if (!existingVisitor) {
        await (prisma as any).visitor.create({
          data: {
            visitor_id,
            user_id: user_id || null,
            first_seen: now,
            last_seen: now,
            is_active: true,
            current_page: path || '/',
            current_title: title || 'Home',
            domain: detectedDomain,
            hostname: detectedHostname || null,
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
        await (prisma as any).visitor.update({
          where: { visitor_id },
          data: {
            last_seen: now,
            is_active: true,
            current_page: path || existingVisitor.current_page,
            current_title: title || existingVisitor.current_title,
            domain: detectedDomain || (existingVisitor as any).domain,
            hostname: detectedHostname || (existingVisitor as any).hostname,
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
      const existingSession = await (prisma as any).visitorSession.findUnique({
        where: { session_id },
      });

      if (!existingSession) {
        await (prisma as any).visitorSession.create({
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
            domain: detectedDomain,
            hostname: detectedHostname || null,
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
          await (prisma as any).visitor.update({
            where: { visitor_id },
            data: { total_visits: { increment: 1 } },
          });
        }
      } else {
        await (prisma as any).visitorSession.update({
          where: { session_id },
          data: {
            last_active_at: now,
            exit_page: path || existingSession.exit_page,
            domain: detectedDomain || (existingSession as any).domain,
            hostname: detectedHostname || (existingSession as any).hostname,
            pageviews_count: { increment: 1 },
            user_id: user_id || existingSession.user_id,
          },
        });
      }

      // 3. Create PageView record
      await (prisma as any).visitorPageView.create({
        data: {
          visitor_id,
          session_id,
          url: url || path || '/',
          path: path || '/',
          title: title || 'Untitled',
          domain: detectedDomain,
          hostname: detectedHostname || null,
          referrer: traffic?.referrer || null,
          created_at: now,
        },
      });

      // 4. Create Activity record
      await (prisma as any).visitorActivity.create({
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

      return NextResponse.json({ success: true, action: 'page_view_recorded' }, { headers });
    }

    if (action === 'heartbeat') {
      const incrementSec = Math.max(1, Math.min(duration_increment_sec || 25, 120));

      await (prisma as any).visitor.updateMany({
        where: { visitor_id },
        data: {
          last_seen: now,
          is_active: true,
          current_page: path || undefined,
          current_title: title || undefined,
          ...(detectedDomain ? { domain: detectedDomain } : {}),
          ...(detectedHostname ? { hostname: detectedHostname } : {}),
          total_duration_sec: { increment: incrementSec },
          ...(user_id ? { user_id } : {}),
        },
      });

      await (prisma as any).visitorSession.updateMany({
        where: { session_id },
        data: {
          last_active_at: now,
          exit_page: path || undefined,
          ...(detectedDomain ? { domain: detectedDomain } : {}),
          ...(detectedHostname ? { hostname: detectedHostname } : {}),
          duration_sec: { increment: incrementSec },
          ...(user_id ? { user_id } : {}),
        },
      });

      return NextResponse.json({ success: true, action: 'heartbeat_recorded' }, { headers });
    }

    if (action === 'activity') {
      await (prisma as any).visitorActivity.create({
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

      await (prisma as any).visitor.updateMany({
        where: { visitor_id },
        data: {
          last_seen: now,
          is_active: true,
          ...(detectedDomain ? { domain: detectedDomain } : {}),
          ...(detectedHostname ? { hostname: detectedHostname } : {}),
          ...(user_id ? { user_id } : {}),
        },
      });

      return NextResponse.json({ success: true, action: 'activity_recorded' }, { headers });
    }

    if (action === 'link_user') {
      if (!user_id) {
        return NextResponse.json({ success: false, message: 'user_id is required' }, { status: 400, headers });
      }

      await (prisma as any).visitor.updateMany({
        where: { visitor_id },
        data: { user_id },
      });

      await (prisma as any).visitorSession.updateMany({
        where: { visitor_id, user_id: null },
        data: { user_id },
      });

      await (prisma as any).visitorActivity.updateMany({
        where: { visitor_id, user_id: null },
        data: { user_id },
      });

      await (prisma as any).visitorActivity.create({
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

      return NextResponse.json({ success: true, action: 'user_linked' }, { headers });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400, headers });
  } catch (error: any) {
    console.error('[Visitor Track API Admin] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}
