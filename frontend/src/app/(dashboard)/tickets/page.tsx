'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/use-tickets';
import { TicketTable } from '@/components/tickets/ticket-table';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus, Search, AlertTriangle, Filter, X } from 'lucide-react';

export default function TicketsPage() {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage]                   = useState(1);

  const { data, isLoading, error } = useTickets({
    search:   search || undefined,
    status:   statusFilter || undefined,
    priority: priorityFilter || undefined,
    page,
    per_page: 10,
  });

  const tickets = data?.data ?? [];
  const meta    = data?.meta;

  const handleFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-md text-ink">Tiket</h1>
          <p className="body-lg text-ink-muted mt-2">
            Kelola semua tiket dukungan IT
          </p>
        </div>
        <Link href="/tickets/create" className="btn-primary gap-2 h-11">
          <Plus className="h-4 w-4" />
          Buat Tiket
        </Link>
      </div>

      {/* Filters */}
      <div className="card-pricing">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              placeholder="Cari tiket berdasarkan judul, deskripsi, atau nomor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full input-framer pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-2 flex items-center justify-center shrink-0">
              <Filter className="h-4 w-4 text-ink-muted" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
              className="input-framer w-[150px] appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="open">Terbuka</option>
              <option value="in_progress">Ditangani</option>
              <option value="resolved">Selesai</option>
              <option value="closed">Ditutup</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => handleFilter(setPriorityFilter)(e.target.value)}
              className="input-framer w-[160px] appearance-none"
            >
              <option value="">Semua Prioritas</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
              <option value="low">Rendah</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {(statusFilter || priorityFilter || search) && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="micro text-ink-muted mr-1 uppercase tracking-wider font-bold">Filter aktif:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-accent-blue/10 text-accent-blue text-[12px] font-medium px-2 py-1">
                &quot;{search}&quot;
                <button onClick={() => setSearch('')} className="hover:text-ink transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-accent-blue/10 text-accent-blue text-[12px] font-medium px-2 py-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:text-ink transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-accent-blue/10 text-accent-blue text-[12px] font-medium px-2 py-1">
                Prioritas: {priorityFilter}
                <button onClick={() => setPriorityFilter('')} className="hover:text-ink transition-colors"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }}
              className="text-[12px] text-ink-muted hover:text-ink underline underline-offset-2 transition-colors ml-2"
            >
              Reset semua
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-surface-1" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="card-pricing flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="headline text-ink mb-1">Gagal Memuat Tiket</h3>
          <p className="body text-ink-muted">Pastikan backend berjalan dan koneksi stabil</p>
        </div>
      )}

      {/* Ticket Table */}
      {!isLoading && !error && (
        <div className="card-pricing p-0 overflow-hidden">
          <TicketTable
            tickets={tickets}
            currentPage={meta?.current_page ?? 1}
            lastPage={meta?.last_page ?? 1}
            total={meta?.total ?? tickets.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}