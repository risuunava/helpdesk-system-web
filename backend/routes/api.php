<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketCommentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public auth routes (no token required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login'])->name('login');

// Protected routes (require Sanctum token)
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles');
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Tickets CRUD
    Route::apiResource('tickets', TicketController::class);
    
    // Ticket Comments
    Route::get('/tickets/{ticket}/comments', [TicketCommentController::class, 'index']);
    Route::post('/tickets/{ticket}/comments', [TicketCommentController::class, 'store']);

    // Additional ticket routes
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign']);

    // Users (admin only)
    Route::get('/users',  [UserController::class, 'index']);
    Route::get('/agents', [UserController::class, 'agents']); // For assign dropdown

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});