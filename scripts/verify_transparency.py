from PIL import Image
import sys

def check_transparency(path):
    try:
        img = Image.open(path)
        print(f"Format: {img.format}, Mode: {img.mode}")
        
        if img.mode != 'RGBA':
            print("Image is not RGBA (no alpha channel).")
            # Try to convert and check if it has transparency info implicitly? Unlikely for PNG.
            # But let's check for info.transparency
            if 'transparency' in img.info:
                print("However, it has transparency info.")
            return False
            
        extrema = img.getextrema()
        alpha_extrema = extrema[3]
        print(f"Alpha channel range: {alpha_extrema}")
        
        if alpha_extrema[0] < 255:
            print("SUCCESS: Image contains transparent pixels.")
            return True
        else:
            print("FAIL: Alpha channel is fully opaque (255).")
            return False
            
    except Exception as e:
        print(f"Error checking image: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_transparency.py <image_path>")
        sys.exit(1)
        
    path = sys.argv[1]
    check_transparency(path)
