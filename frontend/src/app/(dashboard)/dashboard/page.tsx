'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
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
import type { Priority } from '@/types/ticket';

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
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40 bg-surface-2" />
          <Skeleton className="h-9 w-32 bg-surface-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-pricing bg-surface-1">
              <div className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24 bg-surface-2" />
                <Skeleton className="h-8 w-8 rounded-full bg-surface-2" />
              </div>
              <Skeleton className="h-8 w-16 mb-1 bg-surface-2 mt-2" />
              <Skeleton className="h-3 w-28 bg-surface-2" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-surface-1 rounded-xl" />
          <Skeleton className="h-64 bg-surface-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4 spotlight-card bg-surface-1 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="headline text-ink">Gagal Memuat Dashboard</h2>
            <p className="body text-ink-muted mt-1">Silakan coba lagi nanti</p>
          </div>
          <button className="btn-secondary mt-4" onClick={() => window.location.reload()}>Muat Ulang</button>
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
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/10',
      change: 'Semua tiket',
    },
    {
      title: 'Tiket Terbuka',
      value: summary.open_tickets,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      change: 'Menunggu penanganan',
    },
    {
      title: 'Sedang Ditangani',
      value: summary.in_progress_tickets,
      icon: ClockIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      change: 'Dalam proses',
    },
    {
      title: 'Selesai',
      value: summary.resolved_tickets,
      icon: CheckCircle2,
      color: 'text-semantic-success',
      bg: 'bg-semantic-success/10',
      change: 'Berhasil diselesaikan',
    },
  ];

  const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-500/10' },
    normal: { label: 'Normal', color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    low: { label: 'Rendah', color: 'text-ink-muted', bg: 'bg-surface-2' },
  };

  return (
    <div className="space-y-12 max-w-[1200px] mx-auto pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-md text-ink">Dashboard</h1>
          <p className="body-lg text-ink-muted mt-2">Ringkasan sistem helpdesk</p>
        </div>
        <Link href="/tickets/create" className="btn-primary gap-2">
          <PlusCircle className="h-4 w-4" />
          Buat Tiket
        </Link>
      </div>

      {/* SLA Breached Alert */}
      {summary.sla_breached > 0 && (
        <div className="flex items-center gap-4 p-5 rounded-xl border-l-[3px] border-l-red-500 bg-surface-1 shadow-md">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="body-sm font-semibold text-red-400">Pelanggaran SLA Terdeteksi</p>
            <p className="micro text-red-400/80 mt-0.5">
              {summary.sla_breached} tiket telah melewati batas waktu SLA
            </p>
          </div>
          <Link href="/tickets?status=open" className="btn-secondary h-8 px-3 text-[13px]">
            Lihat Tiket
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={i === 0 ? "card-pricing-featured" : "card-pricing"}>
              <div className="flex flex-row items-center justify-between pb-4">
                <h3 className="body-sm text-ink-muted">
                  {stat.title}
                </h3>
                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className="text-[40px] font-display leading-[1] tracking-[-1px] text-ink">{stat.value}</div>
                <p className="micro text-ink-muted mt-3">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets - takes up 2 columns */}
        <div className="card-pricing lg:col-span-2">
          <div className="flex flex-row items-center justify-between mb-6">
            <h2 className="headline text-ink">Tiket Terbaru</h2>
            <Link href="/tickets" className="text-[13px] font-medium text-accent-blue hover:text-accent-blue/80 flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recent_tickets?.length ? (
              recent_tickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface-1 hover:bg-surface-2 transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="body-sm text-ink truncate group-hover:text-accent-blue transition-colors">
                        {ticket.title}
                      </p>
                      <p className="micro text-ink-muted mt-1.5 flex items-center gap-2">
                        <span className="bg-surface-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{ticket.ticket_number}</span>
                        <span>{ticket.user?.name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="body text-ink-muted text-center py-10">
                Belum ada tiket
              </p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="spotlight-violet flex flex-col justify-between h-full">
          <div>
            <h2 className="headline text-ink mb-8">Distribusi Prioritas</h2>
            <div className="space-y-6">
              {['urgent', 'normal', 'low'].map((priority) => {
                const count = tickets_by_priority?.[priority] ?? 0;
                const total = summary.total_tickets || 1;
                const pct = Math.round((count / total) * 100);
                
                const getLabel = (p: string) => p === 'urgent' ? 'Urgent' : p === 'normal' ? 'Normal' : 'Rendah';
                
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center justify-between text-[13px] font-medium text-ink">
                      <span>{getLabel(priority)}</span>
                      <span className="opacity-80">{count} tiket ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avg resolution */}
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="micro text-white/80 uppercase tracking-wider mb-1">Avg Resolusi</p>
              <p className="display-md text-white tracking-[-1px]">
                {summary.avg_resolution_hours}<span className="text-[20px] ml-1">jam</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; class: string }> = {
    urgent: { label: 'Urgent', class: 'bg-red-500/20 text-red-400' },
    normal: { label: 'Normal', class: 'bg-accent-blue/20 text-accent-blue' },
    low: { label: 'Rendah', class: 'bg-surface-2 text-ink-muted' },
  };
  const cfg = map[priority] ?? map.low;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}