'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { User, Bell, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="display-md text-ink">Pengaturan</h1>
        <p className="body-lg text-ink-muted mt-2">Kelola preferensi akun dan sistem Anda</p>
      </div>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="card-pricing border border-hairline">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
              <User className="h-5 w-5 text-accent-blue" />
            </div>
            <div>
              <h2 className="headline text-ink">Profil Saya</h2>
              <p className="micro text-ink-muted mt-1 uppercase tracking-widest font-bold">Informasi Akun</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="caption text-ink-muted">Nama Lengkap</label>
              <input 
                defaultValue={user?.name ?? ''} 
                disabled 
                className="w-full input-framer opacity-70 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="caption text-ink-muted">Alamat Email</label>
              <input 
                defaultValue={user?.email ?? ''} 
                disabled 
                className="w-full input-framer opacity-70 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="caption text-ink-muted">Hak Akses / Role</label>
              <div className="flex gap-2">
                {user?.roles?.map((r) => (
                  <span key={r} className="micro font-bold uppercase tracking-wider px-3 py-1 rounded-pill bg-surface-2 text-ink border border-hairline-soft">
                    {r}
                  </span>
                )) ?? <span className="micro font-bold uppercase tracking-wider px-3 py-1 rounded-pill bg-surface-2 text-ink border border-hairline-soft">user</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-pricing border border-hairline">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="headline text-ink">Notifikasi</h2>
              <p className="micro text-ink-muted mt-1 uppercase tracking-widest font-bold">Preferensi Pesan</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-1 border border-hairline-soft">
            <div>
              <p className="body-sm font-bold text-ink">Pemberitahuan Tiket</p>
              <p className="micro text-ink-muted mt-1">Terima notifikasi real-time saat tiket diperbarui atau ada komentar baru.</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                "h-6 w-11 rounded-full p-1 transition-colors",
                notifications ? "bg-accent-blue" : "bg-surface-2"
              )}
            >
              <div className={cn(
                "h-4 w-4 rounded-full bg-white transition-transform",
                notifications ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>

        {/* System info */}
        <div className="card-pricing border border-hairline">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <Info className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h2 className="headline text-ink">Informasi Sistem</h2>
              <p className="micro text-ink-muted mt-1 uppercase tracking-widest font-bold">Detail Teknis</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Versi Aplikasi', value: '1.2.4-stable' },
              { label: 'Backend Engine', value: 'Laravel 12 / PHP 8.4' },
              { label: 'Frontend Framework', value: 'Next.js 15 / React 19' },
              { label: 'Database Service', value: 'PostgreSQL (Supabase)' },
              { label: 'Pusher / Reverb', value: 'Laravel Reverb (Real-time)' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-hairline-soft last:border-0">
                <span className="body-sm text-ink-muted">{item.label}</span>
                <span className="micro font-bold text-ink bg-surface-2 px-2 py-0.5 rounded border border-hairline-soft">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function inside the same file for simplicity since cn is used
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
