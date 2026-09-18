import { prisma } from '@employr/db';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Scale, TrendingUp } from 'lucide-react';
import { SidebarToggle } from '@/components/admin/SidebarToggle';

export const dynamic = 'force-dynamic';

export default async function TuningSuggestionsPage() {
  const suggestions = await prisma.system_settings.findMany({
    where: { group: 'tuning_suggestions' },
    orderBy: { updated_at: 'desc' },
  });

  const parsed = suggestions.map((s) => {
    try {
      const data = JSON.parse(s.value);
      return { key: s.key.replace('pending_', ''), rawKey: s.key, ...data };
    } catch {
      return null;
    }
  }).filter(Boolean);

  const pending = parsed.filter((s: any) => s.status === 'PENDING');
  const history = parsed.filter((s: any) => s.status !== 'PENDING');

  const anomalies = await prisma.$queryRaw<any[]>`
    SELECT date, metric_name, metric_value::float as value, dimensions
    FROM analytics_daily_summary
    WHERE dimensions::text LIKE '%"flagged":true%'
    ORDER BY date DESC
    LIMIT 20
  `.catch(() => []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3.5">
        <SidebarToggle />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Data Quality & Tuning
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review saran auto-tuning dan anomali data
          </p>
        </div>
      </div>

      {/* Pending Suggestions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Saran Tuning Menunggu Persetujuan
            {pending.length > 0 && (
              <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                {pending.length} pending
              </span>
            )}
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Tidak ada saran tuning yang menunggu persetujuan
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.map((s: any, i: number) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {s.key}
                      </code>
                      <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold ${
                        s.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        s.confidence === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {s.confidence}
                      </span>
                      {s.clamped && (
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          CLAMPED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{s.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Current: <strong className="text-slate-700 dark:text-slate-300">{s.current}</strong></span>
                      <TrendingUp className="w-3 h-3" />
                      <span>Suggested: <strong className="text-blue-600">{s.suggested}</strong></span>
                      {s.original_suggested !== s.suggested && (
                        <span className="text-rose-500">(original: {s.original_suggested})</span>
                      )}
                      <span>Samples: {s.sample_size?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={`/api/admin/tuning/approve`} method="POST">
                      <input type="hidden" name="key" value={s.key} />
                      <button className="px-3.5 py-2 rounded-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs border border-emerald-200 transition flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </form>
                    <form action={`/api/admin/tuning/reject`} method="POST">
                      <input type="hidden" name="key" value={s.key} />
                      <button className="px-3.5 py-2 rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anomaly Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Data Anomali Terdeteksi
          </h2>
        </div>

        {anomalies.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Tidak ada anomali terdeteksi
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Metrik</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Avg 7 Hari</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Rasio</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a: any, i: number) => {
                const dims = typeof a.dimensions === 'string' ? JSON.parse(a.dimensions) : a.dimensions;
                return (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-5 py-3 text-sm text-slate-600">{new Date(a.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-700">{a.metric_name}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-slate-600">{Math.round(a.value).toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-slate-500">{Math.round(dims?.avg7d || 0).toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {(dims?.ratio || 0).toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Riwayat Tuning</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 20).map((s: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {s.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <code className="text-xs font-mono text-slate-600">{s.key}</code>
                  <span className="text-xs text-slate-400">{s.current} → {s.suggested}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {s.approved_at || s.rejected_at ? new Date(s.approved_at || s.rejected_at).toLocaleDateString('id-ID') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
