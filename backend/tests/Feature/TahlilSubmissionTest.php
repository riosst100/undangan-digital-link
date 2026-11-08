<?php

namespace Tests\Feature;

use App\Models\TahlilSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TahlilSubmissionTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return [
            'contact_phone' => '+62 812-3456-7890',
            'event_name' => 'Tahlil 100 Hari',
            'deceased_gender' => 'P',
            'deceased_name' => 'Ibu Tarsem',
            'parent_name' => 'Surma (Gandamisastra)',
            'guest_salutation' => 'Bapak/Saudara',
            'date' => '2026-11-08',
            'time' => '16:00',
            'timezone' => 'WIB',
            'time_note' => 'Ba’da Ashar',
            'venue' => "Rumah Almh. Ibu Tarsem\nDesa Tiwulandu RT 02/RW 01",
            'host' => 'Bpk Kono - Ibu Tuti',
            'no_gifts' => true,
            'guests' => ['  Bapak Ahmad ', '', 'Ibu Siti'],
            ...$overrides,
        ];
    }

    private function submission(array $overrides = []): TahlilSubmission
    {
        $data = $this->payload($overrides);
        $data['contact_phone'] = '081234567890';

        return TahlilSubmission::create([...$data, 'status' => 'baru']);
    }

    public function test_visitor_can_submit_without_login_and_data_is_normalised(): void
    {
        $response = $this->postJson('/api/public/tahlil-submissions', $this->payload())
            ->assertCreated()
            ->assertJsonStructure(['success', 'data' => ['id']]);

        $submission = TahlilSubmission::findOrFail($response->json('data.id'));
        $this->assertSame('081234567890', $submission->contact_phone);
        $this->assertSame('baru', $submission->status);
        $this->assertSame(['Bapak Ahmad', 'Ibu Siti'], $submission->guests);
        $this->assertSame('2026-11-08', $submission->date->format('Y-m-d'));
    }

    public function test_submission_requires_a_valid_whatsapp_number(): void
    {
        $this->postJson('/api/public/tahlil-submissions', $this->payload(['contact_phone' => '12345']))
            ->assertStatus(422)
            ->assertJson(['message' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.']);

        $this->postJson('/api/public/tahlil-submissions', $this->payload(['contact_phone' => null]))
            ->assertStatus(422);

        $this->assertSame(0, TahlilSubmission::count());
    }

    public function test_public_submission_has_a_smaller_guest_cap(): void
    {
        $guests = array_map(fn ($i) => "Tamu {$i}", range(1, 51));

        $this->postJson('/api/public/tahlil-submissions', $this->payload(['guests' => $guests]))
            ->assertStatus(422);
    }

    public function test_public_submission_is_throttled(): void
    {
        $invalid = $this->payload(['date' => 'bukan-tanggal']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/public/tahlil-submissions', $invalid)->assertStatus(422);
        }

        $this->postJson('/api/public/tahlil-submissions', $invalid)->assertStatus(429);
    }

    public function test_only_admin_can_access_submissions(): void
    {
        $submission = $this->submission();
        $customer = User::factory()->create(['role' => 'customer']);

        $this->getJson('/api/admin/tahlil-submissions')->assertStatus(401);
        $this->actingAs($customer)->getJson('/api/admin/tahlil-submissions')->assertStatus(403);
        $this->actingAs($customer)->getJson("/api/admin/tahlil-submissions/{$submission->id}/pdf")->assertStatus(403);
    }

    public function test_admin_can_list_filter_and_view_submissions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $first = $this->submission(['deceased_name' => 'Ibu Tarsem']);
        $this->submission(['deceased_name' => 'Bapak Darmo'])->update(['status' => 'selesai']);

        $this->actingAs($admin)->getJson('/api/admin/tahlil-submissions')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($admin)->getJson('/api/admin/tahlil-submissions?status=selesai')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.deceased_name', 'Bapak Darmo');

        $this->actingAs($admin)->getJson("/api/admin/tahlil-submissions/{$first->id}")
            ->assertOk()
            ->assertJsonPath('data.contact_phone', '081234567890')
            ->assertJsonPath('data.date', '2026-11-08')
            ->assertJsonPath('data.guests', ['Bapak Ahmad', 'Ibu Siti']);

        $this->actingAs($admin)->getJson('/api/admin/tahlil-submissions/not-a-uuid')->assertNotFound();
    }

    public function test_admin_can_edit_submission_and_download_its_pdf(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $submission = $this->submission();

        $this->actingAs($admin)
            ->patchJson("/api/admin/tahlil-submissions/{$submission->id}", $this->payload([
                'deceased_name' => 'Ibu Tarsem Binti',
                'guests' => [],
                'status' => 'diproses',
            ]))
            ->assertOk()
            ->assertJsonPath('data.deceased_name', 'Ibu Tarsem Binti')
            ->assertJsonPath('data.status', 'diproses');

        $this->actingAs($admin)
            ->patchJson("/api/admin/tahlil-submissions/{$submission->id}", $this->payload(['status' => 'arsip']))
            ->assertStatus(422);

        $response = $this->actingAs($admin)
            ->get("/api/admin/tahlil-submissions/{$submission->id}/pdf")
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertStringContainsString('undangan-tahlil-100-hari-ibu-tarsem-binti.pdf', $response->headers->get('Content-Disposition'));
    }

    public function test_admin_can_delete_submission(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $submission = $this->submission();

        $this->actingAs($admin)->deleteJson("/api/admin/tahlil-submissions/{$submission->id}")->assertOk();

        $this->assertNull(TahlilSubmission::find($submission->id));
    }
}
