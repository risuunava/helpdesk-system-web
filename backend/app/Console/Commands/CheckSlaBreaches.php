<?php

namespace App\Console\Commands;

use App\Models\Ticket;
use App\Services\SLAService;
use Illuminate\Console\Command;

class CheckSlaBreaches extends Command
{
    protected $signature   = 'sla:check';
    protected $description = 'Check and mark SLA breached tickets';

    private SLAService $slaService;

    public function __construct(SLAService $slaService)
    {
        parent::__construct();
        $this->slaService = $slaService;
    }

    public function handle(): void
    {
        $tickets = Ticket::whereNotIn('status', ['resolved', 'closed'])
            ->where('sla_breached', false)
            ->whereNotNull('sla_due_at')
            ->where('sla_due_at', '<', now())
            ->get();

        $count = 0;

        foreach ($tickets as $ticket) {
            $this->slaService->updateSlaStatus($ticket);
            $count++;
        }

        $this->info("SLA check complete. {$count} ticket(s) marked as breached.");
    }
}
