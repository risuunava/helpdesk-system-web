<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Notifications\NewCommentNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketCommentController extends Controller
{
    use ApiResponse;

    /**
     * Get comments for a ticket
     */
    public function index(Ticket $ticket)
    {
        $user = Auth::user();

        // Scope check: User can only see their own ticket comments
        if ($user->hasRole('user') && $ticket->user_id !== $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $query = $ticket->comments()->with('user:id,name,email');

        // Non-admin/agent cannot see internal comments
        if ($user->hasRole('user')) {
            $query->where('is_internal', false);
        }

        $comments = $query->orderBy('created_at', 'asc')->get();

        return $this->successResponse($comments, 'Comments retrieved successfully');
    }

    /**
     * Post a comment
     */
    public function store(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        // Scope check
        if ($user->hasRole('user') && $ticket->user_id !== $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'comment' => 'required|string',
            'is_internal' => 'sometimes|boolean',
        ]);

        // Only agent/admin can mark comment as internal
        if ($user->hasRole('user')) {
            $validated['is_internal'] = false;
        }

        $comment = $ticket->comments()->create([
            'user_id' => $user->id,
            'comment' => $validated['comment'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        // Load user info for response
        $comment->load('user:id,name,email');

        // --- Notifications ---
        // 1. If User comments, notify Agent/Admin
        if ($user->hasRole('user')) {
            if ($ticket->assignedTo) {
                $ticket->assignedTo->notify(new NewCommentNotification($ticket, $comment));
            }
            // Also notify Admins
            $admins = \App\Models\User::whereHas('roles', function($q) { $q->where('name', 'admin'); })->get();
            \Illuminate\Support\Facades\Notification::send($admins, new NewCommentNotification($ticket, $comment));
        } 
        // 2. If Agent/Admin comments (and NOT internal), notify User
        else if (!$comment->is_internal) {
            $ticket->user->notify(new NewCommentNotification($ticket, $comment));
        }

        return $this->successResponse($comment, 'Comment posted successfully', 201);
    }
}
