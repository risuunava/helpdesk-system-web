<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FixPasswordSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        $users = ['admin@helpdesk.com', 'agent@helpdesk.com', 'user@helpdesk.com'];

        foreach ($users as $email) {
            DB::table('users')
                ->where('email', $email)
                ->update(['password' => $password]);

            $this->command->info("✅ Password reset for {$email}");
        }
    }
}
