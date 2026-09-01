import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Visitor Management data...');

  // Get existing users if any
  const users = await prisma.user.findMany({ take: 5 });
  const user1 = users[0];
  const user2 = users[1];

  const now = new Date();
  const tenSecAgo = new Date(now.getTime() - 10 * 1000);
  const thirtySecAgo = new Date(now.getTime() - 30 * 1000);
  const oneMinAgo = new Date(now.getTime() - 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);

  // 1. Live Visitor 1 (Active right now - Linked User)
  const vis1 = await prisma.visitor.upsert({
    where: { visitor_id: 'vis_live_001_id' },
    update: {},
    create: {
      visitor_id: 'vis_live_001_id',
      user_id: user1?.id || null,
      first_seen: twoHoursAgo,
      last_seen: tenSecAgo,
      is_active: true,
      current_page: '/cv',
      current_title: 'CV Builder — AmbilCUTI',
      total_visits: 3,
      total_pageviews: 14,
      total_duration_sec: 720,
      device_type: 'Desktop',
      browser: 'Chrome',
      browser_version: '128.0',
      os: 'Windows 11',
      screen_resolution: '1920x1080',
      ip_address: '182.253.12.88',
      country: 'Indonesia',
      city: 'Jakarta Selatan',
      first_referrer: 'https://www.google.com/',
      traffic_source: 'Google Organic',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'fresh_grad_cv',
    },
  });

  // Session 1 for vis1
  await prisma.visitorSession.upsert({
    where: { session_id: 'sess_live_001_s1' },
    update: {},
    create: {
      session_id: 'sess_live_001_s1',
      visitor_id: vis1.visitor_id,
      user_id: user1?.id || null,
      started_at: twoHoursAgo,
      last_active_at: tenSecAgo,
      duration_sec: 720,
      entry_page: '/',
      exit_page: '/cv',
      pageviews_count: 8,
      referrer: 'https://www.google.com/',
      traffic_source: 'Google Organic',
      device_type: 'Desktop',
      browser: 'Chrome',
      os: 'Windows 11',
      ip_address: '182.253.12.88',
    },
  });

  // Activities for vis1 (Demonstrating: Masuk website -> Buka Loker -> Lihat Detail -> Login -> Apply)
  const activitiesVis1 = [
    { type: 'PAGE_VIEW', name: 'Masuk Website (Landing Page)', path: '/', time: twoHoursAgo },
    { type: 'PAGE_VIEW', name: 'Buka Portal Loker', path: '/loker', time: new Date(twoHoursAgo.getTime() + 60000) },
    { type: 'PAGE_VIEW', name: 'Lihat Detail Loker: Frontend Developer PT Tokopedia', path: '/loker/fe-tokopedia', time: new Date(twoHoursAgo.getTime() + 120000) },
    { type: 'BUTTON_CLICK', name: 'Klik "Buat CV Siap Lamar"', path: '/loker/fe-tokopedia', time: new Date(twoHoursAgo.getTime() + 180000) },
    { type: 'LOGIN', name: 'Berhasil Login ke Akun Pengguna', path: '/login', time: new Date(twoHoursAgo.getTime() + 240000) },
    { type: 'USER_LINKED', name: 'Akun Terhubung (User Linked)', path: '/beranda', time: new Date(twoHoursAgo.getTime() + 250000) },
    { type: 'CV_CREATE', name: 'Membuka CV Builder & Pilih Template Modern', path: '/cv', time: new Date(twoHoursAgo.getTime() + 320000) },
    { type: 'JOB_APPLY', name: 'Submit Lamaran ke Tracker', path: '/tracker', time: new Date(twoHoursAgo.getTime() + 450000) },
  ];

  for (const act of activitiesVis1) {
    await prisma.visitorActivity.create({
      data: {
        visitor_id: vis1.visitor_id,
        session_id: 'sess_live_001_s1',
        user_id: user1?.id || null,
        activity_type: act.type,
        activity_name: act.name,
        page_path: act.path,
        created_at: act.time,
      },
    });

    await prisma.visitorPageView.create({
      data: {
        visitor_id: vis1.visitor_id,
        session_id: 'sess_live_001_s1',
        url: `https://employr.id${act.path}`,
        path: act.path,
        title: act.name,
        duration_sec: 45,
        created_at: act.time,
      },
    });
  }

  // 2. Live Visitor 2 (Active right now - Mobile Instagram anonymous)
  const vis2 = await prisma.visitor.upsert({
    where: { visitor_id: 'vis_live_002_mob' },
    update: {},
    create: {
      visitor_id: 'vis_live_002_mob',
      user_id: null,
      first_seen: thirtySecAgo,
      last_seen: thirtySecAgo,
      is_active: true,
      current_page: '/loker',
      current_title: 'Daftar Lowongan Kerja — Employr',
      total_visits: 1,
      total_pageviews: 3,
      total_duration_sec: 140,
      device_type: 'Mobile',
      browser: 'Safari',
      browser_version: '17.2',
      os: 'iOS 17',
      screen_resolution: '390x844',
      ip_address: '114.122.45.19',
      country: 'Indonesia',
      city: 'Bandung',
      first_referrer: 'https://l.instagram.com/',
      traffic_source: 'Instagram',
      utm_source: 'instagram',
      utm_medium: 'bio_link',
      utm_campaign: 'story_promo',
    },
  });

  await prisma.visitorSession.upsert({
    where: { session_id: 'sess_live_002_s1' },
    update: {},
    create: {
      session_id: 'sess_live_002_s1',
      visitor_id: vis2.visitor_id,
      started_at: thirtySecAgo,
      last_active_at: thirtySecAgo,
      duration_sec: 140,
      entry_page: '/',
      exit_page: '/loker',
      pageviews_count: 3,
      referrer: 'https://l.instagram.com/',
      traffic_source: 'Instagram',
      device_type: 'Mobile',
      browser: 'Safari',
      os: 'iOS 17',
      ip_address: '114.122.45.19',
    },
  });

  await prisma.visitorActivity.create({
    data: {
      visitor_id: vis2.visitor_id,
      session_id: 'sess_live_002_s1',
      activity_type: 'PAGE_VIEW',
      activity_name: 'Masuk website via Instagram Story',
      page_path: '/',
      created_at: thirtySecAgo,
    },
  });

  // 3. Historical Visitor 3 (Yesterday - Linked User 2)
  const vis3 = await prisma.visitor.upsert({
    where: { visitor_id: 'vis_hist_003_desk' },
    update: {},
    create: {
      visitor_id: 'vis_hist_003_desk',
      user_id: user2?.id || null,
      first_seen: threeDaysAgo,
      last_seen: yesterday,
      is_active: false,
      current_page: '/tracker',
      current_title: 'Job Tracker — AmbilCUTI',
      total_visits: 5,
      total_pageviews: 28,
      total_duration_sec: 1850,
      device_type: 'Desktop',
      browser: 'Firefox',
      browser_version: '129.0',
      os: 'macOS',
      screen_resolution: '2560x1440',
      ip_address: '103.28.14.52',
      country: 'Indonesia',
      city: 'Surabaya',
      first_referrer: 'https://www.tiktok.com/',
      traffic_source: 'TikTok',
      utm_source: 'tiktok',
      utm_medium: 'influencer',
      utm_campaign: 'tips_interview',
    },
  });

  console.log('Visitor Management seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
