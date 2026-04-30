'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Ticket, Priority, Status } from '@/types/ticket';

interface TicketTableProps {
  tickets: Ticket[];
  currentPage?: number;
  lastPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

const priorityConfig: Record<Priority, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  urgent: { label: 'Urgent', variant: 'destructive' },
  normal: { label: 'Normal', variant: 'default' },
  low:    { label: 'Rendah', variant: 'secondary' },
};

const statusConfig: Record<Status, { label: string; class: string }> = {
  open:        { label: 'Terbuka', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  in_progress: { label: 'Ditangani', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  resolved:    { label: 'Selesai', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  closed:      { label: 'Ditutup', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
};

export function TicketTable({
  tickets,
  currentPage = 1,
  lastPage = 1,
  total = 0,
  onPageChange,
}: TicketTableProps) {
  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium">Tidak ada tiket ditemukan</p>
        <p className="text-sm text-muted-foreground mt-1">
          Coba ubah filter atau{' '}
          <Link href="/tickets/create" className="text-primary underline-offset-4 hover:underline">
            buat tiket baru
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[140px]">Nomor Tiket</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead className="w-[100px]">Prioritas</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[120px]">Dibuat oleh</TableHead>
              <TableHead className="hidden lg:table-cell w-[160px]">SLA</TableHead>
              <TableHead className="hidden md:table-cell w-[110px]">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const pCfg = priorityConfig[ticket.priority] ?? priorityConfig.low;
              const sCfg = statusConfig[ticket.status] ?? statusConfig.open;

              return (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <TableCell>
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">
                          {ticket.ticket_number}
                        </span>
                        {ticket.sla_breached && (
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="max-w-[200px] md:max-w-none">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <p className="font-medium truncate hover:text-primary transition-colors">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {ticket.description}
                      </p>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Badge variant={pCfg.variant} className="text-xs">
                      {pCfg.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${sCfg.class}`}>
                      {sCfg.label}
                    </span>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {ticket.user?.name ?? '—'}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {ticket.sla_status ? (
                      <span className={`text-xs font-medium ${ticket.sla_breached ? 'text-red-600' : 'text-green-600'}`}>
                        {ticket.sla_status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total <span className="font-medium">{total}</span> tiket
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {currentPage} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
