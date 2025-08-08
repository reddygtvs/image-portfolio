#!/usr/bin/env python3
import os
import random
import string
from PIL import Image, ImageOps

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
        img = ImageOps.exif_transpose(img)
        
        # Get original dimensions
        original_width, original_height = img.size
        
        # Calculate new dimensions
        new_width, new_height = calculate_new_dimensions(original_width, original_height, max_dimension)
        
        # Resize image if needed
        if new_width != original_width or new_height != original_height:
            img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Save as WebP
        img.save(output_path, 'WEBP', quality=quality, method=6)
        
        return original_width, original_height, new_width, new_height

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def get_file_size_kb(filepath):
    """Get file size in KB"""
    return os.path.getsize(filepath) / 1024

def main():
    # Test settings
    test_images_dir = "/Users/tushar/repos/image-portfolio/public/images"
    test_output_dir = "/Users/tushar/repos/image-portfolio/test_compression"
    
    # Create test output directory
    os.makedirs(test_output_dir, exist_ok=True)
    
    # Get first 20 images for testing
    all_images = [f for f in os.listdir(test_images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    test_images = all_images[:20]
    
    # Test configurations - comparing 600px vs 700px at different qualities
    current_config = {"max_dim": 600, "quality": 75}  # Current 600px settings
    test_configs = [
        {"max_dim": 600, "quality": 70},
        {"max_dim": 600, "quality": 75},
        {"max_dim": 600, "quality": 80},
        {"max_dim": 700, "quality": 70},
        {"max_dim": 700, "quality": 75},
        {"max_dim": 700, "quality": 80},
    ]
    
    print("🧪 Testing compression on 20 images...")
    print(f"📁 Test images: {len(test_images)} files")
    print()
    
    results = []
    
    for img_filename in test_images:
        img_path = os.path.join(test_images_dir, img_filename)
        original_size_mb = get_file_size_mb(img_path)
        original_size_kb = get_file_size_kb(img_path)
        
        if len(results) % 5 == 0:
            print(f"📸 Processing... {len(results)}/20 images completed")
        
        img_results = {"filename": img_filename, "original_kb": original_size_kb, "configs": {}}
        
        # Test current configuration
        current_output = os.path.join(test_output_dir, f"current_{generate_random_filename()}")
        orig_w, orig_h, new_w, new_h = compress_image(img_path, current_output, 
                                                     current_config["max_dim"], current_config["quality"])
        current_kb = get_file_size_kb(current_output)
        current_reduction = ((original_size_kb - current_kb) / original_size_kb) * 100
        
        img_results["configs"]["current_600px_q75"] = {
            "kb": current_kb, "dimensions": f"{new_w}x{new_h}", "reduction": current_reduction
        }
        
        # Test new configurations
        for config in test_configs:
            output_path = os.path.join(test_output_dir, f"test_{config['quality']}_{generate_random_filename()}")
            orig_w, orig_h, new_w, new_h = compress_image(img_path, output_path, 
                                                         config["max_dim"], config["quality"])
            test_kb = get_file_size_kb(output_path)
            test_reduction = ((original_size_kb - test_kb) / original_size_kb) * 100
            
            img_results["configs"][f"{config['max_dim']}px_q{config['quality']}"] = {
                "kb": test_kb, "dimensions": f"{new_w}x{new_h}", "reduction": test_reduction
            }
        
        results.append(img_results)
    
    # Calculate averages
    print("📊 SUMMARY RESULTS:")
    print("=" * 60)
    
    avg_original = sum(r["original_kb"] for r in results) / len(results)
    print(f"Average Original Size: {avg_original:.0f}KB")
    print()
    
    # Current config averages
    avg_current_kb = sum(r["configs"]["current_600px_q75"]["kb"] for r in results) / len(results)
    avg_current_reduction = sum(r["configs"]["current_600px_q75"]["reduction"] for r in results) / len(results)
    print(f"Current (600px, Q75): {avg_current_kb:.0f}KB - {avg_current_reduction:.1f}% reduction")
    print()
    
    # 600px options
    print("📏 600px OPTIONS:")
    for config in [c for c in test_configs if c['max_dim'] == 600]:
        key = f"600px_q{config['quality']}"
        avg_kb = sum(r["configs"][key]["kb"] for r in results) / len(results)
        avg_reduction = sum(r["configs"][key]["reduction"] for r in results) / len(results)
        vs_current = ((avg_current_kb - avg_kb) / avg_current_kb) * 100
        print(f"  Q{config['quality']}: {avg_kb:.0f}KB - {avg_reduction:.1f}% reduction (vs current: {vs_current:+.1f}%)")
    
    print()
    print("📏 700px OPTIONS:")
    for config in [c for c in test_configs if c['max_dim'] == 700]:
        key = f"700px_q{config['quality']}"
        avg_kb = sum(r["configs"][key]["kb"] for r in results) / len(results)
        avg_reduction = sum(r["configs"][key]["reduction"] for r in results) / len(results)
        vs_current = ((avg_current_kb - avg_kb) / avg_current_kb) * 100
        print(f"  Q{config['quality']}: {avg_kb:.0f}KB - {avg_reduction:.1f}% reduction (vs current: {vs_current:+.1f}%)")
    
    print()
    print("🔍 SHARPNESS vs SIZE COMPARISON:")
    # Compare 700px Q70 vs 600px Q75 (similar quality levels)
    key_600_75 = "600px_q75"
    key_700_70 = "700px_q70"
    avg_600_75 = sum(r["configs"][key_600_75]["kb"] for r in results) / len(results)
    avg_700_70 = sum(r["configs"][key_700_70]["kb"] for r in results) / len(results)
    size_diff = ((avg_700_70 - avg_600_75) / avg_600_75) * 100
    print(f"  600px Q75: {avg_600_75:.0f}KB (current)")
    print(f"  700px Q70: {avg_700_70:.0f}KB (+{size_diff:.1f}% larger)")
    
    print()
    print("✅ Test complete! Check results above.")
    
    # Clean up test files
    import shutil
    shutil.rmtree(test_output_dir)
    print(f"🗑️  Cleaned up test directory: {test_output_dir}")

if __name__ == "__main__":
    main()