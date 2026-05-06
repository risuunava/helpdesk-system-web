<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketCreatedUser extends Notification
{
    use Queueable;

    public $ticket;

    /**
     * Create a new notification instance.
     */
    public function __construct($ticket)
    {
        $this->ticket = $ticket;
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
            'title' => 'Tiket Berhasil Dibuat',
            'message' => 'Tiket Anda #' . $this->ticket->ticket_number . ' ("' . $this->ticket->title . '") telah berhasil dibuat dan masuk antrean.',
            'type' => 'success',
            'priority' => 'normal',
        ];
    }
}
