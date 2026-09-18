import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

type TransactionType = 'MEMBERSHIP' | 'TOPUP' | 'ADDON' | 'REFERRAL_REWARD' | 'MISI_REWARD';
type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

const REWARD_TRANSACTION_TYPES: TransactionType[] = ['MISI_REWARD', 'REFERRAL_REWARD', 'TOPUP'];
const SUCCESS_STATUS: TransactionStatus = 'SUCCESS';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatLongDate(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function mapMisiCategory(type: string): 'Harian' | 'Mingguan' | 'Spesial' {
  switch (type) {
    case 'REGISTER_ACCOUNT':
    case 'SURVEY':
    case 'REVIEW':
      return 'Spesial';
    case 'SOCIAL':
    case 'DOWNLOAD':
      return 'Harian';
    default:
      return 'Mingguan';
  }
}

function mapMisiEstimatedTime(type: string): string {
  switch (type) {
    case 'REGISTER_ACCOUNT':
      return '10-15 Menit';
    case 'SURVEY':
      return '5-10 Menit';
    case 'REVIEW':
      return '15-20 Menit';
    case 'DOWNLOAD':
      return '2-5 Menit';
    default:
      return '10-15 Menit';
  }
}

async function buildProfilePayload(userId: string, user: any) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [membership, transactions, referrals, activeMisi, userSubmissions, leaderboardRows, checkinToday, userPrefsRow] = await Promise.all([
    prisma.membership.findUnique({ where: { user_id: userId } }),
    prisma.transactions.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 30 }),
    prisma.referrals.findMany({
      where: { referrer_id: userId },
      include: { users_referrals_referred_idTousers: true },
      orderBy: { created_at: 'desc' },
      take: 20,
    }),
    prisma.misi.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' }, take: 30 }),
    prisma.misi_submissions.findMany({ where: { user_id: userId } }),
    prisma.$queryRawUnsafe(`
      SELECT u.id, u.name,
        COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'SUCCESS' AND t.type IN ('MISI_REWARD','REFERRAL_REWARD','TOPUP')), 0)::int AS coins
      FROM users u
      LEFT JOIN transactions t ON t.user_id = u.id
      GROUP BY u.id, u.name
      ORDER BY coins DESC
      LIMIT 10
    `),
    prisma.transactions.findFirst({
      where: {
        user_id: userId,
        type: 'TOPUP',
        description: 'Bonus Check-in Harian',
        created_at: { gte: startOfToday },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } }),
  ]);

  // --- Gamification ---
  const coins = transactions
    .filter((t) => REWARD_TRANSACTION_TYPES.includes(t.type as TransactionType) && t.status === SUCCESS_STATUS)
    .reduce((sum, t) => sum + t.amount, 0);
  const xp = Math.floor(coins / 10);
  const level = Math.max(1, Math.floor(xp / 600) + 1);

  // --- Missions ---
  const organizerIds = [...new Set(activeMisi.map((m) => m.created_by))];
  const organizers = organizerIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: organizerIds } }, select: { id: true, name: true } })
    : [];
  const organizerMap = new Map(organizers.map((o) => [o.id, o.name]));

  const submissionMap = new Map(userSubmissions.map((s) => [s.misi_id, s]));

  const missions = activeMisi.map((m) => {
    const submission = submissionMap.get(m.id);
    const status = !submission
      ? 'Tersedia'
      : submission.status === 'APPROVED' || submission.status === 'PAID'
      ? 'Selesai'
      : 'Sedang Ditinjau';
    const rewardCoins = m.reward_amount || 0;
    const detailedSteps = m.instructions
      ? m.instructions.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      id: m.id,
      title: m.title,
      desc: m.description,
      organizer: organizerMap.get(m.created_by) || 'Employr',
      estimatedTime: mapMisiEstimatedTime(m.type),
      participantsCount: m.current_submissions || 0,
      quotaTotal: m.max_submissions || 100,
      category: mapMisiCategory(m.type),
      status,
      rewardCoins,
      rewardXp: Math.max(10, Math.round(rewardCoins / 10)),
      progressCurrent: submission ? 1 : 0,
      progressTarget: 1,
      claimed: !!submission && (submission.status === 'APPROVED' || submission.status === 'PAID'),
      detailedSteps: detailedSteps.length > 0 ? detailedSteps : undefined,
      terms: m.requires_proof
        ? 'Bukti pengerjaan diverifikasi oleh tim dalam maksimal 1x24 jam. Pengiriman bukti palsu dapat menyebabkan akun dibekukan.'
        : undefined,
      submissionProof: submission
        ? {
            proofLink: submission.proof_data.startsWith('http') ? submission.proof_data : undefined,
            notes: submission.admin_notes || undefined,
            screenshotUrl: submission.proof_data.startsWith('http') ? undefined : submission.proof_data,
            submittedAt: formatRelativeTime(submission.submitted_at),
          }
        : undefined,
    };
  });

  // --- History logs (misi selesai) ---
  const missionHistory = userSubmissions
    .filter((s) => s.status === 'APPROVED' || s.status === 'PAID')
    .slice(0, 20)
    .map((s) => {
      const misi = activeMisi.find((m) => m.id === s.misi_id);
      return {
        id: s.id,
        title: misi?.title || 'Misi Karier',
        organizer: (misi && organizerMap.get(misi.created_by)) || 'Employr',
        date: formatLongDate(s.submitted_at),
        category: 'Misi Selesai',
        rewardText: `+${(misi?.reward_amount || 0).toLocaleString('id-ID')} Koin`,
        status: s.status === 'PAID' ? 'Dibayar' : 'Disetujui',
      };
    });

  // --- Coin history ---
  const coinHistory = transactions.slice(0, 20).map((t) => {
    const isIn = t.status === 'SUCCESS' && REWARD_TRANSACTION_TYPES.includes(t.type as TransactionType);
    const typeLabel: Record<string, string> = {
      MISI_REWARD: 'Reward Misi',
      REFERRAL_REWARD: 'Bonus Referral',
      TOPUP: 'Top Up Saldo',
      MEMBERSHIP: 'Pembelian Keanggotaan',
      ADDON: 'Pembelian Add-on',
    };
    return {
      id: t.id,
      date: formatRelativeTime(t.created_at),
      desc: t.description || typeLabel[t.type] || 'Transaksi',
      amount: isIn ? `+${t.amount.toLocaleString('id-ID')}` : `-${t.amount.toLocaleString('id-ID')}`,
      type: isIn ? 'in' : 'out',
    };
  });

  // --- Leaderboard ---
  const leaderboard = (leaderboardRows as Array<{ id: string; name: string; coins: number }>).map((row, idx) => ({
    rank: idx + 1,
    name: row.id === userId ? `${row.name} (Anda)` : row.name,
    title: 'Job Seeker',
    coins: row.coins,
    level: Math.max(1, Math.floor(row.coins / 6000) + 1),
    badge: 'Pencari Kerja',
  }));

  // --- Referral stats ---
  const rewarded = referrals.filter((r) => r.status !== 'PENDING');
  const totalBonus = rewarded.reduce((sum, r) => sum + r.reward_amount, 0);
  const invitedFriends = referrals.map((r) => ({
    name: r.users_referrals_referred_idTousers?.name || 'Teman Baru',
    date: formatLongDate(r.created_at),
    status: r.status === 'REWARDED' ? 'Reward Diberikan' : r.status === 'REGISTERED' ? 'Terdaftar' : 'Menunggu',
    reward: r.reward_amount > 0 ? `+${r.reward_amount.toLocaleString('id-ID')} Koin` : 'Belum ada',
  }));

  const firstName = (user.name || 'USER').split(' ')[0].toUpperCase();
  const referralCode = user.referral_code || `EMPLOYR-${firstName}${new Date().getFullYear()}`;

  const prefs = (userPrefsRow?.preferences as Record<string, any> | null) || {};

  // Auto fallback bio dari CV pertama jika di preferences masih kosong
  let resolvedBio = typeof prefs.bio === 'string' ? prefs.bio : '';
  if (!resolvedBio || resolvedBio.trim() === '') {
    try {
      const firstCv = await prisma.cv_projects.findFirst({
        where: { user_id: userId, is_active: true },
        orderBy: { created_at: 'asc' },
        select: { data: true },
      });
      if (firstCv && firstCv.data && typeof firstCv.data === 'object') {
        const cvData = firstCv.data as Record<string, any>;
        if (typeof cvData.summary === 'string' && cvData.summary.trim()) {
          resolvedBio = cvData.summary.trim();
          // Auto-backfill ke preferences pengguna secara non-blocking
          prisma.user
            .update({
              where: { id: userId },
              data: {
                preferences: {
                  ...prefs,
                  bio: resolvedBio,
                },
              },
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[buildProfilePayload] Gagal fallback bio dari CV:', e);
    }
  }

  return {
    id: user.id,
    name: user.name,
    fullName: user.name,
    email: user.email,
    phone: user.phone || prefs.phone || '',
    avatarUrl: user.avatar_url || prefs.avatarUrl || '',
    photoUrl: user.avatar_url || prefs.photoUrl || '',
    headline: prefs.headline || '',
    location: prefs.location || '',
    bio: resolvedBio,
    address: prefs.address || '',
    gender: prefs.gender || '',
    birthDate: prefs.birthDate || '',
    linkedin: prefs.linkedin || '',
    github: prefs.github || '',
    website: prefs.website || '',
    portfolio: prefs.portfolio || '',
    targetIndustry: prefs.targetIndustry || '',
    expectedSalary: prefs.expectedSalary || '',
    experienceYears: prefs.experienceYears || (user.experience_year ? `${user.experience_year} Tahun` : ''),
    workPreference: prefs.workPreference || '',
    targetCities: prefs.targetCities || '',
    availability: prefs.availability || '',
    canRelocate: prefs.canRelocate ?? false,
    negotiableSalary: prefs.negotiableSalary ?? true,
    desiredBenefits: Array.isArray(prefs.desiredBenefits) ? prefs.desiredBenefits : [],
    education: user.education || prefs.education || '',
    major: user.major || prefs.major || '',
    lastCompany: user.last_company || prefs.lastCompany || '',
    targetJob: user.target_job || prefs.targetRole || prefs.targetPosition || '',
    targetPosition: user.target_job || prefs.targetRole || prefs.targetPosition || '',
    targetRole: user.target_job || prefs.targetRole || prefs.targetPosition || '',
    skills: user.skills || [],
    onboarded: Boolean(user.onboarded),
    referralCode,
    referralLink: `https://employr.id/ref/${referralCode}`,
    membership: membership
      ? {
          tier: membership.tier,
          packageName: membership.package_name || membership.tier,
          isLifetime: membership.is_lifetime,
          isActive: membership.is_active,
        }
      : null,
    gamification: {
      coins,
      xp,
      level,
      checkedInToday: !!checkinToday,
    },
    preferences: (userPrefsRow?.preferences as Record<string, any> | null) || null,
    missions,
    missionHistory,
    coinHistory,
    leaderboard,
    referralStats: {
      totalBonus: totalBonus > 0 ? `${totalBonus.toLocaleString('id-ID')} Koin` : 'Belum ada bonus',
      invitedFriends,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) {
      return NextResponse.json({ success: true, data: null });
    }

    const profile = await buildProfilePayload(fullUser.id, fullUser);
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('[GET /api/user/profile] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat profil dari database.' },
      { status: 500 }
    );
  }
}

async function handleUpsert(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Data profil tidak valid.' },
        { status: 400 }
      );
    }

    const data: Record<string, any> = {
      updated_at: new Date(),
    };

    if (typeof body.onboarded === 'boolean') data.onboarded = body.onboarded;
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
    if (typeof body.fullName === 'string' && body.fullName.trim()) data.name = body.fullName.trim();
    if (typeof body.phone === 'string') {
      const cleanPhone = body.phone.trim();
      data.phone = cleanPhone || null;
    }
    if (typeof body.avatarUrl === 'string') data.avatar_url = body.avatarUrl || null;
    if (typeof body.photoUrl === 'string' && !data.avatar_url) data.avatar_url = body.photoUrl || null;
    if (typeof body.education === 'string') data.education = body.education || null;
    if (typeof body.major === 'string') data.major = body.major || null;
    if (typeof body.lastCompany === 'string') data.last_company = body.lastCompany || null;
    if (typeof body.targetRole === 'string' && body.targetRole.trim()) {
      data.target_job = body.targetRole.trim();
    }
    if (typeof body.targetJob === 'string' && body.targetJob.trim()) {
      data.target_job = body.targetJob.trim();
    }
    if (typeof body.target_job === 'string' && body.target_job.trim()) {
      data.target_job = body.target_job.trim();
    }
    if (typeof body.targetPosition === 'string' && body.targetPosition.trim() && !data.target_job) {
      data.target_job = body.targetPosition.trim();
    }
    if (typeof body.experienceYears === 'string') {
      const match = body.experienceYears.match(/\d+/);
      if (match) data.experience_year = parseInt(match[0], 10);
    }
    if (Array.isArray(body.skills)) data.skills = body.skills.filter((s: any) => typeof s === 'string');

    // Notification, regional & extended profile preferences disimpan sebagai JSON terstruktur
    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    });
    const existing = (current?.preferences as Record<string, any> | null) || {};
    const prefs: Record<string, any> = { ...existing };

    if (body.preferences && typeof body.preferences === 'object' && !Array.isArray(body.preferences)) {
      const incoming = body.preferences as Record<string, any>;
      if (incoming.notifications && typeof incoming.notifications === 'object') {
        prefs.notifications = { ...(existing.notifications || {}), ...incoming.notifications };
      }
      if (typeof incoming.language === 'string') prefs.language = incoming.language;
      if (typeof incoming.timezone === 'string') prefs.timezone = incoming.timezone;
      if (typeof incoming.currency === 'string') prefs.currency = incoming.currency;
      if (typeof incoming.theme === 'string') prefs.theme = incoming.theme;
    }

    const extraFields = [
      'location', 'bio', 'headline', 'address', 'gender', 'birthDate',
      'linkedin', 'github', 'website', 'portfolio', 'targetIndustry',
      'expectedSalary', 'workPreference', 'targetCities', 'availability',
      'canRelocate', 'negotiableSalary', 'desiredBenefits', 'experienceYears',
      'targetRole', 'targetPosition',
      'phone'
    ];
    for (const field of extraFields) {
      if (body[field] !== undefined) {
        prefs[field] = body[field];
      }
    }

    data.preferences = prefs;

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    // Auto-learn keywords into dynamic dictionary asynchronously (non-blocking)
    (async () => {
      try {
        const toInsert: { category: string; value: string }[] = [];
        if (Array.isArray(body.skills)) {
          body.skills.forEach((s: any) => {
            if (typeof s === 'string' && s.trim().length > 1) {
              toInsert.push({ category: 'skill', value: s.trim() });
            }
          });
        }
        if (typeof body.education === 'string' && body.education.trim().length > 1) {
          toInsert.push({ category: 'institution', value: body.education.trim() });
        }
        if (typeof body.major === 'string' && body.major.trim().length > 1) {
          toInsert.push({ category: 'major', value: body.major.trim() });
        }
        if (typeof body.targetJob === 'string' && body.targetJob.trim().length > 1) {
          toInsert.push({ category: 'position', value: body.targetJob.trim() });
        }

        for (const item of toInsert) {
          const cleanVal = item.value.trim();
          if (!cleanVal) continue;
          try {
            const existing = await (prisma as any).cv_learning_dictionary.findFirst({
              where: { value: { equals: cleanVal, mode: 'insensitive' } },
            });

            if (existing) {
              await (prisma as any).cv_learning_dictionary.update({
                where: { id: existing.id },
                data: { frequency: { increment: 1 } },
              });
            } else {
              await (prisma as any).cv_learning_dictionary.create({
                data: {
                  category: item.category,
                  value: cleanVal,
                  frequency: 1,
                },
              });
            }
          } catch {}
        }
      } catch (err) {
        // Silently ignore learning errors to avoid affecting profile saves
      }
    })();

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    const profile = await buildProfilePayload(user.id, updatedUser);

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('[PUT /api/user/profile] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan profil ke database.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return handleUpsert(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpsert(req);
}
