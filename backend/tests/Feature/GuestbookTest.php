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

class GuestbookTest extends TestCase
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

    public function test_owner_can_add_rename_list_and_delete_guests(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);

        $guestId = $this->actingAs($owner)
            ->postJson("/api/customer/invitations/{$invitation->id}/guests", ['name' => 'Budi'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Budi')
            ->json('data.id');

        $this->patchJson("/api/customer/invitations/{$invitation->id}/guests/{$guestId}", ['name' => 'Budi Santoso'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Budi Santoso');

        $this->getJson("/api/customer/invitations/{$invitation->id}/guests")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Budi Santoso');

        $this->deleteJson("/api/customer/invitations/{$invitation->id}/guests/{$guestId}")
            ->assertStatus(204);

        $this->getJson("/api/customer/invitations/{$invitation->id}/guests")
            ->assertJsonCount(0, 'data');
    }

    public function test_customer_cannot_touch_another_customers_guests(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $intruder = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);
        $guest = $invitation->guests()->create(['name' => 'Budi']);

        $this->actingAs($intruder)
            ->getJson("/api/customer/invitations/{$invitation->id}/guests")
            ->assertStatus(403);

        $this->postJson("/api/customer/invitations/{$invitation->id}/guests", ['name' => 'X'])
            ->assertStatus(403);

        $this->patchJson("/api/customer/invitations/{$invitation->id}/guests/{$guest->id}", ['name' => 'X'])
            ->assertStatus(403);
    }

    public function test_guest_must_belong_to_the_invitation_in_the_url(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $mine = $this->makeInvitation($owner);
        $other = $this->makeInvitation(User::factory()->create(['role' => 'customer']));
        $foreignGuest = $other->guests()->create(['name' => 'Budi']);

        $this->actingAs($owner)
            ->patchJson("/api/customer/invitations/{$mine->id}/guests/{$foreignGuest->id}", ['name' => 'X'])
            ->assertStatus(404);
    }

    public function test_owner_can_save_share_message(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $invitation = $this->makeInvitation($owner);

        $this->actingAs($owner)
            ->patchJson("/api/customer/invitations/{$invitation->id}", [
                'share_template' => 'pernikahan_muslim',
                'share_message' => 'Halo {nama_tamu}',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.share_template', 'pernikahan_muslim')
            ->assertJsonPath('data.share_message', 'Halo {nama_tamu}');
    }
}
