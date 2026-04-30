<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Get all users — admin only
     */
    public function index(): JsonResponse
    {
        $users = User::with('roles:id,name')
            ->select('id', 'name', 'email', 'created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'roles'      => $user->roles->pluck('name')->toArray(),
                    'created_at' => $user->created_at,
                ];
            });

        return $this->successResponse($users, 'Users retrieved');
    }

    /**
     * Get agents only — for assign dropdown
     */
    public function agents(): JsonResponse
    {
        $agents = User::role(['agent', 'admin'])
            ->select('id', 'name', 'email')
            ->get()
            ->map(function ($user) {
                return [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->toArray(),
                ];
            });

        return $this->successResponse($agents, 'Agents retrieved');
    }
}
