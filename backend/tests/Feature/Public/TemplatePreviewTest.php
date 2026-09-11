<?php

namespace Tests\Feature\Public;

use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplatePreviewTest extends TestCase
{
    use RefreshDatabase;

    private function makeTemplateWithTheme(array $templateAttrs = [], bool $withTheme = true): Template
    {
        $template = Template::create(array_merge([
            'name' => 'Preview Demo',
            'slug' => 'preview-demo',
            'is_active' => true,
        ], $templateAttrs));

        TemplateVersion::create([
            'template_id' => $template->id,
            'version' => 1,
            'schema' => [
                'name' => $template->name,
                'version' => 1,
                'sections' => [
                    ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true],
                ],
            ],
            'status' => 'published',
        ]);

        if ($withTheme) {
            $theme = Theme::create(['name' => $template->name, 'slug' => $template->slug, 'is_active' => true]);
            ThemeVersion::create([
                'theme_id' => $theme->id,
                'version' => 1,
                'tokens' => [
                    'name' => $template->name,
                    'version' => 1,
                    'colors' => [
                        'primary' => '#C9A86A', 'secondary' => '#E8DCC8', 'background' => '#FBF7F0',
                        'surface' => '#FFFFFF', 'text' => '#302C27', 'muted' => '#81786E',
                    ],
                    'typography' => ['heading' => 'Playfair Display', 'body' => 'Inter'],
                    'animations' => ['preset' => 'fade-up'],
                ],
                'status' => 'published',
            ]);
        }

        return $template;
    }

    public function test_returns_sections_and_theme_for_active_template(): void
    {
        $this->makeTemplateWithTheme();

        $response = $this->getJson('/api/public/templates/preview-demo')->assertStatus(200);

        $response->assertJsonPath('data.name', 'Preview Demo');
        $response->assertJsonPath('data.sections.0.type', 'cover');
        $response->assertJsonPath('data.theme.colors.primary', '#C9A86A');
        $response->assertJsonPath('data.theme.animations.preset', 'fade-up');
    }

    public function test_returns_404_for_unknown_slug(): void
    {
        $this->getJson('/api/public/templates/does-not-exist')->assertStatus(404);
    }

    public function test_returns_404_for_inactive_template(): void
    {
        $this->makeTemplateWithTheme(['is_active' => false]);

        $this->getJson('/api/public/templates/preview-demo')->assertStatus(404);
    }

    public function test_returns_404_when_template_has_no_theme(): void
    {
        $this->makeTemplateWithTheme(withTheme: false);

        $this->getJson('/api/public/templates/preview-demo')->assertStatus(404);
    }
}
