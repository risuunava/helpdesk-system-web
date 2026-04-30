<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\User;
use App\Services\SLAService;
use App\Services\PriorityService;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $sla = app(SLAService::class);
        $admin = User::where('email', 'admin@helpdesk.com')->first();
        $agent = User::where('email', 'agent@helpdesk.com')->first();
        $user  = User::where('email', 'user@helpdesk.com')->first();

        if (!$admin || !$agent || !$user) {
            $this->command->warn('Jalankan RolePermissionSeeder terlebih dahulu!');
            return;
        }

        Ticket::query()->delete();

        $tickets = [
            // Ticket milik user, assigned ke agent
            ['title' => 'Laptop tidak bisa booting', 'description' => 'Laptop mati total setelah update BIOS', 'category' => 'hardware', 'priority' => 'urgent', 'user_id' => $user->id, 'assigned_to' => $agent->id, 'status' => 'in_progress'],
            // Ticket milik user, belum assigned (open)
            ['title' => 'Install Microsoft Office', 'description' => 'Perlu instalasi Office 365 untuk kerja', 'category' => 'software', 'priority' => 'normal', 'user_id' => $user->id, 'assigned_to' => null, 'status' => 'open'],
            // Ticket milik admin, assigned ke agent
            ['title' => 'Server monitoring alert', 'description' => 'CPU usage server prod diatas 90%', 'category' => 'network', 'priority' => 'urgent', 'user_id' => $admin->id, 'assigned_to' => $agent->id, 'status' => 'in_progress'],
            // Ticket milik agent, open
            ['title' => 'VPN tidak konek', 'description' => 'Koneksi VPN timeout terus sejak pagi', 'category' => 'network', 'priority' => 'normal', 'user_id' => $agent->id, 'assigned_to' => null, 'status' => 'open'],
            // Ticket milik user, resolved
            ['title' => 'Reset password email', 'description' => 'Lupa password email kantor', 'category' => 'account', 'priority' => 'low', 'user_id' => $user->id, 'assigned_to' => $agent->id, 'status' => 'resolved'],
        ];

        foreach ($tickets as $data) {
            $ticket = Ticket::create([
                'title'       => $data['title'],
                'description' => $data['description'],
                'category'    => $data['category'],
                'priority'    => $data['priority'],
                'user_id'     => $data['user_id'],
                'assigned_to' => $data['assigned_to'],
                'status'      => $data['status'],
                'sla_due_at'  => $sla->calculateDeadline($data['priority']),
                'resolved_at' => $data['status'] === 'resolved' ? now() : null,
            ]);

            TicketLog::create([
                'ticket_id'   => $ticket->id,
                'user_id'     => $data['user_id'],
                'action'      => 'created',
                'description' => 'Ticket created via seeder',
                'changes'     => $ticket->toArray(),
            ]);
        }

        $this->command->info("✅ {$tickets[0]['title']} dan 4 tiket lainnya dibuat.");
    }
}