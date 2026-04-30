<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Truncate permission tables (order matters for foreign keys)
        DB::statement('SET session_replication_role = replica;');
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::statement('SET session_replication_role = DEFAULT;');

        // Create permissions
        $permissions = [
            'view tickets',
            'create tickets',
            'edit tickets',
            'delete tickets',
            'assign tickets',
            'view all tickets',
            'manage users',
            'view dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $agentRole = Role::create(['name' => 'agent']);
        $agentRole->givePermissionTo([
            'view tickets',
            'view all tickets',
            'create tickets',
            'edit tickets',
            'view dashboard',
        ]);

        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo([
            'view tickets',
            'create tickets',
            'view dashboard',
        ]);

        // Create default users — use DB::table to avoid double-hash from Eloquent 'hashed' cast
        $password = Hash::make('password123');

        $adminId = DB::table('users')->insertGetId([
            'name'       => 'Administrator',
            'email'      => 'admin@helpdesk.com',
            'password'   => $password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        User::find($adminId)->syncRoles(['admin']);

        $agentId = DB::table('users')->insertGetId([
            'name'       => 'Support Agent',
            'email'      => 'agent@helpdesk.com',
            'password'   => $password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        User::find($agentId)->syncRoles(['agent']);

        $userId = DB::table('users')->insertGetId([
            'name'       => 'Regular User',
            'email'      => 'user@helpdesk.com',
            'password'   => $password,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        User::find($userId)->syncRoles(['user']);

        $this->command->info('✅ Roles & permissions selesai!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@helpdesk.com', 'password123'],
                ['Agent', 'agent@helpdesk.com', 'password123'],
                ['User',  'user@helpdesk.com',  'password123'],
            ]
        );
    }
}