<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()->paginate(20);
        
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        
        if ($notification) {
            $notification->markAsRead();
            return response()->json([
                'status' => 'success',
                'message' => 'Notification marked as read'
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Notification not found'
        ], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read'
        ]);
    }
}
