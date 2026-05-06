'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Ticket, MessageSquare, AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Interface for Laravel Notification
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
      if (response.data.status === 'success') {
        // Handle pagination data format (response.data.data.notifications.data)
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
      // Update local state optimistic UI
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update local state optimistic UI
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'ticket': return <Ticket className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'system': return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const getBgColor = (type?: string, isRead?: boolean) => {
    if (isRead) return 'bg-muted/30';
    switch (type) {
      case 'ticket': return 'bg-blue-500/10 dark:bg-blue-500/20';
      case 'success': return 'bg-emerald-500/10 dark:bg-emerald-500/20';
      case 'message': return 'bg-indigo-500/10 dark:bg-indigo-500/20';
      case 'alert': return 'bg-rose-500/10 dark:bg-rose-500/20';
      case 'system': return 'bg-amber-500/10 dark:bg-amber-500/20';
      default: return 'bg-slate-500/10 dark:bg-slate-500/20';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
          <div className="text-muted-foreground mt-1 flex items-center gap-2">
            Tetap terbarui dengan aktivitas terbaru Anda
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {unreadCount} belum dibaca
              </Badge>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="shrink-0 group">
            <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden min-h-[400px]">
        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-semibold">Belum ada notifikasi</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                Saat Anda menerima pemberitahuan tentang tiket atau sistem, pemberitahuan tersebut akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const isRead = notification.read_at !== null;
                const data = notification.data || {};
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 sm:p-6 transition-all duration-200 hover:bg-accent/50 group cursor-default relative",
                      !isRead && "bg-muted/20"
                    )}
                    onClick={() => !isRead && markAsRead(notification.id)}
                  >
                    {!isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className="flex gap-4 sm:gap-6 items-start">
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        getBgColor(data.type, isRead)
                      )}>
                        {getIcon(data.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <p className={cn(
                            "text-base font-semibold truncate",
                            isRead ? "text-foreground/80" : "text-foreground"
                          )}>
                            {data.title || 'Notifikasi Baru'}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium flex items-center gap-1.5">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm line-clamp-2 md:line-clamp-none",
                          isRead ? "text-muted-foreground" : "text-foreground/90 font-medium"
                        )}>
                          {data.message || 'Anda memiliki pesan baru.'}
                        </p>
                        
                        <div className="pt-2 flex items-center gap-3">
                          {data.priority === 'critical' && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">Kritis</Badge>
                          )}
                          {data.priority === 'high' && (
                            <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200 dark:border-orange-900 text-[10px] px-1.5 py-0 uppercase tracking-wider">Tinggi</Badge>
                          )}
                          
                          {!isRead && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                              className="text-xs text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
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
      </Card>
    </div>
  );
}
