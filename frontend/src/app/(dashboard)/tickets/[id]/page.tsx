'use client';

import { useTicket, useUpdateTicket } from '../../../../hooks/use-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Separator } from '../../../../components/ui/separator';
import { useToast } from '../../../../hooks/use-toast';
import type { Status } from '@/types/ticket';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const { toast } = useToast();

  const ticket = data?.data;

  const handleStatusUpdate = async (newStatus: Status) => {
    try {
      await updateTicket.mutateAsync({ id: ticket!.id, status: newStatus });
      toast({
        title: 'Success',
        description: 'Ticket status updated',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update ticket',
        variant: 'destructive',
      });
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Ticket</h2>
          <p className="text-muted-foreground">Ticket not found or error occurred</p>
          <Link href="/tickets" className="mt-4 inline-block">
            <Button variant="outline">Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
        </div>
      </div>

      {/* Ticket Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Timeline / Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
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
                          <span className="font-medium text-sm">
                            {log.user?.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={ticket.status === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('open')}
                  disabled={updateTicket.isPending}
                >
                  Open
                </Button>
                <Button
                  variant={ticket.status === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updateTicket.isPending}
                >
                  In Progress
                </Button>
                <Button
                  variant={ticket.status === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={updateTicket.isPending}
                >
                  Resolve
                </Button>
                <Button
                  variant={ticket.status === 'closed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('closed')}
                  disabled={updateTicket.isPending}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="font-medium text-sm">{ticket.user?.name}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-sm">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">SLA Deadline</p>
                  <p className={`font-medium text-sm ${
                    ticket.sla_breached ? 'text-red-600' : ''
                  }`}>
                    {ticket.sla_due_at
                      ? new Date(ticket.sla_due_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                {ticket.sla_breached ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">SLA Status</p>
                  <p className={`font-medium text-sm ${
                    ticket.sla_breached ? 'text-red-600' : 'text-green-600'
                  }`}>
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
  const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    urgent: 'destructive',
    normal: 'default',
    low: 'secondary',
  };

  return (
    <Badge variant={variants[priority] || 'secondary'} className="text-xs">
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    open: 'secondary',
    in_progress: 'default',
    resolved: 'outline',
    closed: 'outline',
  };

  return (
    <Badge variant={variants[status] || 'secondary'} className="text-xs">
      {status.replace('_', ' ')}
    </Badge>
  );
}