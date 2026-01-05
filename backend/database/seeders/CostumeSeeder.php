<?php

namespace Database\Seeders;

use App\Models\Costume;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CostumeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer l'admin de test
        $admin = User::where('email', 'admin@test.com')->first();

        if (!$admin) {
            $this->command->error('❌ Admin de test non trouvé. Exécutez d\'abord UserSeeder.');
            return;
        }

        $now = Carbon::now();
        $nextMonth = Carbon::now()->addMonth();
        $next3Months = Carbon::now()->addMonths(3);

        $costumes = [
            [
                'name' => 'Costume de Chevalier',
                'description' => 'Magnifique costume de chevalier médiéval avec armure complète, épée et bouclier. Parfait pour les fêtes médiévales et les événements historiques.',
                'category' => 'Médiéval',
                'size' => 'M',
                'price_per_day' => 25.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/4A5568/FFFFFF?text=Chevalier',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null, // Disponible tous les jours dans la plage
            ],
            [
                'name' => 'Costume de Princesse',
                'description' => 'Robe de princesse élégante avec couronne dorée, perles et dentelle. Idéal pour les anniversaires et les fêtes de princesse.',
                'category' => 'Princesse',
                'size' => 'S',
                'price_per_day' => 30.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/9F7AEA/FFFFFF?text=Princesse',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Super-héros',
                'description' => 'Costume de super-héros avec cape, masque et emblème. Disponible en plusieurs couleurs. Parfait pour les enfants et les adultes.',
                'category' => 'Super-héros',
                'size' => 'L',
                'price_per_day' => 20.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/ED8936/FFFFFF?text=Super-heros',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Pirate',
                'description' => 'Costume complet de pirate avec chapeau tricorne, sabre, bandana et veste. Accessoires inclus : perroquet et carte au trésor.',
                'category' => 'Pirate',
                'size' => 'M',
                'price_per_day' => 22.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/38A169/FFFFFF?text=Pirate',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Sorcière',
                'description' => 'Costume de sorcière avec chapeau pointu, robe noire et balai magique. Parfait pour Halloween et les fêtes d\'Halloween.',
                'category' => 'Halloween',
                'size' => 'S',
                'price_per_day' => 18.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/805AD5/FFFFFF?text=Sorciere',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Vampire',
                'description' => 'Costume élégant de vampire avec cape noire, dents de vampire et accessoires. Style gothique et sophistiqué.',
                'category' => 'Halloween',
                'size' => 'M',
                'price_per_day' => 20.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/E53E3E/FFFFFF?text=Vampire',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Clown',
                'description' => 'Costume coloré de clown avec nez rouge, perruque et chaussures grandes. Accessoires de jonglage inclus.',
                'category' => 'Fête',
                'size' => 'L',
                'price_per_day' => 15.00,
                'availability' => true,
                'published' => false, // Non publié (pour tester)
                'image_url' => 'https://via.placeholder.com/400x600/F6AD55/FFFFFF?text=Clown',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Robot',
                'description' => 'Costume futuriste de robot avec effets lumineux LED et son. Taille ajustable pour enfants et adultes.',
                'category' => 'Futuriste',
                'size' => 'M',
                'price_per_day' => 35.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/3182CE/FFFFFF?text=Robot',
                'admin_id' => $admin->id,
                'available_from' => $nextMonth->format('Y-m-d'), // Disponible à partir du mois prochain
                'available_until' => $next3Months->format('Y-m-d'),
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Ninja',
                'description' => 'Costume de ninja avec masque, shurikens et katana. Style authentique japonais.',
                'category' => 'Combat',
                'size' => 'M',
                'price_per_day' => 24.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/2D3748/FFFFFF?text=Ninja',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $nextMonth->format('Y-m-d'), // Disponible seulement ce mois
                'availability_dates' => null,
            ],
            [
                'name' => 'Costume de Fée',
                'description' => 'Costume magique de fée avec ailes scintillantes, baguette magique et diadème. Parfait pour les petites filles.',
                'category' => 'Fantasy',
                'size' => 'S',
                'price_per_day' => 28.00,
                'availability' => true,
                'published' => true, // Publié
                'image_url' => 'https://via.placeholder.com/400x600/B794F4/FFFFFF?text=Fee',
                'admin_id' => $admin->id,
                'available_from' => $now->format('Y-m-d'),
                'available_until' => $next3Months->format('Y-m-d'),
                // Dates spécifiques disponibles (exemple : seulement les weekends)
                'availability_dates' => $this->getWeekendDates($now, $next3Months),
            ],
        ];

        foreach ($costumes as $costume) {
            Costume::create($costume);
        }

        $this->command->info('✅ ' . count($costumes) . ' costumes de test créés pour l\'admin ' . $admin->email);
    }

    /**
     * Génère les dates de weekend pour un exemple de disponibilité limitée.
     */
    private function getWeekendDates(Carbon $start, Carbon $end): array
    {
        $dates = [];
        $current = $start->copy();

        while ($current->lte($end)) {
            // Samedi (6) ou Dimanche (0)
            if ($current->dayOfWeek === Carbon::SATURDAY || $current->dayOfWeek === Carbon::SUNDAY) {
                $dates[] = $current->format('Y-m-d');
            }
            $current->addDay();
        }

        return $dates;
    }
}


