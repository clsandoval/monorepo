---
name: gemini-image-gen
description: Generate images using Google's Nano Banana 2 model (Gemini 3.1 Flash Image Preview). Use when the user asks to generate, create, or make an image, picture, icon, asset, illustration, or visual. Triggers on "generate an image", "make me a picture", "create art", "image gen", "nano banana", or any request for AI-generated visuals.
---

Generate images via Nano Banana 2 by running the bundled script:

```bash
python3 scripts/generate.py "your prompt here" -o output.png
```

Options:
- `-o / --output` — file path for the generated image (default: `generated.png`)
- `--aspect-ratio` — `1:1`, `16:9`, `9:16`, `4:3`, `3:4` (default: `1:1`)

Requires `GEMINI_API_KEY` environment variable.

## Usage

1. Craft a detailed prompt describing the desired image — be specific about style, composition, lighting, and subject
2. Run the script with `python3 <skill-path>/scripts/generate.py "<prompt>" -o <output-path>`
3. Read the output image to verify quality, then iterate on the prompt if needed

## Prompt Tips

- Be specific: "a watercolor painting of a mountain village at sunset with warm amber light" beats "mountain village"
- Include style: photorealistic, watercolor, pixel art, vector illustration, oil painting, 3D render, etc.
- Include composition details: camera angle, lighting, depth of field, background
- For game assets: specify transparency needs, resolution, and whether it's a sprite, tile, icon, or scene
