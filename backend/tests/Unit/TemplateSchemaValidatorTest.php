<?php

namespace Tests\Unit;

use App\Services\Templates\TemplateSchemaValidator;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class TemplateSchemaValidatorTest extends TestCase
{
    public function test_valid_config_passes(): void
    {
        $validator = new TemplateSchemaValidator();

        $config = [
            'name' => 'Elegant Gold',
            'version' => 1,
            'sections' => [
                ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true, 'settings' => ['columns' => 2]],
            ],
        ];

        $this->assertSame($config, $validator->validate($config));
    }

    public function test_unknown_section_type_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        (new TemplateSchemaValidator())->validate([
            'name' => 'Malicious',
            'sections' => [
                ['type' => 'hacked_section', 'variant' => 'fullscreen', 'enabled' => true],
            ],
        ]);
    }

    public function test_unknown_variant_for_known_type_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        (new TemplateSchemaValidator())->validate([
            'name' => 'Malicious',
            'sections' => [
                ['type' => 'cover', 'variant' => 'evil-injected-variant', 'enabled' => true],
            ],
        ]);
    }

    public function test_non_primitive_settings_are_rejected(): void
    {
        $this->expectException(ValidationException::class);

        (new TemplateSchemaValidator())->validate([
            'name' => 'Malicious',
            'sections' => [
                ['type' => 'cover', 'variant' => 'fullscreen', 'enabled' => true, 'settings' => ['nested' => ['a' => 1]]],
            ],
        ]);
    }
}
