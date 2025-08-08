#!/usr/bin/env python3
import os
import json
import random
import string
import multiprocessing
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps

# Compression settings
MAX_DIMENSION = 800   # Maximum width or height - optimized for desktop viewing with better sharpness
WEBP_QUALITY = 70     # WebP compression quality (1-100) - balanced quality/size
NUM_WORKERS = min(8, multiprocessing.cpu_count())  # Parallel processing workers

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
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)) + '.webp'

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
        
        # Convert to RGBA for WebP (preserves transparency if present)
        if img.mode not in ('RGB', 'RGBA'):
            if img.mode in ('RGBA', 'LA') or 'transparency' in img.info:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')
        
        # Save as WebP with compression
        img.save(output_path, 'WebP', quality=quality, optimize=True)
        
        return new_width, new_height, original_width, original_height

def process_single_image(args):
    """Process a single image - designed for multiprocessing"""
    filename, images_dir, compressed_dir, compressed_filename = args
    
    try:
        filepath = os.path.join(images_dir, filename)
        compressed_path = os.path.join(compressed_dir, compressed_filename)
        
        # Compress the image
        new_width, new_height, orig_width, orig_height = compress_image(
            filepath, compressed_path, MAX_DIMENSION, WEBP_QUALITY
        )
        
        # Calculate compression ratio
        orig_size = os.path.getsize(filepath)
        new_size = os.path.getsize(compressed_path)
        compression_ratio = ((orig_size - new_size) / orig_size) * 100
        
        print(f"✅ {filename} -> {compressed_filename}")
        print(f"   📏 {orig_width}x{orig_height} -> {new_width}x{new_height}")
        print(f"   📦 {orig_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB ({compression_ratio:.1f}% smaller)")
        
        return {
            'filename': compressed_filename,
            'width': new_width,
            'height': new_height
        }
        
    except Exception as e:
        print(f"❌ Error processing {filename}: {e}")
        return {
            'filename': compressed_filename,
            'width': 800,
            'height': 1000
        }

def get_image_dimensions(images_dir):
    results = []
    
    # Create compressed folder if it doesn't exist - now in public/compressed
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    compressed_dir = os.path.join(script_dir, 'public', 'compressed')
    if not os.path.exists(compressed_dir):
        os.makedirs(compressed_dir)
        print(f"📁 Created compressed folder: {compressed_dir}")
    
    # Get list of files and shuffle them for random processing order
    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif'))]
    random.shuffle(image_files)
    
    # Pre-generate unique filenames to avoid collision checking
    used_filenames = set(os.listdir(compressed_dir)) if os.path.exists(compressed_dir) else set()
    compressed_filenames = []
    for _ in image_files:
        while True:
            filename = generate_random_filename()
            if filename not in used_filenames:
                used_filenames.add(filename)
                compressed_filenames.append(filename)
                break
    
    # Prepare arguments for parallel processing
    process_args = [(filename, images_dir, compressed_dir, compressed_filename) 
                   for filename, compressed_filename in zip(image_files, compressed_filenames)]
    
    # Process images in parallel
    print(f"🚀 Processing {len(image_files)} images with {NUM_WORKERS} workers...")
    with ProcessPoolExecutor(max_workers=NUM_WORKERS) as executor:
        results = list(executor.map(process_single_image, process_args))
    
    # Filter out None results (failed processing)
    results = [r for r in results if r is not None]
    
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