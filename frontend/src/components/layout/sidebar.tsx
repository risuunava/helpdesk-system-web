'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Semua Tiket', href: '/tickets', icon: Ticket },
  { title: 'Buat Tiket', href: '/tickets/create', icon: PlusCircle },
  { title: 'Laporan', href: '/reports', icon: BarChart3 },
  { title: 'Pengguna', href: '/users', icon: Users },
  { title: 'Pengaturan', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg tracking-tight">HelpDesk</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User info */}
        <div className="border-t border-border p-3 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Keluar</span>
          </Button>
        </div>
      </aside>
    </>
  );
}