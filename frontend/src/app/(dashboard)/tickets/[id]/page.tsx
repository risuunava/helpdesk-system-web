'use client';

import { useTicket, useUpdateTicket } from '@/hooks/use-tickets';
import { useAuth } from '@/hooks/use-auth';
import { TicketChat } from '@/components/tickets/ticket-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

  // Fetch agents list for assign dropdown (admin only)
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => { const { data } = await api.get<{ data: Agent[] }>('/agents'); return data.data; },
    enabled: isAdmin,
  });

  const ticket = data?.data;

  // Permission checks
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">Tiket tidak ditemukan atau akses ditolak</p>
          <Link href="/tickets" className="mt-4 inline-block">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{ticket.ticket_number}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
        </div>
        {canDelete && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-1" /> Hapus
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Left: Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Deskripsi</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Real-time Chat Section */}
          <TicketChat ticketId={id} />

          <Card>
            <CardHeader><CardTitle className="text-lg">Log Aktivitas</CardTitle></CardHeader>
            <CardContent>
              {ticket.logs && ticket.logs.length > 0 ? (
                <div className="space-y-4">
                  {ticket.logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="w-px flex-1 bg-border mt-1" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.user?.name}</span>
                          <Badge variant="outline" className="text-xs">{log.action}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Status Actions — only for admin & assigned agent */}
          {canUpdateStatus && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Ubah Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as Status[]).map((s) => (
                    <Button key={s} variant={ticket.status === s ? 'default' : 'outline'} size="sm"
                      onClick={() => handleStatusUpdate(s)} disabled={updateTicket.isPending}>
                      {s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : s === 'resolved' ? 'Resolved' : 'Closed'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assign — admin only */}
          {canAssign && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Assign Tiket
              </CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {ticket.assignedTo ? (
                  <p className="text-sm text-muted-foreground">
                    Saat ini: <strong className="text-foreground">{ticket.assignedTo.name}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum di-assign ke agent</p>
                )}
                <div className="flex gap-2">
                  <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">-- Pilih Agent --</option>
                    {(agentsData ?? []).map((agent: Agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAssign} disabled={!assignTo}>Assign</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Detail</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Dibuat oleh</p>
                  <p className="font-medium text-sm">{ticket.user?.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="font-medium text-sm">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">SLA Deadline</p>
                  <p className={`font-medium text-sm ${ticket.sla_breached ? 'text-red-600' : ''}`}>
                    {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                {ticket.sla_breached
                  ? <AlertTriangle className="h-4 w-4 text-red-600" />
                  : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                <div>
                  <p className="text-xs text-muted-foreground">SLA Status</p>
                  <p className={`font-medium text-sm ${ticket.sla_breached ? 'text-red-600' : 'text-green-600'}`}>
                    {ticket.sla_status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const v: Record<string, 'default'|'destructive'|'outline'|'secondary'> = {
    urgent: 'destructive', normal: 'default', low: 'secondary',
  };
  return <Badge variant={v[priority] || 'secondary'} className="text-xs">{priority}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const v: Record<string, 'default'|'destructive'|'outline'|'secondary'> = {
    open: 'secondary', in_progress: 'default', resolved: 'outline', closed: 'outline',
  };
  return <Badge variant={v[status] || 'secondary'} className="text-xs">{status.replace('_', ' ')}</Badge>;
}