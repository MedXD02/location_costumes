<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un admin de test
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin Test',
                'email' => 'admin@test.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // Créer un utilisateur client de test
        $client = User::firstOrCreate(
            ['email' => 'client@test.com'],
            [
                'name' => 'Client Test',
                'email' => 'client@test.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );

        $this->command->info('✅ Utilisateurs de test créés :');
        $this->command->info('   Admin: admin@test.com / password123');
        $this->command->info('   Client: client@test.com / password123');
    }
}


