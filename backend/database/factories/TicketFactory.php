<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        $priority = $this->faker->randomElement(['low', 'normal', 'urgent']);
        $status   = $this->faker->randomElement(['open', 'in_progress', 'resolved', 'closed']);

        $slaHours = match ($priority) {
            'urgent' => 2,
            'normal' => 6,
            'low'    => 24,
        };

        $createdAt = $this->faker->dateTimeBetween('-30 days', 'now');
        $slaDeadline = (clone $createdAt)->modify("+{$slaHours} hours");

        return [
            'ticket_number' => 'TKT-' . date('Ymd', $createdAt->getTimestamp()) . '-' . strtoupper($this->faker->lexify('??????')),
            'title'         => $this->faker->sentence(6),
            'description'   => $this->faker->paragraph(3),
            'priority'      => $priority,
            'status'        => $status,
            'category'      => $this->faker->randomElement(['hardware', 'software', 'network', 'account', 'other']),
            'sla_due_at'    => $slaDeadline,
            'sla_breached'  => now() > $slaDeadline && !in_array($status, ['resolved', 'closed']),
            'user_id'       => User::factory(),
            'assigned_to'   => null,
            'resolved_at'   => in_array($status, ['resolved', 'closed']) ? now() : null,
            'created_at'    => $createdAt,
        ];
    }

    public function urgent(): static
    {
        return $this->state(['priority' => 'urgent']);
    }

    public function open(): static
    {
        return $this->state(['status' => 'open']);
    }

    public function resolved(): static
    {
        return $this->state(['status' => 'resolved', 'resolved_at' => now()]);
    }

    public function breached(): static
    {
        return $this->state(['sla_breached' => true]);
    }
}
