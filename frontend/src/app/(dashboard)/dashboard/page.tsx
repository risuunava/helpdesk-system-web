'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  TicketIcon,
  ClockIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import type { Priority, Status } from '@/types/ticket';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Gagal Memuat Dashboard</h2>
            <p className="text-muted-foreground mt-1">Silakan coba lagi nanti</p>
          </div>
          <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
        </div>
      </div>
    );
  }

  const { summary, recent_tickets, tickets_by_priority } = data.data;

  const statsCards = [
    {
      title: 'Total Tiket',
      value: summary.total_tickets,
      icon: TicketIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      change: 'Semua tiket',
    },
    {
      title: 'Tiket Terbuka',
      value: summary.open_tickets,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      change: 'Menunggu penanganan',
    },
    {
      title: 'Sedang Ditangani',
      value: summary.in_progress_tickets,
      icon: ClockIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      change: 'Dalam proses',
    },
    {
      title: 'Selesai',
      value: summary.resolved_tickets,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      change: 'Berhasil diselesaikan',
    },
  ];

  const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    urgent: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-500/10' },
    normal: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    low: { label: 'Rendah', color: 'text-slate-600', bg: 'bg-slate-500/10' },
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan sistem helpdesk</p>
        </div>
        <Link href="/tickets/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Buat Tiket
          </Button>
        </Link>
      </div>

      {/* SLA Breached Alert */}
      {summary.sla_breached > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-600">Pelanggaran SLA Terdeteksi</p>
            <p className="text-sm text-red-600/80">
              {summary.sla_breached} tiket telah melewati batas waktu SLA
            </p>
          </div>
          <Link href="/tickets?status=open">
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-500/10">
              Lihat Tiket
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tiket Terbaru</CardTitle>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_tickets?.length ? (
              recent_tickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ticket.ticket_number} • {ticket.user?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada tiket
              </p>
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Prioritas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['urgent', 'normal', 'low'].map((priority) => {
              const count = tickets_by_priority?.[priority] ?? 0;
              const total = summary.total_tickets || 1;
              const pct = Math.round((count / total) * 100);
              const cfg = priorityConfig[priority];
              return (
                <div key={priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-muted-foreground">{count} tiket ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg.bg.replace('/10', '/60')} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Avg resolution */}
            <div className="pt-2 mt-2 border-t flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rata-rata Waktu Resolusi</p>
                <p className="font-semibold text-sm">
                  {summary.avg_resolution_hours} jam
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; class: string }> = {
    urgent: { label: 'Urgent', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
    normal: { label: 'Normal', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    low: { label: 'Rendah', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  };
  const cfg = map[priority] ?? map.low;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}