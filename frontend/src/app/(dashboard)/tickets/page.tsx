'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/use-tickets';
import { TicketTable } from '@/components/tickets/ticket-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus, Search, AlertTriangle, Filter } from 'lucide-react';

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

  // Reset to page 1 when filters change
  const handleFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tiket</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua tiket dukungan IT
          </p>
        </div>
        <Link href="/tickets/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Tiket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari tiket berdasarkan judul, deskripsi, atau nomor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => handleFilter(setStatusFilter)(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Filter aktif:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">
                &quot;{search}&quot;
                <button onClick={() => setSearch('')} className="hover:opacity-70">×</button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">
                {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:opacity-70">×</button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">
                {priorityFilter}
                <button onClick={() => setPriorityFilter('')} className="hover:opacity-70">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Reset semua
            </button>
          </div>
        )}
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Gagal Memuat Tiket</h3>
          <p className="text-sm text-muted-foreground">Pastikan backend berjalan di port 8000</p>
        </Card>
      )}

      {/* Ticket Table */}
      {!isLoading && !error && (
        <Card className="p-0 overflow-hidden">
          <TicketTable
            tickets={tickets}
            currentPage={meta?.current_page ?? 1}
            lastPage={meta?.last_page ?? 1}
            total={meta?.total ?? tickets.length}
            onPageChange={setPage}
          />
        </Card>
      )}
    </div>
  );
}