'use client';

import { BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
        <Skeleton className="h-10 w-40 bg-surface-1" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-surface-1 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-surface-1 rounded-xl" />
          <Skeleton className="h-64 bg-surface-1 rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = data?.data?.summary;
  const byStatus = data?.data?.tickets_by_status ?? {};
  const byPriority = data?.data?.tickets_by_priority ?? {};
  const weekly = data?.data?.weekly_trends ?? {};

  const statusLabels: Record<string, string> = {
    open: 'Terbuka',
    in_progress: 'Ditangani',
    resolved: 'Selesai',
    closed: 'Ditutup',
  };

  return (
    <div className="space-y-12 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="display-md text-ink">Laporan</h1>
        <p className="body-lg text-ink-muted mt-2">Statistik dan analisis performa helpdesk</p>
      </div>

      {/* Summary metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summary && [
          { label: 'Total Tiket', value: summary.total_tickets, icon: BarChart3, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'SLA Terlampaui', value: summary.sla_breached, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Selesai', value: summary.resolved_tickets, icon: CheckCircle2, color: 'text-semantic-success', bg: 'bg-semantic-success/10' },
          { label: 'Avg Resolusi', value: `${summary.avg_resolution_hours}h`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className={i === 0 ? "card-pricing-featured" : "card-pricing"}>
            <div className="flex flex-row items-center justify-between pb-4">
              <h3 className="caption font-bold text-ink-muted uppercase tracking-widest">{label}</h3>
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <div className="text-[36px] font-display text-ink leading-none tracking-tighter">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* By Status */}
        <div className="card-pricing">
          <h2 className="headline text-ink mb-8">Tiket per Status</h2>
          <div className="space-y-4">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between py-3 border-b border-hairline last:border-0 group">
                <span className="body-sm text-ink-muted group-hover:text-ink transition-colors">{statusLabels[status] ?? status}</span>
                <span className="micro font-bold bg-surface-2 px-3 py-1 rounded-pill text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="card-pricing">
          <h2 className="headline text-ink mb-8">Tiket per Prioritas</h2>
          <div className="space-y-4">
            {Object.entries(byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between py-3 border-b border-hairline last:border-0 group">
                <span className="body-sm text-ink-muted group-hover:text-ink transition-colors capitalize">{priority}</span>
                <span className={`micro font-bold px-3 py-1 rounded-pill ${
                  priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 
                  priority === 'normal' ? 'bg-accent-blue/20 text-accent-blue' : 
                  'bg-surface-2 text-ink-muted'
                }`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly trends */}
      {Object.keys(weekly).length > 0 && (
        <div className="spotlight-violet p-8 rounded-xl overflow-hidden relative group">
          <div className="relative z-10">
            <h2 className="headline text-white mb-10">Tren Tiket Mingguan</h2>
            <div className="flex items-end gap-3 h-48 sm:gap-6">
              {Object.entries(weekly).map(([date, count]) => {
                const maxVal = Math.max(...Object.values(weekly) as number[]);
                const pct = maxVal > 0 ? ((count as number) / maxVal) * 100 : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-4">
                    <span className="micro font-bold text-white mb-1">{count as number}</span>
                    <div className="w-full relative group/bar">
                      <div
                        className="w-full rounded-t-lg bg-white/20 group-hover/bar:bg-white/40 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        style={{ height: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                    <span className="micro font-bold text-white/60 uppercase tracking-widest mt-2 hidden sm:block">
                      {new Date(date).toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                    <span className="micro font-bold text-white/60 uppercase tracking-widest mt-2 sm:hidden">
                      {new Date(date).toLocaleDateString('id-ID', { day: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
