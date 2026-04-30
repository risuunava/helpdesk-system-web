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
        $priorityService = app(PriorityService::class);
        $slaService      = app(SLAService::class);

        // Gunakan user yang sudah dibuat oleh RolePermissionSeeder
        $user  = User::where('email', 'user@helpdesk.com')->first()
                 ?? User::first();
        $admin = User::where('email', 'admin@helpdesk.com')->first()
                 ?? $user;

        if (!$user) {
            $this->command->warn('No users found. Run RolePermissionSeeder first.');
            return;
        }

        $tickets = [
            [
                'title'       => 'Server down production',
                'description' => 'Server produksi mengalami downtime, semua user tidak bisa akses sistem.',
                'category'    => 'hardware',
                'status'      => 'open',
            ],
            [
                'title'       => 'Cannot login to email',
                'description' => 'Saya tidak bisa login ke email perusahaan, muncul error invalid credentials.',
                'category'    => 'account',
                'status'      => 'in_progress',
            ],
            [
                'title'       => 'Request new software installation',
                'description' => 'Mohon install Adobe Photoshop untuk keperluan desain marketing.',
                'category'    => 'software',
                'status'      => 'open',
            ],
            [
                'title'       => 'Printer tidak bisa print',
                'description' => 'Printer di lantai 3 tidak bisa digunakan, muncul error offline.',
                'category'    => 'hardware',
                'status'      => 'resolved',
            ],
            [
                'title'       => 'Koneksi internet lambat',
                'description' => 'Internet di ruang meeting sangat lambat saat video conference.',
                'category'    => 'network',
                'status'      => 'in_progress',
            ],
        ];

        foreach ($tickets as $ticketData) {
            $priority = $priorityService->determinePriority(
                $ticketData['title'],
                $ticketData['description']
            );

            $ticket = Ticket::create([
                'title'       => $ticketData['title'],
                'description' => $ticketData['description'],
                'category'    => $ticketData['category'],
                'priority'    => $priority,
                'status'      => $ticketData['status'],
                'user_id'     => $user->id,
                'assigned_to' => in_array($ticketData['status'], ['in_progress', 'resolved']) ? $admin->id : null,
                'sla_due_at'  => $slaService->calculateDeadline($priority),
                'resolved_at' => $ticketData['status'] === 'resolved' ? now() : null,
            ]);

            TicketLog::create([
                'ticket_id'   => $ticket->id,
                'user_id'     => $user->id,
                'action'      => 'created',
                'description' => 'Ticket dibuat via seeder',
                'changes'     => ['initial' => $ticket->toArray()],
            ]);
        }

        $this->command->info('✅ ' . count($tickets) . ' sample tickets berhasil dibuat.');
    }
}