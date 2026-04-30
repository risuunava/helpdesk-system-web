'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground mt-1">Statistik dan analisis tiket</p>
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summary && [
          { label: 'Total Tiket', value: summary.total_tickets, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'SLA Terlampaui', value: summary.sla_breached, icon: Clock, color: 'text-red-600', bg: 'bg-red-500/10' },
          { label: 'Selesai', value: summary.resolved_tickets, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
          { label: 'Avg Resolusi (jam)', value: summary.avg_resolution_hours, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tiket per Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium">{statusLabels[status] ?? status}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tiket per Prioritas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium capitalize">{priority}</span>
                <Badge
                  variant={priority === 'urgent' ? 'destructive' : priority === 'normal' ? 'default' : 'secondary'}
                >
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly trends */}
      {Object.keys(weekly).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tren Mingguan (7 hari terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {Object.entries(weekly).map(([date, count]) => {
                const maxVal = Math.max(...Object.values(weekly));
                const pct = maxVal > 0 ? ((count as number) / maxVal) * 100 : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{count as number}</span>
                    <div
                      className="w-full rounded-t-sm bg-blue-500/60 transition-all"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(date).toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
