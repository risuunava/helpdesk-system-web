<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\User;
use App\Services\PriorityService;
use App\Services\SLAService;
use App\Traits\ApiResponse;
use App\Notifications\TicketAssigned;
use App\Notifications\TicketCreatedAdmin;
use App\Notifications\TicketCreatedUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TicketController extends Controller
{
    use ApiResponse;

    private PriorityService $priorityService;
    private SLAService $slaService;

    public function __construct(PriorityService $priorityService, SLAService $slaService)
    {
        $this->priorityService = $priorityService;
        $this->slaService = $slaService;
    }

    /**
     * Get all tickets with filters — role-based scoping
     *
     * User  → hanya tiket milik sendiri
     * Agent → tiket assigned ke dia + open/unassigned + milik sendiri
     * Admin → semua tiket
     */
    public function index(Request $request)
    {
        $user  = Auth::user();
        $query = Ticket::with(['user:id,name,email', 'assignedTo:id,name,email']);

        // ── Role-based scoping ──
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

        // ── User filters ──
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        $tickets->getCollection()->transform(function ($ticket) {
            $ticket->sla_status     = $this->slaService->getRemainingTime($ticket);
            $ticket->sla_is_breached = $this->slaService->isBreached($ticket);
            return $ticket;
        });

        return $this->paginatedResponse($tickets, 'Tickets retrieved successfully');
    }

    /**
     * Create new ticket — semua role bisa buat
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|in:hardware,software,network,account,other',
            'priority'    => 'sometimes|in:low,normal,urgent',
        ]);

        DB::beginTransaction();

        try {
            if (!isset($validated['priority'])) {
                $validated['priority'] = $this->priorityService->determinePriority(
                    $validated['title'],
                    $validated['description']
                );
            }

            $ticket = Ticket::create([
                'title'       => $validated['title'],
                'description' => $validated['description'],
                'category'    => $validated['category'],
                'priority'    => $validated['priority'],
                'user_id'     => Auth::id(),
                'status'      => 'open',
                'sla_due_at'  => $this->slaService->calculateDeadline($validated['priority']),
            ]);

            TicketLog::create([
                'ticket_id'   => $ticket->id,
                'user_id'     => Auth::id(),
                'action'      => 'created',
                'description' => 'Ticket created',
                'changes'     => $ticket->toArray(),
            ]);

            DB::commit();

            $ticket->load(['user:id,name,email']);
            $ticket->sla_message = $this->priorityService->getSlaMessage($ticket->priority);

            $creator = Auth::user();
            $creator->notify(new TicketCreatedUser($ticket));

            $admins = User::whereHas('roles', function($q) { $q->where('name', 'admin'); })->get();
            Notification::send($admins, new TicketCreatedAdmin($ticket, $creator->name));

            return $this->successResponse($ticket, 'Ticket created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ticket detail — role-based access
     *
     * User  → hanya tiket milik sendiri
     * Agent → boleh lihat semua
     * Admin → boleh lihat semua
     */
    public function show(string $id)
    {
        $ticket = Ticket::with([
            'user:id,name,email',
            'assignedTo:id,name,email',
            'logs.user:id,name',
        ])->find($id);

        if (!$ticket) {
            return $this->errorResponse('Ticket not found', 404);
        }

        $user = Auth::user();

        if ($user->hasRole('user') && $ticket->user_id !== $user->id) {
            return $this->errorResponse('Anda hanya bisa melihat tiket milik sendiri', 403);
        }

        $ticket->sla_status     = $this->slaService->getRemainingTime($ticket);
        $ticket->sla_is_breached = $this->slaService->isBreached($ticket);

        return $this->successResponse($ticket, 'Ticket details retrieved');
    }

    /**
     * Update ticket — role-based restrictions
     *
     * User  → TIDAK bisa update
     * Agent → hanya tiket yang di-assign ke dia
     * Admin → bisa update semua
     */
    public function update(Request $request, string $id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return $this->errorResponse('Ticket not found', 404);
        }

        $user = Auth::user();

        // ── Role check ──
        if ($user->hasRole('user')) {
            return $this->errorResponse('User tidak bisa mengupdate tiket', 403);
        }

        if ($user->hasRole('agent') && $ticket->assigned_to !== $user->id) {
            return $this->errorResponse('Anda hanya bisa mengupdate tiket yang di-assign ke Anda', 403);
        }

        $validated = $request->validate([
            'status'      => 'sometimes|in:open,in_progress,resolved,closed',
            'priority'    => 'sometimes|in:low,normal,urgent',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        DB::beginTransaction();

        try {
            $changes = [];

            if (isset($validated['status'])) {
                if (in_array($validated['status'], ['resolved', 'closed'])) {
                    $validated['resolved_at'] = now();
                }
                $changes['status'] = ['old' => $ticket->status, 'new' => $validated['status']];
            }

            if (isset($validated['priority']) && $validated['priority'] !== $ticket->priority) {
                $validated['sla_due_at']   = $this->slaService->calculateDeadline($validated['priority']);
                $validated['sla_breached'] = false;
                $changes['priority'] = ['old' => $ticket->priority, 'new' => $validated['priority']];
            }

            $ticket->update($validated);

            if (!empty($changes)) {
                TicketLog::create([
                    'ticket_id'   => $ticket->id,
                    'user_id'     => Auth::id(),
                    'action'      => 'updated',
                    'description' => 'Ticket updated',
                    'changes'     => $changes,
                ]);
            }

            DB::commit();

            $ticket->refresh()->load(['user:id,name,email', 'assignedTo:id,name,email']);
            $ticket->sla_status = $this->slaService->getRemainingTime($ticket);

            return $this->successResponse($ticket, 'Ticket updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete ticket — ADMIN ONLY
     */
    public function destroy(string $id)
    {
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            return $this->errorResponse('Hanya admin yang bisa menghapus tiket', 403);
        }

        $ticket = Ticket::find($id);

        if (!$ticket) {
            return $this->errorResponse('Ticket not found', 404);
        }

        DB::beginTransaction();
        try {
            TicketLog::create([
                'ticket_id'   => $ticket->id,
                'user_id'     => Auth::id(),
                'action'      => 'deleted',
                'description' => "Ticket #{$ticket->ticket_number} deleted by admin",
                'changes'     => $ticket->toArray(),
            ]);

            $ticket->delete();

            DB::commit();

            return $this->successResponse(null, 'Ticket deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to delete ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Assign ticket to agent — ADMIN ONLY
     */
    public function assign(Request $request, Ticket $ticket)
    {
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            return $this->errorResponse('Hanya admin yang bisa assign tiket', 403);
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $agent = User::find($validated['assigned_to']);

        DB::beginTransaction();
        try {
            $old = $ticket->assigned_to;
            $ticket->update([
                'assigned_to' => $validated['assigned_to'],
                'status'      => 'in_progress',
            ]);

            TicketLog::create([
                'ticket_id'   => $ticket->id,
                'user_id'     => Auth::id(),
                'action'      => 'assigned',
                'description' => "Ticket assigned to {$agent->name}",
                'changes'     => ['assigned_to' => ['old' => $old, 'new' => $validated['assigned_to']]],
            ]);

            DB::commit();

            $ticket->refresh()->load(['user:id,name,email', 'assignedTo:id,name,email']);
            
            $agent->notify(new TicketAssigned($ticket));

            return $this->successResponse($ticket, 'Ticket assigned successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to assign ticket: ' . $e->getMessage(), 500);
        }
    }
}