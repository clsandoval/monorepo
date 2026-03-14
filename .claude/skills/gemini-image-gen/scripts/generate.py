#!/usr/bin/env python3
"""Generate images using Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview)."""

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.request
import urllib.error

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"

MIME_MAP = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


def load_reference_image(path: str) -> dict:
    """Load an image file and return a Gemini API inline data part."""
    ext = os.path.splitext(path)[1].lower()
    mime_type = MIME_MAP.get(ext)
    if not mime_type:
        mime_type = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return {"inlineData": {"mimeType": mime_type, "data": data}}


def generate_image(prompt: str, output_path: str, reference_images: list[str] | None = None) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    # Build parts: reference images first, then the text prompt
    parts = []
    if reference_images:
        for i, ref_path in enumerate(reference_images):
            if not os.path.exists(ref_path):
                print(f"ERROR: Reference image not found: {ref_path}", file=sys.stderr)
                sys.exit(1)
            parts.append(load_reference_image(ref_path))
            print(f"Loaded reference image {i+1}: {ref_path}")
    parts.append({"text": prompt})

    payload = {
        "contents": [{"parts": parts}],
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
    parser.add_argument("-r", "--reference", action="append", dest="references", metavar="IMAGE",
                        help="Reference image(s) for style consistency. Can be specified multiple times.")
    args = parser.parse_args()

    generate_image(args.prompt, args.output, args.references)
