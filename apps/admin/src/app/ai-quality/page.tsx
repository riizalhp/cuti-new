import { prisma } from '@employr/db';
import { Brain, ThumbsUp, ThumbsDown, BarChart3, Zap } from 'lucide-react';
import { SidebarToggle } from '@/components/admin/SidebarToggle';

export const dynamic = 'force-dynamic';

export default async function AiQualityPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get AI feedback events from visitor_activities
  const aiFeedbackEvents = await prisma.visitorActivity.findMany({
    where: {
      activity_type: 'AI_FEEDBACK',
      created_at: { gte: thirtyDaysAgo },
    },
    select: { metadata: true, created_at: true },
    orderBy: { created_at: 'desc' },
    take: 500,
  });

  // Get explicit feedback for ai_suggestion feature
  const explicitFeedback = await (prisma as any).userFeedback.findMany({
    where: {
      feature: 'ai_suggestion',
      created_at: { gte: thirtyDaysAgo },
    },
    select: { rating: true, comment: true, created_at: true },
    orderBy: { created_at: 'desc' },
    take: 100,
  }).catch(() => []);

  // Calculate metrics
  const totalFeedback = aiFeedbackEvents.length;
  const applied = aiFeedbackEvents.filter((e: any) => e.metadata?.action === 'applied').length;
  const modified = aiFeedbackEvents.filter((e: any) => e.metadata?.action === 'modified').length;
  const rejected = aiFeedbackEvents.filter((e: any) => e.metadata?.action === 'rejected').length;
  const ignored = aiFeedbackEvents.filter((e: any) => e.metadata?.action === 'ignored').length;

  const acceptanceRate = totalFeedback > 0 ? ((applied + modified) / totalFeedback * 100).toFixed(1) : '0';
  const rejectionRate = totalFeedback > 0 ? (rejected / totalFeedback * 100).toFixed(1) : '0';

  const avgTimeToAction = aiFeedbackEvents
    .filter((e: any) => e.metadata?.time_to_action_ms)
    .reduce((sum: number, e: any, _, arr: any[]) => sum + (e.metadata.time_to_action_ms / arr.length), 0);

  const positiveExplicit = explicitFeedback.filter((f: any) => f.rating > 0).length;
  const negativeExplicit = explicitFeedback.filter((f: any) => f.rating < 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3.5">
        <SidebarToggle />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">AI Quality Monitor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Performa dan kualitas saran AI dalam 30 hari terakhir</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-950">
              <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Acceptance Rate</p>
              <p className="text-xl font-extrabold text-emerald-600">{acceptanceRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-rose-50 dark:bg-rose-950">
              <ThumbsDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Rejection Rate</p>
              <p className="text-xl font-extrabold text-rose-600">{rejectionRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-950">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg Time to Action</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{avgTimeToAction > 0 ? `${(avgTimeToAction / 1000).toFixed(1)}s` : '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950">
              <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Feedback</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{totalFeedback}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Breakdown Respons User
          </h2>
          <div className="space-y-3">
            {[{label: 'Diterapkan', count: applied, color: 'bg-emerald-500'},
              {label: 'Dimodifikasi', count: modified, color: 'bg-blue-500'},
              {label: 'Ditolak', count: rejected, color: 'bg-rose-500'},
              {label: 'Diabaikan', count: ignored, color: 'bg-slate-400'},
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{width: `${totalFeedback > 0 ? (item.count/totalFeedback*100) : 0}%`}} />
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-4">Komentar Terbaru</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {explicitFeedback.filter((f: any) => f.comment).slice(0, 10).map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {f.rating > 0 
                  ? <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  : <ThumbsDown className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                }
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{f.comment}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(f.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
            {explicitFeedback.filter((f: any) => f.comment).length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada komentar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
