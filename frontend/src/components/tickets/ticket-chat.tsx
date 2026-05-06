'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Lock } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

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
    // Simple polling for "real-time" feel without web sockets
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
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
    <Card className="flex flex-col h-[600px] border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          Diskusi Tiket
          {comments.length > 0 && (
            <Badge variant="secondary" className="font-normal text-xs">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Comments Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                <Send className="h-5 w-5 text-muted-foreground rotate-45" />
              </div>
              <p className="text-sm">Belum ada diskusi. Mulai obrolan di bawah.</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMe = comment.user.id === user?.id;
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className={isMe ? "bg-primary text-primary-foreground text-xs" : "bg-muted text-xs"}>
                      {getInitials(comment.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn("space-y-1.5", isMe ? "text-right" : "text-left")}>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {!isMe && <span className="text-xs font-semibold">{comment.user.name}</span>}
                      {comment.is_internal && (
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-200 text-[10px] h-4 px-1">
                          <Lock className="h-2 w-2 mr-0.5" /> Internal
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-background border border-border rounded-tl-none",
                        comment.is_internal && !isMe && "bg-amber-50/50 border-amber-100"
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
        <div className="p-4 border-t bg-background/50">
          <div className="space-y-3">
            {(isAdmin || isAgent) && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
                />
                <label htmlFor="is-internal" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
                  <Lock className="h-3 w-3" /> Catatan Internal (Hanya Agen/Admin)
                </label>
              </div>
            )}
            
            <div className="relative flex items-end gap-2">
              <Textarea
                placeholder="Ketik pesan Anda di sini..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] max-h-[200px] resize-none pr-12 bg-background border-border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
              <Button
                size="icon"
                disabled={!newComment.trim() || isSending}
                onClick={handlePostComment}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-full shadow-md"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic">
              Tekan Enter untuk mengirim, Shift + Enter untuk baris baru
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
