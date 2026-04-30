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

    /**
     * Apply role-based scope to a ticket query.
     *
     * User  → only own tickets
     * Agent → assigned to them + open/unassigned + own tickets
     * Admin → no filter (all)
     */
    private function scopeByRole($query)
    {
        $user = Auth::user();

        if ($user->hasRole('user')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('agent')) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('user_id', $user->id)
                  ->orWhere(function ($q2) {
                      $q2->where('status', 'open')
                         ->whereNull('assigned_to');
                  });
            });
        }
        // admin → no filter

        return $query;
    }

    public function index()
    {
        $user = Auth::user();

        // Total tickets (scoped)
        $totalTickets = $this->scopeByRole(Ticket::query())->count();

        // Tickets by status (scoped)
        $ticketsByStatus = $this->scopeByRole(Ticket::query())
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Tickets by priority (scoped)
        $ticketsByPriority = $this->scopeByRole(Ticket::query())
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        // SLA breached tickets (scoped)
        $breachedTickets = $this->scopeByRole(Ticket::query())
            ->where('sla_breached', true)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->count();

        // Recent tickets (scoped)
        $recentTickets = $this->scopeByRole(Ticket::query())
            ->with(['user:id,name,email'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                $ticket->sla_status = $this->slaService->getRemainingTime($ticket);
                return $ticket;
            });

        // Weekly ticket trends (scoped)
        $weeklyTrends = $this->scopeByRole(Ticket::query())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Average resolution time in hours (scoped)
        $avgResolutionTime = $this->scopeByRole(Ticket::query())
            ->whereNotNull('resolved_at')
            ->select(
                DB::raw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours')
            )
            ->value('avg_hours');

        $dashboardData = [
            'summary' => [
                'total_tickets'        => $totalTickets,
                'open_tickets'         => $ticketsByStatus['open'] ?? 0,
                'in_progress_tickets'  => $ticketsByStatus['in_progress'] ?? 0,
                'resolved_tickets'     => $ticketsByStatus['resolved'] ?? 0,
                'sla_breached'         => $breachedTickets,
                'avg_resolution_hours' => round($avgResolutionTime ?? 0, 1),
            ],
            'tickets_by_status'   => $ticketsByStatus,
            'tickets_by_priority' => $ticketsByPriority,
            'recent_tickets'      => $recentTickets,
            'weekly_trends'       => $weeklyTrends,
            'user_role'           => $user->getRoleNames()->first() ?? 'user',
        ];

        return $this->successResponse($dashboardData, 'Dashboard data retrieved');
    }
}