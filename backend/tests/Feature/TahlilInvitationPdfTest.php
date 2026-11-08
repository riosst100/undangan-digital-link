<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Pdf\TahlilInvitationPdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TahlilInvitationPdfTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return [
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
            ...$overrides,
        ];
    }

    private function pageCount(string $pdf): int
    {
        return preg_match_all('#/Type\s*/Page[^s]#', $pdf);
    }

    public function test_guest_cannot_generate_pdf(): void
    {
        $this->postJson('/api/admin/tahlil-invitations/pdf', $this->payload())
            ->assertStatus(401);
    }

    public function test_customer_cannot_generate_pdf(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload())
            ->assertStatus(403);
    }

    public function test_admin_gets_single_page_pdf_without_guests(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload())
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertSame(1, $this->pageCount($response->getContent()));
        $this->assertStringContainsString('undangan-tahlil-100-hari-ibu-tarsem.pdf', $response->headers->get('Content-Disposition'));
    }

    public function test_one_page_is_rendered_per_guest_and_blank_names_are_skipped(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload([
                'guests' => ['Bapak Ahmad', '', 'Ibu Siti', 'Keluarga Darmaji'],
            ]))
            ->assertOk();

        $this->assertSame(3, $this->pageCount($response->getContent()));
    }

    public function test_validation_rejects_bad_input(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload(['venue' => "a\nb\nc"]))
            ->assertStatus(422)
            ->assertJson(['success' => false, 'message' => 'Tempat maksimal 2 baris.']);

        $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload(['date' => '08-11-2026']))
            ->assertStatus(422);

        $this->actingAs($user)
            ->postJson('/api/admin/tahlil-invitations/pdf', $this->payload(['deceased_gender' => 'X']))
            ->assertStatus(422);
    }

    public function test_view_data_formats_indonesian_date_and_lineage(): void
    {
        $data = app(TahlilInvitationPdf::class)->viewData($this->payload());

        $this->assertSame('Almh.', $data['deceasedTitle']);
        $this->assertSame('Binti Surma (Gandamisastra)', $data['lineage']);
        $this->assertSame('Minggu', $data['day']);
        $this->assertSame('8 November 2026', $data['date']);
        $this->assertSame('16.00 WIB (Ba’da Ashar)', $data['time']);
        $this->assertSame(['Rumah Almh. Ibu Tarsem', 'Desa Tiwulandu RT 02/RW 01'], $data['venueLines']);

        $male = app(TahlilInvitationPdf::class)->viewData($this->payload([
            'deceased_gender' => 'L', 'parent_name' => null, 'time_note' => null,
        ]));

        $this->assertSame('Alm.', $male['deceasedTitle']);
        $this->assertNull($male['lineage']);
        $this->assertSame('16.00 WIB', $male['time']);
    }
}
