<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Accessor to dynamically resolve full avatar URL using environment APP_URL config.
     */
    public function getAvatarAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // External avatar services like ui-avatars.com
        if (str_contains($value, 'ui-avatars.com')) {
            return $value;
        }

        // Clean any legacy hardcoded domain or IP address from stored value
        $cleanPath = preg_replace('/^https?:\/\/[^\/]+/', '', $value);
        $cleanPath = '/' . ltrim($cleanPath, '/');

        // Dynamically prepend APP_URL from .env configuration
        return url($cleanPath);
    }
}
