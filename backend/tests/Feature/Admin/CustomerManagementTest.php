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

class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_list_customers(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/admin/customers')
            ->assertStatus(403);
    }

    public function test_admin_can_list_customers_with_invitation_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customerWithInvitation = User::factory()->create(['role' => 'customer', 'name' => 'Has Invitation']);
        $customerWithoutInvitation = User::factory()->create(['role' => 'customer', 'name' => 'No Invitation']);

        $template = Template::create(['name' => 'T', 'slug' => 'cust-mgmt-template']);
        $templateVersion = TemplateVersion::create([
            'template_id' => $template->id,
            'version' => 1,
            'schema' => ['name' => 'T', 'version' => 1, 'sections' => []],
            'status' => 'published',
        ]);
        $theme = Theme::create(['name' => 'T', 'slug' => 'cust-mgmt-theme']);
        $themeVersion = ThemeVersion::create([
            'theme_id' => $theme->id,
            'version' => 1,
            'tokens' => ['name' => 'T', 'version' => 1],
            'status' => 'published',
        ]);

        Invitation::create([
            'user_id' => $customerWithInvitation->id,
            'slug' => 'cust-mgmt-invitation',
            'template_id' => $template->id,
            'template_version_id' => $templateVersion->id,
            'theme_id' => $theme->id,
            'theme_version_id' => $themeVersion->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/customers')->assertStatus(200);

        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['name' => 'Has Invitation', 'invitations_count' => 1]);
        $response->assertJsonFragment(['name' => 'No Invitation', 'invitations_count' => 0]);

        // Admin themselves must not appear in the customer list.
        $names = collect($response->json('data'))->pluck('name');
        $this->assertNotContains($admin->name, $names);
    }
}
