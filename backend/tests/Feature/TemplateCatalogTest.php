<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function makeTemplate(array $attrs, int $invitationCount = 0): Template
    {
        $template = Template::create(array_merge([
            'name' => 'Test Template',
            'slug' => 'test-'.uniqid(),
            'is_active' => true,
            'price' => 100_000,
            'tier' => 'standard',
        ], $attrs));

        $templateVersion = TemplateVersion::create([
            'template_id' => $template->id,
            'version' => 1,
            'schema' => ['name' => $template->name, 'version' => 1, 'sections' => []],
            'status' => 'published',
        ]);

        $theme = Theme::create(['name' => 'Test', 'slug' => 'test-theme-'.uniqid()]);
        $themeVersion = ThemeVersion::create([
            'theme_id' => $theme->id,
            'version' => 1,
            'tokens' => ['name' => 'Test', 'version' => 1],
            'status' => 'published',
        ]);

        if ($invitationCount > 0) {
            $owner = User::factory()->create(['role' => 'customer']);

            for ($i = 0; $i < $invitationCount; $i++) {
                Invitation::create([
                    'user_id' => $owner->id,
                    'slug' => $template->slug.'-inv-'.$i,
                    'template_id' => $template->id,
                    'template_version_id' => $templateVersion->id,
                    'theme_id' => $theme->id,
                    'theme_version_id' => $themeVersion->id,
                    'status' => 'draft',
                ]);
            }
        }

        return $template;
    }

    public function test_all_designs_lists_active_templates_newest_first(): void
    {
        $older = $this->makeTemplate(['name' => 'Older Design']);
        $older->forceFill(['created_at' => now()->subDay()])->save();
        $newer = $this->makeTemplate(['name' => 'Newer Design']);
        $this->makeTemplate(['name' => 'Inactive One', 'is_active' => false]);

        $response = $this->getJson('/api/public/templates/catalog')->assertStatus(200);

        $response->assertJsonPath('data.all.0.id', $newer->id);
        $response->assertJsonMissingPath('data.newest');
        $response->assertJsonMissingPath('data.best_sellers');

        $names = collect($response->json('data.all'))->pluck('name');
        $this->assertNotContains('Inactive One', $names);
    }

    public function test_exclusive_is_ordered_by_fewest_uses_first(): void
    {
        $heavilyUsed = $this->makeTemplate(['name' => 'Popular Exclusive', 'tier' => 'exclusive'], invitationCount: 5);
        $rare = $this->makeTemplate(['name' => 'Rare Exclusive', 'tier' => 'exclusive'], invitationCount: 0);
        $this->makeTemplate(['name' => 'Standard One', 'tier' => 'standard']);

        $response = $this->getJson('/api/public/templates/catalog')->assertStatus(200);

        $response->assertJsonPath('data.exclusive.0.id', $rare->id);
        $response->assertJsonPath('data.exclusive.1.id', $heavilyUsed->id);
    }
}
