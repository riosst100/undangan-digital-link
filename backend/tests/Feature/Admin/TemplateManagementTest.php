<?php

namespace Tests\Feature\Admin;

use App\Models\Invitation;
use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Theme;
use App\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function customer(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    public function test_customer_cannot_manage_templates(): void
    {
        $this->actingAs($this->customer())
            ->getJson('/api/admin/templates')
            ->assertStatus(403);

        $this->actingAs($this->customer())
            ->postJson('/api/admin/templates', ['name' => 'x'])
            ->assertStatus(403);
    }

    public function test_admin_can_create_template_with_initial_published_version(): void
    {
        $response = $this->actingAs($this->admin())->postJson('/api/admin/templates', [
            'name' => 'Rustic Charm',
            'slug' => 'rustic-charm',
            'description' => 'A rustic wedding invitation.',
            'price' => 120_000,
            'tier' => 'standard',
            'sections' => [
                ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true],
                ['type' => 'couple', 'variant' => 'classic', 'enabled' => true],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Rustic Charm');
        $response->assertJsonPath('data.latest_version.status', 'published');
        $response->assertJsonPath('data.latest_version.version', 1);

        $this->assertDatabaseHas('templates', ['slug' => 'rustic-charm']);
        $this->assertDatabaseHas('template_versions', ['version' => 1, 'status' => 'published']);
    }

    public function test_creating_template_rejects_unknown_variant(): void
    {
        $response = $this->actingAs($this->admin())->postJson('/api/admin/templates', [
            'name' => 'Malicious',
            'slug' => 'malicious',
            'price' => 0,
            'tier' => 'standard',
            'sections' => [
                ['type' => 'cover', 'variant' => 'not-a-real-variant', 'enabled' => true],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('templates', ['slug' => 'malicious']);
    }

    public function test_creating_template_rejects_unknown_section_type(): void
    {
        $response = $this->actingAs($this->admin())->postJson('/api/admin/templates', [
            'name' => 'Malicious',
            'slug' => 'malicious-2',
            'price' => 0,
            'tier' => 'standard',
            'sections' => [
                ['type' => 'hacked_section', 'variant' => 'fullscreen', 'enabled' => true],
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_soft_delete_template(): void
    {
        $template = Template::create(['name' => 'To Delete', 'slug' => 'to-delete']);

        $this->actingAs($this->admin())
            ->deleteJson("/api/admin/templates/{$template->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('templates', ['id' => $template->id]);
    }

    public function test_deleting_template_still_used_by_an_invitation_soft_deletes_without_error(): void
    {
        $template = Template::create(['name' => 'In Use', 'slug' => 'in-use']);
        $templateVersion = TemplateVersion::create([
            'template_id' => $template->id,
            'version' => 1,
            'schema' => ['name' => 'In Use', 'version' => 1, 'sections' => []],
            'status' => 'published',
        ]);
        $theme = Theme::create(['name' => 'T', 'slug' => 'theme-in-use']);
        $themeVersion = ThemeVersion::create([
            'theme_id' => $theme->id,
            'version' => 1,
            'tokens' => ['name' => 'T', 'version' => 1],
            'status' => 'published',
        ]);
        Invitation::create([
            'user_id' => $this->customer()->id,
            'slug' => 'inv-in-use',
            'template_id' => $template->id,
            'template_version_id' => $templateVersion->id,
            'theme_id' => $theme->id,
            'theme_version_id' => $themeVersion->id,
            'status' => 'draft',
        ]);

        $this->actingAs($this->admin())
            ->deleteJson("/api/admin/templates/{$template->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('templates', ['id' => $template->id]);
        $this->assertDatabaseHas('invitations', ['slug' => 'inv-in-use']);
    }
}
