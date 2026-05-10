'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard, Ticket, PlusCircle, Settings,
  Users, BarChart3, LogOut, ChevronLeft, Shield,
  Zap,
} from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard',  href: '/dashboard',      icon: LayoutDashboard, roles: ['admin','agent','user'] },
  { title: 'Tiket Saya', href: '/tickets',        icon: Ticket,          roles: ['admin','agent','user'] },
  { title: 'Buat Tiket', href: '/tickets/create', icon: PlusCircle,      roles: ['admin','agent','user'] },
  { title: 'Laporan',    href: '/reports',        icon: BarChart3,       roles: ['admin','agent'] },
  { title: 'Pengguna',   href: '/users',          icon: Users,           roles: ['admin'] },
  { title: 'Pengaturan', href: '/settings',       icon: Settings,        roles: ['admin'] },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isAgent } = useAuth();
  const userRole = isAdmin ? 'admin' : isAgent ? 'agent' : 'user';
  const menuItems = allMenuItems.filter((i) => i.roles.includes(userRole));

  const handleLogout = async () => { await logout(); router.push('/login'); };
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  
  const roleStyles: Record<string, string> = { 
    admin: 'bg-violet-500/10 text-violet-400 border-violet-500/20', 
    agent: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20', 
    user: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' 
  };

  return (
    <>
      {isOpen && (<div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden" onClick={onClose} />)}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-surface-1 border-r border-hairline flex flex-col transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static md:z-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-20 items-center justify-between px-6 border-b border-hairline">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-accent-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,153,255,0.4)]">
              <Zap className="h-5 w-5 text-white fill-white/20" />
            </div>
            <span className="text-[20px] font-display font-bold tracking-tighter text-ink">HelpDesk</span>
          </Link>
          <button className="md:hidden h-8 w-8 text-ink-muted hover:text-ink transition-colors" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-hide">
          <div className="px-4 mb-4">
            <span className="micro font-bold text-ink-muted/50 uppercase tracking-[0.2em]">Menu Utama</span>
          </div>
          {menuItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn('group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-all duration-200 relative',
                  isActive 
                    ? 'bg-surface-2 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-hairline-soft' 
                    : 'text-ink-muted hover:bg-surface-2/40 hover:text-ink'
                )}>
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-accent-blue" : "text-ink-muted")} /> 
                {item.title}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-blue rounded-r-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-hairline space-y-4">
          {user && (
            <div className="p-3 rounded-xl bg-surface-2/40 border border-hairline-soft group">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-colors", roleStyles[userRole])}>
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-ink truncate group-hover:text-accent-blue transition-colors">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("micro px-1.5 py-0.5 rounded-[4px] font-bold uppercase tracking-tighter border", roleStyles[userRole])}>
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button 
            className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-ink-muted hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all duration-200 font-medium text-[13px]" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}