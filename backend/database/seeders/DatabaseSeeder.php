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

        foreach ($this->templateDefinitions() as $definition) {
            $this->seedTemplate($admin, $definition);
        }

        $this->command?->info('Admin: admin@undangan-digital.link / password');
        $this->command?->info('Customer: customer@undangan-digital.link / password');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function templateDefinitions(): array
    {
        return [
            [
                'name' => 'Elegant Gold',
                'slug' => 'elegant-gold',
                'price' => 150_000,
                'tier' => 'standard',
                'colors' => [
                    'primary' => '#C9A86A', 'secondary' => '#E8DCC8', 'background' => '#FBF7F0',
                    'surface' => '#FFFFFF', 'text' => '#302C27', 'muted' => '#81786E',
                ],
                'typography' => ['heading' => 'Playfair Display', 'body' => 'Inter'],
                'animation' => 'fade-up',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'fullscreen'],
                    ['type' => 'guest_greeting', 'variant' => 'default'],
                    ['type' => 'couple', 'variant' => 'classic'],
                    ['type' => 'story', 'variant' => 'timeline'],
                    ['type' => 'event', 'variant' => 'card'],
                    ['type' => 'gallery', 'variant' => 'grid'],
                    ['type' => 'quote', 'variant' => 'default', 'settings' => [
                        'text' => 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu merasa tenteram kepadanya.',
                    ]],
                    ['type' => 'gift', 'variant' => 'default'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Floral Garden',
                'slug' => 'floral-garden',
                'price' => 175_000,
                'tier' => 'standard',
                'colors' => [
                    'primary' => '#A9744F', 'secondary' => '#F3E9DD', 'background' => '#FFFBF5',
                    'surface' => '#FFFFFF', 'text' => '#3A2E22', 'muted' => '#8C7A68',
                ],
                'typography' => ['heading' => 'Cormorant Garamond', 'body' => 'Inter'],
                'animation' => 'fade',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'minimal'],
                    ['type' => 'guest_greeting', 'variant' => 'default'],
                    ['type' => 'couple', 'variant' => 'split'],
                    ['type' => 'event', 'variant' => 'timeline'],
                    ['type' => 'story', 'variant' => 'timeline'],
                    ['type' => 'gallery', 'variant' => 'grid'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Minimalist White',
                'slug' => 'minimalist-white',
                'price' => 99_000,
                'tier' => 'standard',
                'colors' => [
                    'primary' => '#111111', 'secondary' => '#E5E5E5', 'background' => '#FFFFFF',
                    'surface' => '#FAFAFA', 'text' => '#111111', 'muted' => '#767676',
                ],
                'typography' => ['heading' => 'Marcellus', 'body' => 'Inter'],
                'animation' => 'fade',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'minimal'],
                    ['type' => 'couple', 'variant' => 'split'],
                    ['type' => 'event', 'variant' => 'card'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Black Luxury',
                'slug' => 'black-luxury',
                'price' => 250_000,
                'tier' => 'exclusive',
                'colors' => [
                    'primary' => '#D4AF37', 'secondary' => '#2A2A2A', 'background' => '#0D0D0D',
                    'surface' => '#1A1A1A', 'text' => '#F5F5F0', 'muted' => '#A8A29A',
                ],
                'typography' => ['heading' => 'Playfair Display', 'body' => 'Poppins'],
                'animation' => 'fade-up',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'fullscreen'],
                    ['type' => 'couple', 'variant' => 'classic'],
                    ['type' => 'event', 'variant' => 'timeline'],
                    ['type' => 'quote', 'variant' => 'default', 'settings' => [
                        'text' => 'Cinta sejati adalah bertemu jiwa sebelum bertemu raga.',
                    ]],
                    ['type' => 'gallery', 'variant' => 'grid'],
                    ['type' => 'gift', 'variant' => 'default'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Sage Botanical',
                'slug' => 'sage-botanical',
                'price' => 175_000,
                'tier' => 'standard',
                'colors' => [
                    'primary' => '#7C8B6F', 'secondary' => '#E7EAE1', 'background' => '#FAF9F4',
                    'surface' => '#FFFFFF', 'text' => '#3A3F33', 'muted' => '#8A8F7E',
                ],
                'typography' => ['heading' => 'EB Garamond', 'body' => 'Inter'],
                'animation' => 'fade-up',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'minimal'],
                    ['type' => 'guest_greeting', 'variant' => 'default'],
                    ['type' => 'couple', 'variant' => 'classic'],
                    ['type' => 'story', 'variant' => 'timeline'],
                    ['type' => 'event', 'variant' => 'card'],
                    ['type' => 'gallery', 'variant' => 'grid'],
                    ['type' => 'gift', 'variant' => 'default'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Modern Editorial',
                'slug' => 'modern-editorial',
                'price' => 225_000,
                'tier' => 'exclusive',
                'colors' => [
                    'primary' => '#1F1F1F', 'secondary' => '#D9D2C5', 'background' => '#F4F1EA',
                    'surface' => '#FFFFFF', 'text' => '#1F1F1F', 'muted' => '#75705F',
                ],
                'typography' => ['heading' => 'Marcellus', 'body' => 'Poppins'],
                'animation' => 'slide',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'fullscreen'],
                    ['type' => 'couple', 'variant' => 'split'],
                    ['type' => 'event', 'variant' => 'timeline'],
                    ['type' => 'quote', 'variant' => 'default', 'settings' => [
                        'text' => 'Bersama menulis kisah baru, sehidup semati.',
                    ]],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
            [
                'name' => 'Modern Botanical Editorial',
                'slug' => 'modern-botanical-editorial',
                'price' => 275_000,
                'tier' => 'exclusive',
                'colors' => [
                    'primary' => '#8B6F47', 'secondary' => '#E4D9C4', 'background' => '#FBF6EE',
                    'surface' => '#FFFFFF', 'text' => '#2E2A24', 'muted' => '#8A7F6E',
                ],
                'backgroundImage' => 'linear-gradient(180deg, #FDF9F2 0%, #F3E9D6 45%, #EFE2CB 100%)',
                'typography' => ['heading' => 'Cormorant Garamond', 'body' => 'Inter'],
                'animation' => 'fade-up',
                'sections' => [
                    ['type' => 'cover', 'variant' => 'arch'],
                    ['type' => 'guest_greeting', 'variant' => 'default'],
                    ['type' => 'couple', 'variant' => 'overlap'],
                    ['type' => 'story', 'variant' => 'timeline'],
                    ['type' => 'event', 'variant' => 'ornate'],
                    ['type' => 'gallery', 'variant' => 'masonry'],
                    ['type' => 'quote', 'variant' => 'default', 'settings' => [
                        'text' => 'Dua hati, satu tujuan, selamanya bersama dalam suka dan duka.',
                    ]],
                    ['type' => 'gift', 'variant' => 'default'],
                    ['type' => 'rsvp', 'variant' => 'form'],
                    ['type' => 'closing', 'variant' => 'default'],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function seedTemplate(User $admin, array $definition): void
    {
        $template = Template::updateOrCreate(
            ['slug' => $definition['slug']],
            [
                'name' => $definition['name'],
                'is_active' => true,
                'created_by' => $admin->id,
                'price' => $definition['price'],
                'tier' => $definition['tier'],
            ],
        );

        $sections = array_map(
            fn (array $section) => [
                'type' => $section['type'],
                'variant' => $section['variant'],
                'enabled' => true,
                'settings' => $section['settings'] ?? [],
            ],
            $definition['sections'],
        );

        TemplateVersion::updateOrCreate(
            ['template_id' => $template->id, 'version' => 1],
            [
                'status' => 'published',
                'created_by' => $admin->id,
                'schema' => [
                    'name' => $definition['name'],
                    'version' => 1,
                    'sections' => $sections,
                ],
            ],
        );

        $theme = Theme::firstOrCreate(
            ['slug' => $definition['slug']],
            ['name' => $definition['name'], 'is_active' => true, 'created_by' => $admin->id],
        );

        ThemeVersion::firstOrCreate(
            ['theme_id' => $theme->id, 'version' => 1],
            [
                'status' => 'published',
                'created_by' => $admin->id,
                'tokens' => [
                    'name' => $definition['name'],
                    'version' => 1,
                    'colors' => $definition['colors'],
                    'typography' => $definition['typography'],
                    'radius' => ['card' => '16px', 'button' => '999px'],
                    'animations' => ['preset' => $definition['animation']],
                    ...(isset($definition['backgroundImage']) ? ['backgroundImage' => $definition['backgroundImage']] : []),
                ],
            ],
        );
    }
}
