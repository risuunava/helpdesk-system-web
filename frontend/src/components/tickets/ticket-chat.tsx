'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Lock } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import echo from '@/lib/echo';

interface Comment {
  id: number;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface TicketChatProps {
  ticketId: string | number;
}

export function TicketChat({ ticketId }: TicketChatProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user, isAdmin, isAgent } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tickets/${ticketId}/comments`);
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    if (!echo) return;

    const channel = echo.private(`tickets.${ticketId}`)
      .listen('.comment.posted', (data: { comment: Comment }) => {
        setComments((prev) => {
            if (data.comment.is_internal && !isAdmin && !isAgent) return prev;
            if (prev.some(c => c.id === data.comment.id)) return prev;
            return [...prev, data.comment];
        });
      });

    return () => {
        echo?.leave(`tickets.${ticketId}`);
    };
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      const { data } = await api.post(`/tickets/${ticketId}/comments`, {
        comment: newComment,
        is_internal: isInternal,
      });

      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setNewComment('');
        setIsInternal(false);
      }
    } catch (error) {
      toast({
        title: 'Gagal',
        description: 'Tidak bisa mengirim komentar',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="flex flex-col h-[600px] bg-canvas overflow-hidden">
      <div className="py-4 px-6 border-b border-hairline flex items-center justify-between">
        <h3 className="body font-bold text-ink flex items-center gap-2">
          Diskusi Tiket
          {comments.length > 0 && (
            <span className="micro px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted">
              {comments.length}
            </span>
          )}
        </h3>
      </div>

      <div className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Comments Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-accent-blue" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-ink-muted rotate-12" />
              </div>
              <p className="body-sm text-ink-muted">Belum ada diskusi.<br/>Mulai obrolan di bawah.</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = comment.user.id === user?.id;
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex gap-4 max-w-[90%]",
                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                      isMe ? "bg-accent-blue text-white" : "bg-surface-2 text-ink-muted"
                    )}>
                      {getInitials(comment.user.name)}
                    </div>
                  </div>
                  
                  <div className={cn("space-y-1", isMe ? "text-right" : "text-left")}>
                    <div className={cn("flex items-center gap-2 flex-wrap mb-1", isMe ? "justify-end" : "justify-start")}>
                      {!isMe && <span className="micro font-bold text-ink uppercase tracking-tighter">{comment.user.name}</span>}
                      {comment.is_internal && (
                        <span className="micro px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1 border border-amber-500/10">
                          <Lock className="h-2.5 w-2.5" /> Internal
                        </span>
                      )}
                      <span className="text-[10px] text-ink-muted/50">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div
                      className={cn(
                        "rounded-[18px] px-4 py-2.5 body-sm shadow-sm leading-relaxed",
                        isMe 
                          ? "bg-accent-blue text-white rounded-tr-[4px]" 
                          : "bg-surface-1 border border-hairline text-ink rounded-tl-[4px]",
                        comment.is_internal && !isMe && "bg-amber-500/5 border-amber-500/20"
                      )}
                    >
                      {comment.comment}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-hairline bg-surface-1/50">
          <div className="space-y-4">
            {(isAdmin || isAgent) && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-hairline bg-surface-2 text-accent-blue focus:ring-accent-blue h-3.5 w-3.5"
                />
                <label htmlFor="is-internal" className="micro font-bold text-ink-muted flex items-center gap-1.5 cursor-pointer uppercase tracking-tight">
                  <Lock className="h-3 w-3" /> Catatan Internal (Hanya Agen/Admin)
                </label>
              </div>
            )}
            
            <div className="relative flex items-center gap-3">
              <textarea
                placeholder="Tulis pesan..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-framer min-h-[50px] max-h-[150px] py-3 px-4 flex-1 resize-none pr-14"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
              <button
                disabled={!newComment.trim() || isSending}
                onClick={handlePostComment}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-accent-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-blue/20"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
              </button>
            </div>
            <p className="micro text-center text-ink-muted/40">
              Shift + Enter untuk baris baru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
