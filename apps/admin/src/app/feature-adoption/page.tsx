import { prisma } from '@employr/db';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { SidebarToggle } from '@/components/admin/SidebarToggle';

export const dynamic = 'force-dynamic';

export default async function FeatureAdoptionPage() {
  // Query feature usage from visitor_activities (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const featureUsage = await prisma.visitorActivity.groupBy({
    by: ['activity_type'],
    where: {
      activity_type: {
        in: ['FEATURE_USAGE', 'CV_FUNNEL_STEP', 'PRINT_EXPORT', 'ATS_SCORE_EVALUATION', 'SEARCH_QUERY', 'SECTION_EDIT', 'TEMPLATE_SWITCH']
      },
      created_at: { gte: thirtyDaysAgo }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  // Get unique users per feature
  const uniqueUsersTotal = await prisma.visitorActivity.findMany({
    where: {
      user_id: { not: null },
      created_at: { gte: thirtyDaysAgo },
    },
    distinct: ['user_id'],
    select: { user_id: true },
  });
  const totalActiveUsers = uniqueUsersTotal.length;

  // Get daily summary data if available
  const dailySummaries = await (prisma as any).analyticsDailySummary.findMany({
    where: {
      metric_name: { startsWith: 'feature_usage_' },
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'desc' },
    take: 100,
  }).catch(() => []);

  // Map activity types to readable names
  const featureNames: Record<string, string> = {
    'FEATURE_USAGE': 'Fitur Dashboard',
    'CV_FUNNEL_STEP': 'CV Builder',
    'PRINT_EXPORT': 'Cetak / Unduh CV',
    'ATS_SCORE_EVALUATION': 'Evaluasi ATS',
    'SEARCH_QUERY': 'Pencarian',
    'SECTION_EDIT': 'Edit Section CV',
    'TEMPLATE_SWITCH': 'Ganti Template',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3.5">
        <SidebarToggle />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Feature Adoption</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Penggunaan fitur oleh user dalam 30 hari terakhir</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-950">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">User Aktif (30 hari)</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{totalActiveUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-950">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Event</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                {featureUsage.reduce((sum, f) => sum + f._count.id, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950">
              <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fitur Terlacak</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{featureUsage.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Penggunaan per Fitur
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fitur</th>
              <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Event</th>
              <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">% dari Total</th>
            </tr>
          </thead>
          <tbody>
            {featureUsage.map((f, i) => {
              const total = featureUsage.reduce((s, x) => s + x._count.id, 0);
              const pct = total > 0 ? ((f._count.id / total) * 100).toFixed(1) : '0';
              return (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {featureNames[f.activity_type] || f.activity_type}
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-slate-600 dark:text-slate-400 font-mono">
                    {f._count.id.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {featureUsage.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">Belum ada data fitur yang terlacak</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
