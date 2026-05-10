'use client';

import Link from 'next/link';
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

const priorityConfig: Record<Priority, { label: string; class: string }> = {
  urgent: { label: 'Urgent', class: 'bg-red-500/20 text-red-400' },
  normal: { label: 'Normal', class: 'bg-accent-blue/20 text-accent-blue' },
  low:    { label: 'Rendah', class: 'bg-surface-2 text-ink-muted' },
};

const statusConfig: Record<Status, { label: string; class: string }> = {
  open:        { label: 'Terbuka', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  in_progress: { label: 'Ditangani', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  resolved:    { label: 'Selesai', class: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' },
  closed:      { label: 'Ditutup', class: 'bg-surface-2 text-ink-muted border-transparent' },
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-ink-muted" />
        </div>
        <p className="headline text-ink mb-2">Tidak ada tiket ditemukan</p>
        <p className="body text-ink-muted">
          Coba ubah filter atau{' '}
          <Link href="/tickets/create" className="text-accent-blue underline-offset-4 hover:underline transition-colors">
            buat tiket baru
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden border border-hairline">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2/50 border-hairline hover:bg-surface-2/50">
              <TableHead className="w-[140px] text-ink-muted caption py-4 pl-6">Nomor Tiket</TableHead>
              <TableHead className="text-ink-muted caption py-4">Judul</TableHead>
              <TableHead className="w-[110px] text-ink-muted caption py-4">Prioritas</TableHead>
              <TableHead className="w-[130px] text-ink-muted caption py-4">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[140px] text-ink-muted caption py-4">Dibuat oleh</TableHead>
              <TableHead className="hidden lg:table-cell w-[160px] text-ink-muted caption py-4">SLA</TableHead>
              <TableHead className="hidden md:table-cell w-[120px] text-ink-muted caption py-4 pr-6">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const pCfg = priorityConfig[ticket.priority] ?? priorityConfig.low;
              const sCfg = statusConfig[ticket.status] ?? statusConfig.open;

              return (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-surface-2/30 cursor-pointer transition-colors border-hairline-soft"
                >
                  <TableCell className="pl-6 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <span className="bg-surface-2 px-2 py-1 rounded text-[11px] uppercase font-bold tracking-wider text-ink-muted">
                          {ticket.ticket_number}
                        </span>
                        {ticket.sla_breached && (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="max-w-[200px] md:max-w-none py-4">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <p className="body-sm text-ink truncate hover:text-accent-blue transition-colors">
                        {ticket.title}
                      </p>
                      <p className="micro text-ink-muted truncate mt-1">
                        {ticket.description}
                      </p>
                    </Link>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${pCfg.class}`}>
                      {pCfg.label}
                    </span>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[12px] font-medium ${sCfg.class}`}>
                      {sCfg.label}
                    </span>
                  </TableCell>

                  <TableCell className="hidden md:table-cell body-sm text-ink-muted py-4">
                    {ticket.user?.name ?? '—'}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell py-4">
                    {ticket.sla_status ? (
                      <span className={`micro font-medium ${ticket.sla_breached ? 'text-red-400' : 'text-semantic-success'}`}>
                        {ticket.sla_status}
                      </span>
                    ) : (
                      <span className="micro text-ink-muted">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden md:table-cell micro text-ink-muted py-4 pr-6">
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
        <div className="flex items-center justify-between pt-2">
          <p className="micro text-ink-muted">
            Total <span className="text-ink font-medium">{total}</span> tiket
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="btn-icon size-[32px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="body-sm text-ink px-2">
              {currentPage} / {lastPage}
            </span>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="btn-icon size-[32px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
