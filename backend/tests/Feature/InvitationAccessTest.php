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

class InvitationAccessTest extends TestCase
{
    use RefreshDatabase;

    private function makeInvitation(User $owner): Invitation
    {
        $template = Template::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $templateVersion = TemplateVersion::create([
            'template_id' => $template->id,
            'version' => 1,
            'schema' => ['name' => 'Test', 'version' => 1, 'sections' => []],
            'status' => 'published',
        ]);

        $theme = Theme::create(['name' => 'Test', 'slug' => 'test-'.uniqid()]);
        $themeVersion = ThemeVersion::create([
            'theme_id' => $theme->id,
            'version' => 1,
            'tokens' => ['name' => 'Test', 'version' => 1],
            'status' => 'published',
        ]);

        return Invitation::create([
            'user_id' => $owner->id,
            'slug' => 'invitation-'.uniqid(),
            'template_id' => $template->id,
            'template_version_id' => $templateVersion->id,
            'theme_id' => $theme->id,
            'theme_version_id' => $themeVersion->id,
            'status' => 'draft',
        ]);
    }

    public function test_customer_cannot_view_another_customers_invitation(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $intruder = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);

        $this->actingAs($intruder)
            ->getJson("/api/customer/invitations/{$invitation->id}")
            ->assertStatus(403);
    }

    public function test_customer_cannot_update_another_customers_invitation(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $intruder = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);

        $this->actingAs($intruder)
            ->patchJson("/api/customer/invitations/{$invitation->id}", ['slug' => 'hijacked'])
            ->assertStatus(403);
    }

    public function test_owner_can_view_their_own_invitation(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);

        $this->actingAs($owner)
            ->getJson("/api/customer/invitations/{$invitation->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $invitation->id);
    }
}
