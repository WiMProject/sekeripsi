import sys
import os

# Tambahkan backend ke path agar bisa import services
# Naik satu level dari tests/ ke root project, lalu masuk ke backend/
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import numpy as np
import cv2
from backend.services.inference import run_inference

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

def create_dummy_xray():
    print("[*] Membuat gambar rontgen dada sintetis untuk pengujian...")
    img = np.zeros((512, 512), dtype=np.uint8)
    # Gambar struktur paru-paru kiri dan kanan sederhana (elips)
    cv2.ellipse(img, (160, 256), (70, 150), 0, 0, 360, 180, -1)
    cv2.ellipse(img, (352, 256), (70, 150), 0, 0, 360, 180, -1)
    # Tambahkan pola rusuk (ribs) fiktif
    for y in range(100, 400, 30):
        cv2.line(img, (100, y), (220, y), 80, 6)
        cv2.line(img, (292, y), (412, y), 80, 6)
    
    output_path = os.path.join(CURRENT_DIR, "data", "test_xray.png")
    cv2.imwrite(output_path, img)
    print(f"SUCCESS: File '{output_path}' berhasil dibuat.")

def test_inference():
    test_img_path = os.path.join(CURRENT_DIR, "data", "test_xray.png")
    if not os.path.exists(test_img_path):
        create_dummy_xray()
        
    print(f"[*] Membaca file gambar '{test_img_path}'...")
    with open(test_img_path, "rb") as f:
        file_bytes = f.read()
        
    print("[*] Menjalankan pipeline inferensi riil (CLAHE -> U-Net -> ROI -> ViT -> Grad-CAM)...")
    try:
        start_time = time_now = os.times().elapsed
        result = run_inference(file_bytes)
        end_time = os.times().elapsed
        
        print("="*50)
        print("HASIL PENGUJIAN INFERENSI SUKSES!")
        print("="*50)
        print(f"ID Pemeriksaan : {result['id']}")
        print(f"Prediksi Kelas : {result['prediction']}")
        print("Confidence     :")
        for cls, conf in result['confidence'].items():
            print(f"  - {cls:<15}: {conf * 100:.2f}%")
        print(f"Waktu Proses   : {result['processing_time_s']} detik")
        print("\nImage Base64 checks:")
        for name, b64 in result['images'].items():
            print(f"  - {name:<10}: {len(b64)} chars (OK)")
        print("="*50 + "\n")
    except Exception as e:
        print(f"❌ ERROR: Inferensi gagal: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_inference()
