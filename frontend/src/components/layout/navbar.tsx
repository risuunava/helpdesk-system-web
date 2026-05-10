'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => {
          if (res.data.success) {
            setUnreadCount(res.data.data.unread_count);
          }
        })
        .catch(err => console.error('Failed to fetch unread count', err));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-hairline bg-canvas/80 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/60">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Mobile menu toggle */}
        <button 
          className="md:hidden p-2 rounded-lg bg-surface-2 text-ink hover:bg-surface-2/80 transition-colors" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Placeholder */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-surface-2/50 border border-hairline-soft w-64 text-ink-muted hover:border-accent-blue/30 transition-all cursor-pointer group">
          <Search className="h-4 w-4 group-hover:text-accent-blue transition-colors" />
          <span className="text-[13px] font-medium">Cari tiket atau agen...</span>
        </div>

        <div className="flex-1" />

        {/* Notifications */}
        <button 
          className="relative p-2.5 rounded-full bg-surface-2/50 text-ink-muted hover:text-ink hover:bg-surface-2 transition-all border border-hairline-soft"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent-blue text-[9px] font-bold text-white ring-2 ring-canvas animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full bg-surface-2/50 border border-hairline-soft hover:bg-surface-2 transition-all group">
              <div className="h-8 w-8 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-bold group-hover:scale-105 transition-transform">
                {user ? getInitials(user.name) : <User className="h-4 w-4" />}
              </div>
              <span className="hidden sm:inline text-[13px] font-bold text-ink">{user?.name.split(' ')[0]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-surface-1 border border-hairline shadow-2xl rounded-xl mt-2">
            {user && (
              <div className="px-3 py-4 mb-2">
                <p className="text-[14px] font-bold text-ink leading-tight">{user.name}</p>
                <p className="text-[12px] text-ink-muted mt-1">{user.email}</p>
              </div>
            )}
            <DropdownMenuSeparator className="bg-hairline mb-2" />
            <DropdownMenuItem 
              onClick={() => router.push('/settings')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Pengaturan Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-hairline my-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer"
            >
              <span className="text-sm font-bold">Keluar Aplikasi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}