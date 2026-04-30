<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Truncate permission tables (order matters untuk foreign keys)
        DB::statement('SET session_replication_role = replica;'); // Disable FK checks (PostgreSQL)
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::statement('SET session_replication_role = DEFAULT;'); // Re-enable FK checks

        // Create permissions with web guard (default)
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
            'edit tickets',
            'assign tickets',
            'view dashboard',
        ]);

        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo([
            'view tickets',
            'create tickets',
            'view dashboard',
        ]);

        // Create default users
        $admin = User::firstOrCreate(
            ['email' => 'admin@helpdesk.com'],
            ['name' => 'Administrator', 'password' => bcrypt('password123')]
        );
        $admin->syncRoles(['admin']);

        $agent = User::firstOrCreate(
            ['email' => 'agent@helpdesk.com'],
            ['name' => 'Support Agent', 'password' => bcrypt('password123')]
        );
        $agent->syncRoles(['agent']);

        $user = User::firstOrCreate(
            ['email' => 'user@helpdesk.com'],
            ['name' => 'Regular User', 'password' => bcrypt('password123')]
        );
        $user->syncRoles(['user']);

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