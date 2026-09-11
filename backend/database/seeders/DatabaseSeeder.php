<?php

namespace Database\Seeders;

use App\Models\Invitation;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
                'demo_invitation_count' => 42,
                'colors' => [
                    'primary' => '#C9A86A', 'secondary' => '#E8DCC8', 'background' => '#FBF7F0',
                    'surface' => '#FFFFFF', 'text' => '#302C27', 'muted' => '#81786E',
                ],
                'typography' => ['heading' => 'Playfair Display', 'body' => 'Inter'],
                'animation' => 'fade-up',
            ],
            [
                'name' => 'Floral Garden',
                'slug' => 'floral-garden',
                'price' => 175_000,
                'tier' => 'standard',
                'demo_invitation_count' => 28,
                'colors' => [
                    'primary' => '#A9744F', 'secondary' => '#F3E9DD', 'background' => '#FFFBF5',
                    'surface' => '#FFFFFF', 'text' => '#3A2E22', 'muted' => '#8C7A68',
                ],
                'typography' => ['heading' => 'Cormorant Garamond', 'body' => 'Inter'],
                'animation' => 'fade',
            ],
            [
                'name' => 'Minimalist White',
                'slug' => 'minimalist-white',
                'price' => 99_000,
                'tier' => 'standard',
                'demo_invitation_count' => 65,
                'colors' => [
                    'primary' => '#111111', 'secondary' => '#E5E5E5', 'background' => '#FFFFFF',
                    'surface' => '#FAFAFA', 'text' => '#111111', 'muted' => '#767676',
                ],
                'typography' => ['heading' => 'Marcellus', 'body' => 'Inter'],
                'animation' => 'fade',
            ],
            [
                'name' => 'Black Luxury',
                'slug' => 'black-luxury',
                'price' => 250_000,
                'tier' => 'exclusive',
                'demo_invitation_count' => 12,
                'colors' => [
                    'primary' => '#D4AF37', 'secondary' => '#2A2A2A', 'background' => '#0D0D0D',
                    'surface' => '#1A1A1A', 'text' => '#F5F5F0', 'muted' => '#A8A29A',
                ],
                'typography' => ['heading' => 'Playfair Display', 'body' => 'Poppins'],
                'animation' => 'fade-up',
            ],
            [
                'name' => 'Sage Botanical',
                'slug' => 'sage-botanical',
                'price' => 175_000,
                'tier' => 'standard',
                'demo_invitation_count' => 19,
                'colors' => [
                    'primary' => '#7C8B6F', 'secondary' => '#E7EAE1', 'background' => '#FAF9F4',
                    'surface' => '#FFFFFF', 'text' => '#3A3F33', 'muted' => '#8A8F7E',
                ],
                'typography' => ['heading' => 'EB Garamond', 'body' => 'Inter'],
                'animation' => 'fade-up',
            ],
            [
                'name' => 'Modern Editorial',
                'slug' => 'modern-editorial',
                'price' => 225_000,
                'tier' => 'exclusive',
                'demo_invitation_count' => 7,
                'colors' => [
                    'primary' => '#1F1F1F', 'secondary' => '#D9D2C5', 'background' => '#F4F1EA',
                    'surface' => '#FFFFFF', 'text' => '#1F1F1F', 'muted' => '#75705F',
                ],
                'typography' => ['heading' => 'Marcellus', 'body' => 'Poppins'],
                'animation' => 'slide',
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

        TemplateVersion::firstOrCreate(
            ['template_id' => $template->id, 'version' => 1],
            [
                'status' => 'published',
                'created_by' => $admin->id,
                'schema' => [
                    'name' => $definition['name'],
                    'version' => 1,
                    'sections' => [
                        ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true, 'settings' => []],
                    ],
                ],
            ],
        );

        $theme = Theme::firstOrCreate(
            ['slug' => $definition['slug']],
            ['name' => $definition['name'], 'is_active' => true, 'created_by' => $admin->id],
        );

        $themeVersion = ThemeVersion::firstOrCreate(
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
                ],
            ],
        );

        $this->seedDemoInvitations($template, $themeVersion, $definition['demo_invitation_count']);
    }

    /**
     * Placeholder invitations owned by no real customer, used only so the
     * public catalog's "Terlaris" (best sellers) ranking has real counts to
     * sort by. They are never published or shown as public invitations.
     */
    private function seedDemoInvitations(Template $template, ThemeVersion $themeVersion, int $count): void
    {
        $templateVersion = $template->versions()->first();
        $existing = $template->invitations()->count();

        if ($existing >= $count) {
            return;
        }

        $seeder = User::firstOrCreate(
            ['email' => 'seed-demo@undangan-digital.link'],
            ['name' => 'Seed Demo', 'password' => Hash::make(Str::random(32)), 'role' => 'customer'],
        );

        for ($i = $existing; $i < $count; $i++) {
            Invitation::create([
                'user_id' => $seeder->id,
                'slug' => $template->slug.'-demo-'.$i,
                'template_id' => $template->id,
                'template_version_id' => $templateVersion->id,
                'theme_id' => $themeVersion->theme_id,
                'theme_version_id' => $themeVersion->id,
                'status' => 'unpublished',
            ]);
        }
    }
}
