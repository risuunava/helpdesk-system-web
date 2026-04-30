<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'priority',
        'status',
        'category',
        'sla_due_at',
        'sla_breached',
        'user_id',
        'assigned_to',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'sla_due_at' => 'datetime',
            'resolved_at' => 'datetime',
            'sla_breached' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(TicketLog::class);
    }

    // Auto-generate ticket number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            $ticket->ticket_number = 'TKT-' . date('Ymd') . '-' . strtoupper(\Str::random(6));
            
            // Auto-assign priority berdasarkan keyword
            if (empty($ticket->priority)) {
                $ticket->priority = $ticket->autoAssignPriority();
            }
            
            // Set SLA deadline berdasarkan priority
            $ticket->sla_due_at = $ticket->calculateSlaDeadline();
        });
    }

    public function autoAssignPriority(): string
    {
        $description = strtolower($this->title . ' ' . $this->description);
        
        $urgentKeywords = ['server down', 'system down', 'critical', 'urgent', 'production down'];
        $normalKeywords = ['cannot login', 'login issue', 'error', 'bug', 'not working'];
        
        foreach ($urgentKeywords as $keyword) {
            if (str_contains($description, $keyword)) {
                return 'urgent';
            }
        }
        
        foreach ($normalKeywords as $keyword) {
            if (str_contains($description, $keyword)) {
                return 'normal';
            }
        }
        
        return 'low';
    }

    public function calculateSlaDeadline()
    {
        $hours = match($this->priority) {
            'urgent' => 2,
            'normal' => 6,
            'low' => 24,
        };
        
        return now()->addHours($hours);
    }

    public function checkSlaStatus(): bool
    {
        if ($this->status === 'resolved' || $this->status === 'closed') {
            return false;
        }
        
        return now() > $this->sla_due_at;
    }
}