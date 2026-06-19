import sys
import os

# Masukkan path backend secara absolut agar terdeteksi oleh python runner
# Naik satu level dari tests/ ke root project, lalu masuk ke backend/
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_path = os.path.join(PROJECT_ROOT, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)


import torch
import cv2
import numpy as np
from PIL import Image
from torchvision import transforms

from backend.services.models import UNet, ViTSkripsi


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_UNET = os.path.join(PROJECT_ROOT, "backend", "weights", "unet_paru_lr_1e4_best.pth")
PATH_VIT = os.path.join(PROJECT_ROOT, "backend", "weights", "vit_skripsi_multiclass_bestV2.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models
model_unet = UNet(in_channels=3, out_channels=4).to(device)
model_unet.load_state_dict(torch.load(PATH_UNET, map_location=device))
model_unet.eval()

model_vit = ViTSkripsi(num_classes=3).to(device)
model_vit.load_state_dict(torch.load(PATH_VIT, map_location=device))
model_vit.eval()

# Transforms
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def run_compare(image_path):
    print(f"\n--- Menguji gambar: {image_path} ---")
    img_gray = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img_gray = cv2.resize(img_gray, (512, 512))
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_img = clahe.apply(img_gray)
    clahe_rgb = cv2.cvtColor(clahe_img, cv2.COLOR_GRAY2RGB)
    
    # 1. Predict mask
    unet_input_img = cv2.resize(clahe_rgb, (256, 256))
    unet_arr = np.array(unet_input_img, dtype=np.float32) / 255.0
    unet_arr = np.transpose(unet_arr, (2, 0, 1))
    unet_tensor = torch.tensor(unet_arr).unsqueeze(0).to(device)
    
    with torch.no_grad():
        unet_output = model_unet(unet_tensor)
        _, pred_mask = torch.max(unet_output, 1)
        pred_mask_np = pred_mask.squeeze(0).cpu().numpy().astype(np.uint8)
        
    binary_mask_256 = (pred_mask_np > 0).astype(np.uint8)
    binary_mask_512 = cv2.resize(binary_mask_256, (512, 512), interpolation=cv2.INTER_NEAREST)
    
    masked_img = (clahe_rgb * np.expand_dims(binary_mask_512, axis=-1)).astype(np.uint8)
    
    # --- METODE A: Dengan Crop (ROI) ---
    coords = np.argwhere(binary_mask_512 > 0)
    if len(coords) > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        cropped_masked_img = masked_img[y_min:y_max+1, x_min:x_max+1]
    else:
        cropped_masked_img = masked_img
        
    roi_img = cv2.resize(cropped_masked_img, (224, 224))
    roi_pil = Image.fromarray(roi_img)
    vit_tensor_cropped = vit_transform(roi_pil).unsqueeze(0).to(device)
    
    with torch.no_grad():
        out_cropped = model_vit(vit_tensor_cropped)
        probs_cropped = torch.softmax(out_cropped, dim=1).squeeze(0).cpu().numpy()
        
    # --- METODE B: Tanpa Crop (Full Masked Image) ---
    masked_img_pil = Image.fromarray(masked_img)
    vit_tensor_uncropped = vit_transform(masked_img_pil).unsqueeze(0).to(device)
    
    with torch.no_grad():
        out_uncropped = model_vit(vit_tensor_uncropped)
        probs_uncropped = torch.softmax(out_uncropped, dim=1).squeeze(0).cpu().numpy()
        
    classes = ["Normal", "Pneumonia", "Tuberculosis"]
    
    print("\n[Metode A: Dengan ROI Crop (Stretched)]")
    for i, cls in enumerate(classes):
        print(f"  - {cls:<15}: {probs_cropped[i] * 100:.2f}%")
        
    print("\n[Metode B: Tanpa Crop (Full Masked seperti Training)]")
    for i, cls in enumerate(classes):
        print(f"  - {cls:<15}: {probs_uncropped[i] * 100:.2f}%")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_compare(sys.argv[1])
    else:
        # Gunakan test_xray.png default dari folder tests/data/
        default_img = os.path.join(CURRENT_DIR, "data", "test_xray.png")
        run_compare(default_img)
