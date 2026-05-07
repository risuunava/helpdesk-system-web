<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tickets.{ticketId}', function ($user, $ticketId) {
    $ticket = \App\Models\Ticket::find($ticketId);
    
    if (!$ticket) return false;

    // Admin & Agent can see all (or assigned)
    if ($user->hasRole(['admin', 'agent'])) {
        return true;
    }

    // User can only see their own ticket
    return (int) $user->id === (int) $ticket->user_id;
});
