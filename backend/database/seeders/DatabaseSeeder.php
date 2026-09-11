<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@undangan-digital.link'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
        );

        $customer = User::firstOrCreate(
            ['email' => 'customer@undangan-digital.link'],
            [
                'name' => 'Customer Demo',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ],
        );

        $template = Template::firstOrCreate(
            ['slug' => 'elegant-gold'],
            ['name' => 'Elegant Gold', 'is_active' => true, 'created_by' => $admin->id],
        );

        TemplateVersion::firstOrCreate(
            ['template_id' => $template->id, 'version' => 1],
            [
                'status' => 'published',
                'created_by' => $admin->id,
                'schema' => [
                    'name' => 'Elegant Gold',
                    'version' => 1,
                    'sections' => [
                        ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true, 'settings' => []],
                    ],
                ],
            ],
        );

        $theme = Theme::firstOrCreate(
            ['slug' => 'elegant-gold'],
            ['name' => 'Elegant Gold', 'is_active' => true, 'created_by' => $admin->id],
        );

        ThemeVersion::firstOrCreate(
            ['theme_id' => $theme->id, 'version' => 1],
            [
                'status' => 'published',
                'created_by' => $admin->id,
                'tokens' => [
                    'name' => 'Elegant Gold',
                    'version' => 1,
                    'colors' => [
                        'primary' => '#C9A86A',
                        'secondary' => '#E8DCC8',
                        'background' => '#FBF7F0',
                        'surface' => '#FFFFFF',
                        'text' => '#302C27',
                        'muted' => '#81786E',
                    ],
                    'typography' => [
                        'heading' => 'Playfair Display',
                        'body' => 'Inter',
                    ],
                    'radius' => ['card' => '16px', 'button' => '999px'],
                    'animations' => ['preset' => 'fade-up'],
                ],
            ],
        );

        $this->command?->info("Admin: admin@undangan-digital.link / password");
        $this->command?->info("Customer: customer@undangan-digital.link / password");
    }
}
