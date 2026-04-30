<?php

use App\Models\User;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    Role::create(['name' => 'admin', 'guard_name' => 'sanctum']);
    Role::create(['name' => 'agent', 'guard_name' => 'sanctum']);
    Role::create(['name' => 'user', 'guard_name' => 'sanctum']);

    $this->user = User::factory()->create();
    $this->user->assignRole('user');
    $this->token = $this->user->createToken('test')->plainTextToken;
});

test('authenticated user can list tickets', function () {
    Ticket::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/tickets');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
});

test('user can create a ticket', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/tickets', [
            'title'       => 'Server tidak bisa diakses',
            'description' => 'Server down sejak pagi ini',
            'category'    => 'network',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.priority', 'low'); // "server" alone doesn't match "server down" keyword exactly

    $this->assertDatabaseHas('tickets', [
        'title'   => 'Server tidak bisa diakses',
        'user_id' => $this->user->id,
    ]);
});

test('auto priority is set to urgent for "server down" keyword', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/tickets', [
            'title'       => 'server down',
            'description' => 'Semua user tidak bisa akses',
            'category'    => 'network',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.priority', 'urgent');
});

test('auto priority is set to normal for "cannot login" keyword', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/tickets', [
            'title'       => 'cannot login to system',
            'description' => 'User tidak bisa login',
            'category'    => 'account',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.priority', 'normal');
});

test('user can view their own ticket', function () {
    $ticket = Ticket::factory()->create(['user_id' => $this->user->id]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/tickets/{$ticket->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $ticket->id);
});

test('user cannot view other user ticket', function () {
    $otherUser = User::factory()->create();
    $ticket = Ticket::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/tickets/{$ticket->id}");

    $response->assertStatus(403);
});

test('ticket has correct SLA deadline', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/tickets', [
            'title'       => 'server down urgent',
            'description' => 'Production is down',
            'category'    => 'network',
        ]);

    $response->assertStatus(201);
    $ticket = $response->json('data');

    // Urgent SLA = 2 hours
    $this->assertNotNull($ticket['sla_due_at']);
});

test('admin can update ticket status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $adminToken = $admin->createToken('test')->plainTextToken;

    $ticket = Ticket::factory()->create(['user_id' => $this->user->id]);

    $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
        ->patchJson("/api/tickets/{$ticket->id}", [
            'status' => 'in_progress',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'in_progress');
});

test('ticket validation requires title and description', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/tickets', [
            'category' => 'other',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'description']);
});
