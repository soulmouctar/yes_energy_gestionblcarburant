<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public static function log($action, $tableName = null, $recordId = null, $details = null)
    {
        try {
            $user = Auth::user();
            ActivityLog::create([
                'user_id' => $user ? $user->id : null,
                'user_name' => $user ? $user->name . ' (' . $user->role . ')' : 'Système',
                'action' => $action,
                'table_name' => $tableName,
                'record_id' => $recordId,
                'details' => is_array($details) || is_object($details) ? json_encode($details, JSON_UNESCAPED_UNICODE) : $details,
                'ip_address' => request()->ip(),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Silence error to not block main operation
        }
    }
}
