#!/usr/bin/env python3
import os
import json
import random
import string
from PIL import Image, ImageOps

# Compression settings
MAX_DIMENSION = 1920  # Maximum width or height
JPEG_QUALITY = 85     # JPEG compression quality (1-100)

def clean_old_data(script_dir):
    """Remove old generated files to ensure fresh start with new images"""
    files_to_clean = [
        os.path.join(script_dir, 'image_dimensions.json'),
        os.path.join(script_dir, '..', 'src', 'data', 'generated-images.ts')
    ]
    
    for file_path in files_to_clean:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🗑️  Removed old file: {os.path.basename(file_path)}")

def generate_random_filename():
    """Generate a random filename with 8 characters"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)) + '.jpg'

def calculate_new_dimensions(width, height, max_dimension):
    """Calculate new dimensions while preserving aspect ratio"""
    if width <= max_dimension and height <= max_dimension:
        return width, height
    
    # Calculate scaling factor to fit within max_dimension
    scale_factor = min(max_dimension / width, max_dimension / height)
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    
    return new_width, new_height

def compress_image(filepath, output_path, max_dimension, quality):
    """Compress image while maintaining aspect ratio and proper orientation"""
    with Image.open(filepath) as img:
        # Apply EXIF orientation to get the correct orientation
        # This ensures the image is displayed as intended by the camera
        img = ImageOps.exif_transpose(img)
        
        # Get dimensions after orientation correction
        original_width, original_height = img.size
        
        # Calculate new dimensions
        new_width, new_height = calculate_new_dimensions(original_width, original_height, max_dimension)
        
        # Only resize if needed
        if new_width != original_width or new_height != original_height:
            # Use high-quality resampling
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to RGB if needed (for JPEG output)
        if img.mode in ('RGBA', 'P', 'LA'):
            # Create white background for transparent images
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save as JPEG with compression
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
        
        return new_width, new_height, original_width, original_height

def get_image_dimensions(images_dir):
    results = []
    
    # Create compressed folder if it doesn't exist
    compressed_dir = os.path.join(images_dir, 'compressed')
    if not os.path.exists(compressed_dir):
        os.makedirs(compressed_dir)
        print(f"📁 Created compressed folder: {compressed_dir}")
    
    # Get list of files and shuffle them for random processing order
    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
    random.shuffle(image_files)
    
    for filename in image_files:
        try:
            filepath = os.path.join(images_dir, filename)
            
            # Generate random filename for compressed image
            compressed_filename = generate_random_filename()
            compressed_path = os.path.join(compressed_dir, compressed_filename)
            
            # Make sure the random filename is unique
            while os.path.exists(compressed_path):
                compressed_filename = generate_random_filename()
                compressed_path = os.path.join(compressed_dir, compressed_filename)
            
            # Compress the image
            new_width, new_height, orig_width, orig_height = compress_image(
                filepath, compressed_path, MAX_DIMENSION, JPEG_QUALITY
            )
            
            # Calculate compression ratio
            orig_size = os.path.getsize(filepath)
            new_size = os.path.getsize(compressed_path)
            compression_ratio = ((orig_size - new_size) / orig_size) * 100
            
            results.append({
                'filename': compressed_filename,
                'width': new_width,
                'height': new_height
            })
            
            print(f"✅ {filename} -> {compressed_filename}")
            print(f"   📏 {orig_width}x{orig_height} -> {new_width}x{new_height}")
            print(f"   📦 {orig_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB ({compression_ratio:.1f}% smaller)")
            
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
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
    
    # Clean old data first
    clean_old_data(script_dir)
    
    dimensions = get_image_dimensions(images_dir)
    
    # Output to JSON for the Node.js script to use
    output_file = os.path.join(script_dir, 'image_dimensions.json')
    with open(output_file, 'w') as f:
        json.dump(dimensions, f, indent=2)
    
    print(f"\n✅ Saved dimensions to {output_file}")