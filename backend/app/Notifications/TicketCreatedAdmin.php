<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketCreatedAdmin extends Notification
{
    use Queueable;

    public $ticket;
    public $creatorName;

    /**
     * Create a new notification instance.
     */
    public function __construct($ticket, $creatorName)
    {
        $this->ticket = $ticket;
        $this->creatorName = $creatorName;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Tiket Baru Masuk',
            'message' => 'Pengguna ' . $this->creatorName . ' membuat tiket baru #' . $this->ticket->ticket_number . ' ("' . $this->ticket->title . '").',
            'type' => 'ticket',
            'priority' => ($this->ticket->priority === 'urgent') ? 'high' : 'normal',
        ];
    }
}
