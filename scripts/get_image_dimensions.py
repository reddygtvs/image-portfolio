#!/usr/bin/env python3
import os
import json
from PIL import Image

def get_image_dimensions(images_dir):
    results = []
    
    for filename in sorted(os.listdir(images_dir)):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
            try:
                filepath = os.path.join(images_dir, filename)
                with Image.open(filepath) as img:
                    width, height = img.size
                    results.append({
                        'filename': filename,
                        'width': width,
                        'height': height
                    })
                    print(f"✅ {filename}: {width}x{height}")
            except Exception as e:
                print(f"❌ Error reading {filename}: {e}")
                # Use default dimensions for failed images
                results.append({
                    'filename': filename,
                    'width': 800,
                    'height': 1000
                })
    
    return results

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(script_dir, '..', 'public', 'images')
    
    dimensions = get_image_dimensions(images_dir)
    
    # Output to JSON for the Node.js script to use
    output_file = os.path.join(script_dir, 'image_dimensions.json')
    with open(output_file, 'w') as f:
        json.dump(dimensions, f, indent=2)
    
    print(f"\n✅ Saved dimensions to {output_file}")