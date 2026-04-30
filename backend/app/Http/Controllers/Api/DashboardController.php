<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\SLAService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    private SLAService $slaService;

    public function __construct(SLAService $slaService)
    {
        $this->slaService = $slaService;
    }

    public function index()
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin') || $user->hasRole('agent');

        // Total tickets
        $totalTicketsQuery = Ticket::query();
        if (!$isAdmin) {
            $totalTicketsQuery->where('user_id', $user->id);
        }
        $totalTickets = $totalTicketsQuery->count();

        // Tickets by status
        $ticketsByStatus = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Tickets by priority
        $ticketsByPriority = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        // SLA breached tickets
        $breachedTickets = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->where('sla_breached', true)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->count();

        // Recent tickets
        $recentTickets = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->with(['user:id,name,email'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                $ticket->sla_status = $this->slaService->getRemainingTime($ticket);
                return $ticket;
            });

        // Weekly ticket trends
        $weeklyTrends = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Average resolution time (dalam jam)
        $avgResolutionTime = Ticket::query()
            ->when(!$isAdmin, fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('resolved_at')
            ->select(
                DB::raw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours')
            )
            ->value('avg_hours');

        $dashboardData = [
            'summary' => [
                'total_tickets' => $totalTickets,
                'open_tickets' => $ticketsByStatus['open'] ?? 0,
                'in_progress_tickets' => $ticketsByStatus['in_progress'] ?? 0,
                'resolved_tickets' => $ticketsByStatus['resolved'] ?? 0,
                'sla_breached' => $breachedTickets,
                'avg_resolution_hours' => round($avgResolutionTime ?? 0, 1),
            ],
            'tickets_by_status' => $ticketsByStatus,
            'tickets_by_priority' => $ticketsByPriority,
            'recent_tickets' => $recentTickets,
            'weekly_trends' => $weeklyTrends,
        ];

        return $this->successResponse($dashboardData, 'Dashboard data retrieved');
    }
}