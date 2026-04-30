<?php

namespace App\Services;

use App\Models\Ticket;
use Carbon\Carbon;

class SLAService
{
    private PriorityService $priorityService;

    public function __construct(PriorityService $priorityService)
    {
        $this->priorityService = $priorityService;
    }

    public function calculateDeadline(string $priority): Carbon
    {
        $hours = $this->priorityService->getResponseTime($priority);
        return now()->addHours($hours);
    }

    public function isBreached(Ticket $ticket): bool
    {
        if (in_array($ticket->status, ['resolved', 'closed'])) {
            return false;
        }

        return now()->isAfter($ticket->sla_due_at);
    }

    public function getRemainingTime(Ticket $ticket): ?string
    {
        if ($this->isBreached($ticket)) {
            return 'SLA Breached';
        }

        if ($ticket->status === 'resolved' || $ticket->status === 'closed') {
            return 'Completed';
        }

        $now = now();
        $dueDate = Carbon::parse($ticket->sla_due_at);
        
        if ($now->diffInHours($dueDate) > 0) {
            return $now->diffInHours($dueDate) . ' jam tersisa';
        }
        
        return $now->diffInMinutes($dueDate) . ' menit tersisa';
    }

    public function updateSlaStatus(Ticket $ticket): void
    {
        if ($this->isBreached($ticket) && !$ticket->sla_breached) {
            $ticket->update(['sla_breached' => true]);
        }
    }
}