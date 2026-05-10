'use client';

import { useTicket, useUpdateTicket } from '@/hooks/use-tickets';
import { useAuth } from '@/hooks/use-auth';
import { TicketChat } from '@/components/tickets/ticket-chat';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import type { Status } from '@/types/ticket';
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2,
  User2, Calendar, Trash2, UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';

interface Agent { id: number; name: string; email: string; }

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading, error } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const { toast } = useToast();
  const { user, isAdmin, isAgent } = useAuth();
  const [assignTo, setAssignTo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => { const { data } = await api.get<{ data: Agent[] }>('/agents'); return data.data; },
    enabled: isAdmin,
  });

  const ticket = data?.data;

  const canUpdateStatus = isAdmin || (isAgent && ticket?.assigned_to === user?.id);
  const canAssign = isAdmin;
  const canDelete = isAdmin;

  const handleStatusUpdate = async (newStatus: Status) => {
    try {
      await updateTicket.mutateAsync({ id: ticket!.id, status: newStatus });
      toast({ title: 'Berhasil', description: 'Status tiket diperbarui' });
    } catch {
      toast({ title: 'Gagal', description: 'Tidak bisa mengubah status tiket', variant: 'destructive' });
    }
  };

  const handleAssign = async () => {
    if (!assignTo) return;
    try {
      await api.patch(`/tickets/${ticket!.id}/assign`, { assigned_to: Number(assignTo) });
      toast({ title: 'Berhasil', description: 'Tiket berhasil di-assign' });
      window.location.reload();
    } catch {
      toast({ title: 'Gagal', description: 'Tidak bisa assign tiket', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus tiket ini?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tickets/${ticket!.id}`);
      toast({ title: 'Berhasil', description: 'Tiket dihapus' });
      router.push('/tickets');
    } catch {
      toast({ title: 'Gagal', description: 'Tidak bisa menghapus tiket', variant: 'destructive' });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-10 w-32 bg-surface-1" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full bg-surface-1 rounded-xl" />
            <Skeleton className="h-96 w-full bg-surface-1 rounded-xl" />
          </div>
          <Skeleton className="h-[500px] w-full bg-surface-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center card-pricing max-w-sm">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="headline text-ink mb-2">Error</h2>
          <p className="body text-ink-muted">Tiket tidak ditemukan atau akses ditolak</p>
          <Link href="/tickets" className="mt-6 inline-block">
            <button className="btn-secondary px-6">Kembali</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <Link href="/tickets">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="micro font-bold uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded text-ink-muted">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="headline text-[28px] text-ink">{ticket.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {canDelete && (
            <button 
              className="flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 rounded-pill text-[13px] font-medium transition-colors" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-pricing bg-surface-1 border border-hairline">
            <h2 className="caption font-bold text-ink-muted uppercase tracking-widest mb-4">Deskripsi</h2>
            <div className="body text-ink leading-relaxed whitespace-pre-wrap">{ticket.description}</div>
          </div>

          {/* Real-time Chat Section */}
          <div className="card-pricing bg-canvas border border-hairline p-0 overflow-hidden">
             <TicketChat ticketId={id} />
          </div>

          <div className="card-pricing bg-surface-1 border border-hairline">
            <h2 className="caption font-bold text-ink-muted uppercase tracking-widest mb-6">Log Aktivitas</h2>
            {ticket.logs && ticket.logs.length > 0 ? (
              <div className="space-y-6">
                {ticket.logs.map((log, idx) => (
                  <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-accent-blue mt-2 shadow-[0_0_8px_rgba(0,153,255,0.5)]" />
                      {idx !== ticket.logs!.length - 1 && <div className="w-px flex-1 bg-hairline-soft mt-2" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="body-sm font-bold text-ink">{log.user?.name}</span>
                        <span className="micro px-2 py-0.5 rounded bg-surface-2 text-ink-muted border border-hairline-soft uppercase tracking-tighter">{log.action}</span>
                      </div>
                      <p className="body-sm text-ink-muted mt-1">{log.description}</p>
                      <p className="micro text-ink-muted/50 mt-1">{new Date(log.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="body-sm text-ink-muted italic">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          {canUpdateStatus && (
            <div className="card-pricing border border-hairline">
              <h2 className="caption font-bold text-ink-muted uppercase tracking-widest mb-4">Ubah Status</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['open', 'in_progress', 'resolved', 'closed'] as Status[]).map((s) => (
                  <button 
                    key={s} 
                    className={`text-[12px] font-medium px-2 py-2 rounded-md transition-all border ${
                      ticket.status === s 
                      ? 'bg-accent-blue text-white border-accent-blue shadow-[0_0_15px_rgba(0,153,255,0.3)]' 
                      : 'bg-surface-2 text-ink-muted border-hairline hover:border-accent-blue/50'
                    }`}
                    onClick={() => handleStatusUpdate(s)} 
                    disabled={updateTicket.isPending}
                  >
                    {s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : s === 'resolved' ? 'Resolved' : 'Closed'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assign */}
          {canAssign && (
            <div className="card-pricing border border-hairline">
              <h2 className="caption font-bold text-ink-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5" /> Assign Tiket
              </h2>
              <div className="space-y-4">
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-hairline-soft">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-xs">
                      {ticket.assignedTo.name.charAt(0)}
                    </div>
                    <div>
                      <p className="micro text-ink-muted">Assignee Saat Ini</p>
                      <p className="body-sm font-bold text-ink">{ticket.assignedTo.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="body-sm text-rose-400 italic bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">Belum di-assign ke agent</p>
                )}
                <div className="flex flex-col gap-2">
                  <select 
                    value={assignTo} 
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="w-full input-framer appearance-none text-[13px]"
                  >
                    <option value="">-- Pilih Agent --</option>
                    {(agentsData ?? []).map((agent: Agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <button className="btn-primary w-full h-9 text-[13px]" onClick={handleAssign} disabled={!assignTo}>
                    Assign Agent
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="card-pricing border border-hairline space-y-5">
            <h2 className="caption font-bold text-ink-muted uppercase tracking-widest">Detail Informasi</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
                  <User2 className="h-4 w-4 text-ink-muted" />
                </div>
                <div>
                  <p className="micro text-ink-muted">Pelapor</p>
                  <p className="body-sm font-bold text-ink">{ticket.user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-ink-muted" />
                </div>
                <div>
                  <p className="micro text-ink-muted">Dibuat Pada</p>
                  <p className="body-sm font-bold text-ink">{new Date(ticket.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-ink-muted" />
                </div>
                <div>
                  <p className="micro text-ink-muted">Deadline SLA</p>
                  <p className={`body-sm font-bold ${ticket.sla_breached ? 'text-rose-500' : 'text-ink'}`}>
                    {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString('id-ID') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.sla_breached ? 'bg-rose-500/10' : 'bg-semantic-success/10'}`}>
                  {ticket.sla_breached
                    ? <AlertTriangle className="h-4 w-4 text-rose-500" />
                    : <CheckCircle2 className="h-4 w-4 text-semantic-success" />}
                </div>
                <div>
                  <p className="micro text-ink-muted">SLA Status</p>
                  <p className={`body-sm font-bold ${ticket.sla_breached ? 'text-rose-500' : 'text-semantic-success'}`}>
                    {ticket.sla_status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    normal: 'bg-accent-blue/20 text-accent-blue border-accent-blue/20',
    low: 'bg-surface-2 text-ink-muted border-hairline',
  };
  return (
    <span className={`micro font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[priority] || styles.low}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    resolved: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20',
    closed: 'bg-surface-2 text-ink-muted border-hairline-soft',
  };
  return (
    <span className={`micro font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status] || styles.closed}`}>
      {status.replace('_', ' ')}
    </span>
  );
}