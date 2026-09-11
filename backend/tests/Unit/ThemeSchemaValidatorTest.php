<?php

namespace Tests\Unit;

use App\Services\Templates\ThemeSchemaValidator;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ThemeSchemaValidatorTest extends TestCase
{
    private function validConfig(): array
    {
        return [
            'name' => 'Elegant Gold',
            'colors' => [
                'primary' => '#C9A86A',
                'secondary' => '#E8DCC8',
                'background' => '#FBF7F0',
                'surface' => '#FFFFFF',
                'text' => '#302C27',
                'muted' => '#81786E',
            ],
            'typography' => ['heading' => 'Playfair Display', 'body' => 'Inter'],
            'animations' => ['preset' => 'fade-up'],
        ];
    }

    public function test_valid_config_passes(): void
    {
        $config = $this->validConfig();

        $this->assertSame($config, (new ThemeSchemaValidator())->validate($config));
    }

    public function test_invalid_hex_color_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        $config = $this->validConfig();
        $config['colors']['primary'] = 'not-a-color';

        (new ThemeSchemaValidator())->validate($config);
    }

    public function test_disallowed_font_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        $config = $this->validConfig();
        $config['typography']['heading'] = 'Comic Sans MS';

        (new ThemeSchemaValidator())->validate($config);
    }

    public function test_disallowed_animation_preset_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        $config = $this->validConfig();
        $config['animations']['preset'] = 'explode';

        (new ThemeSchemaValidator())->validate($config);
    }
}
