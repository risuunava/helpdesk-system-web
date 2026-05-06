<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification
{
    use Queueable;

    public $ticket;
    public $comment;

    public function __construct(Ticket $ticket, TicketComment $comment)
    {
        $this->ticket = $ticket;
        $this->comment = $comment;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $senderName = $this->comment->user->name;
        
        return [
            'title' => 'Pesan Baru di Tiket #' . $this->ticket->ticket_number,
            'message' => $senderName . ' memberikan komentar: "' . \Str::limit($this->comment->comment, 50) . '"',
            'type' => 'message',
            'priority' => 'normal',
            'ticket_id' => $this->ticket->id,
        ];
    }
}
