'use client';

import { useState, useEffect } from 'react';
import { Bell, Ticket, MessageSquare, AlertCircle, CheckCircle2, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

interface AppNotification {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications.data);
        setUnreadCount(response.data.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'ticket': return <Ticket className="h-5 w-5 text-accent-blue" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-semantic-success" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-violet-400" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'system': return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-ink-muted" />;
    }
  };

  const getBgColor = (type?: string, isRead?: boolean) => {
    if (isRead) return 'bg-surface-2/30';
    switch (type) {
      case 'ticket': return 'bg-accent-blue/10';
      case 'success': return 'bg-semantic-success/10';
      case 'message': return 'bg-violet-500/10';
      case 'alert': return 'bg-rose-500/10';
      case 'system': return 'bg-amber-500/10';
      default: return 'bg-surface-2';
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="btn-icon">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="headline text-ink">Notifikasi</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="body-sm text-ink-muted">Aktivitas terbaru di akun Anda</p>
              {unreadCount > 0 && (
                <span className="micro font-bold bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-pill border border-accent-blue/20">
                  {unreadCount} Baru
                </span>
              )}
            </div>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary h-10 px-4 text-[13px]">
            Tandai semua dibaca
          </button>
        )}
      </div>

      <div className="card-pricing p-0 overflow-hidden border border-hairline min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <Loader2 className="h-10 w-10 text-accent-blue animate-spin mb-4" />
            <p className="body-sm text-ink-muted">Memuat notifikasi...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-6 opacity-40">
              <Bell className="h-10 w-10 text-ink-muted" />
            </div>
            <h3 className="headline text-ink">Semua beres!</h3>
            <p className="body-sm text-ink-muted mt-2 max-w-sm mx-auto">
              Belum ada notifikasi baru untuk Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {notifications.map((notification) => {
              const isRead = notification.read_at !== null;
              const data = notification.data || {};
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-6 transition-all duration-300 hover:bg-surface-2/30 group relative",
                    !isRead ? "bg-accent-blue/5" : "bg-canvas"
                  )}
                  onClick={() => !isRead && markAsRead(notification.id)}
                >
                  {!isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue shadow-[2px_0_10px_rgba(0,153,255,0.3)]" />
                  )}
                  
                  <div className="flex gap-6 items-start">
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border border-hairline-soft transition-transform group-hover:scale-105",
                      getBgColor(data.type, isRead)
                    )}>
                      {getIcon(data.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                        <p className={cn(
                          "body-sm font-bold truncate",
                          isRead ? "text-ink-muted" : "text-ink"
                        )}>
                          {data.title || 'Notifikasi Baru'}
                        </p>
                        <span className="micro font-bold text-ink-muted/50 uppercase tracking-tighter">
                          {new Date(notification.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn(
                        "body-sm leading-relaxed",
                        isRead ? "text-ink-muted/70" : "text-ink/90"
                      )}>
                        {data.message || 'Anda memiliki pesan baru.'}
                      </p>
                      
                      <div className="pt-3 flex items-center gap-3">
                        {data.priority === 'critical' && (
                          <span className="micro font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">Kritis</span>
                        )}
                        {data.priority === 'high' && (
                          <span className="micro font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">Tinggi</span>
                        )}
                        
                        {!isRead && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="micro font-bold text-accent-blue hover:underline opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest"
                          >
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
