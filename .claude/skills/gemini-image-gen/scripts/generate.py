#!/usr/bin/env python3
"""Generate images using Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview)."""

import argparse
import base64
import json
import os
import sys
import urllib.request
import urllib.error

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"


def generate_image(prompt: str, output_path: str, aspect_ratio: str = "1:1") -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    req = urllib.request.Request(
        f"{API_URL}?key={api_key}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"ERROR: API returned {e.code}: {body}", file=sys.stderr)
        sys.exit(1)

    # Extract image and text from response
    text_parts = []
    image_saved = False

    for candidate in result.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            if "text" in part:
                text_parts.append(part["text"])
            elif "inlineData" in part:
                img_data = base64.b64decode(part["inlineData"]["data"])
                with open(output_path, "wb") as f:
                    f.write(img_data)
                image_saved = True

    if text_parts:
        print("\n".join(text_parts))

    if image_saved:
        print(f"Image saved to: {output_path}")
    else:
        print("ERROR: No image returned in response", file=sys.stderr)
        print(f"Full response: {json.dumps(result, indent=2)}", file=sys.stderr)
        sys.exit(1)

    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate images with Nano Banana 2")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument("-o", "--output", default="generated.png", help="Output file path (default: generated.png)")
    parser.add_argument("--aspect-ratio", default="1:1", help="Aspect ratio (default: 1:1, options: 1:1, 16:9, 9:16, 4:3, 3:4)")
    args = parser.parse_args()

    generate_image(args.prompt, args.output, args.aspect_ratio)
