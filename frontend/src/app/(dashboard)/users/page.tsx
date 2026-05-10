'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  created_at?: string;
}

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });

  const getInitials = (name: string) => 
    name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-12 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="display-md text-ink">Pengguna</h1>
        <p className="body-lg text-ink-muted mt-2">Manajemen dan pengawasan pengguna sistem</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Pengguna', value: data?.data?.length, icon: Users, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'Administrator', value: data?.data?.filter((u: UserData) => u.roles?.includes('admin')).length, icon: Shield, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Support Agents', value: data?.data?.filter((u: UserData) => u.roles?.includes('agent')).length, icon: UserCheck, color: 'text-semantic-success', bg: 'bg-semantic-success/10' },
        ].map((item, i) => (
          <div key={item.label} className={i === 0 ? "card-pricing-featured" : "card-pricing"}>
            <div className="flex flex-row items-center justify-between pb-4">
              <h3 className="caption font-bold text-ink-muted uppercase tracking-widest">{item.label}</h3>
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <div className="text-[36px] font-display text-ink leading-none tracking-tighter">
              {isLoading ? <Skeleton className="h-9 w-12 bg-white/20" /> : item.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="card-pricing p-0 overflow-hidden border border-hairline">
        <div className="py-6 px-8 border-b border-hairline">
          <h2 className="headline text-ink">Daftar Pengguna</h2>
        </div>
        <div className="px-8 pb-4">
          {isLoading ? (
            <div className="space-y-4 py-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-surface-1" />
              ))}
            </div>
          ) : data?.data?.length ? (
            <div className="divide-y divide-hairline">
              {data.data.map((user: UserData) => (
                <div key={user.id} className="flex items-center justify-between py-6 group transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-ink text-sm font-bold border border-hairline group-hover:border-accent-blue/50 transition-colors">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="body-sm font-bold text-ink group-hover:text-accent-blue transition-colors">{user.name}</p>
                      <p className="micro text-ink-muted mt-1">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.roles?.map((role: string) => (
                      <span 
                        key={role} 
                        className={`micro font-bold uppercase tracking-wider px-3 py-1 rounded-pill border ${
                          role === 'admin' 
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' 
                            : role === 'agent'
                              ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                              : 'bg-surface-2 text-ink-muted border-hairline-soft'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4 opacity-40">
                <Users className="h-6 w-6 text-ink-muted" />
              </div>
              <p className="body-sm text-ink-muted">Tidak ada data pengguna ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
