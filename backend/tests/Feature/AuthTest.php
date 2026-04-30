<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'token',
        ]);
});

test('login fails with wrong password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('correctpassword'),
    ]);

    $response = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422);
});

test('login fails with non-existent email', function () {
    $response = $this->postJson('/api/login', [
        'email'    => 'nobody@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(422);
});

test('user can register', function () {
    $response = $this->postJson('/api/register', [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['token']);

    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/logout');

    $response->assertStatus(200);
});

test('unauthenticated request returns 401', function () {
    $response = $this->getJson('/api/tickets');
    $response->assertStatus(401);
});
