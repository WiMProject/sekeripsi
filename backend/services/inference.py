"""
inference.py — Pipeline riil: CLAHE + U-Net Segmentation + ROI Crop + ViT Classification (Uncropped Masked) + EigenCAM Grad-CAM
"""

import base64
import os
import time
import uuid
from datetime import datetime
from io import BytesIO

import cv2
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from torchvision import transforms

from services.models import UNet, ViTSkripsi

# ── Resolusi Path Model secara Dinamis ─────────────────────────────────────────
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_UNET = os.path.abspath(os.path.join(CURRENT_DIR, "..", "weights", "unet_paru_lr_1e4_best.pth"))
PATH_VIT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "weights", "vit_skripsi_multiclass_bestV2.pth"))


# ── Alokasi Device ───────────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Load Model U-Net Terbaik ──────────────────────────────────────────────────
model_unet = UNet(in_channels=3, out_channels=4).to(device)
model_unet.load_state_dict(torch.load(PATH_UNET, map_location=device))
model_unet.eval()

# ── Load Model ViT Terbaik ────────────────────────────────────────────────────
model_vit = ViTSkripsi(num_classes=3).to(device)
model_vit.load_state_dict(torch.load(PATH_VIT, map_location=device))
model_vit.eval()

# ── Setup EigenCAM untuk Visualisasi XAI ViT ──────────────────────────────────
def reshape_transform(tensor, height=14, width=14):
    result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
    result = result.transpose(2, 3).transpose(1, 2)
    return result

target_layers = [model_vit.transformer_encoder.layers[-1].ln_1]
cam = EigenCAM(model=model_vit, 
               target_layers=target_layers, 
               reshape_transform=reshape_transform)

# ── Transformasi Standar ImageNet untuk ViT ───────────────────────────────────
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ── Color Map untuk Mask Multi-Kelas U-Net ────────────────────────────────────
# 0: Background (Hitam)
# 1: Paru (Cyan)
# 2: Pneumonia (Magenta)
# 3: TBC (Kuning)
COLOR_MAP = np.array([
    [0, 0, 0],         
    [0, 255, 255],     
    [255, 0, 255],     
    [255, 255, 0]      
], dtype=np.uint8)


# ── Helper Functions ─────────────────────────────────────────────────────────
def _array_to_b64(img_array: np.ndarray) -> str:
    """Konversi numpy array (grayscale atau RGB) ke base64 PNG."""
    if img_array.ndim == 2:
        pil_img = Image.fromarray(img_array.astype(np.uint8), mode="L").convert("RGB")
    else:
        pil_img = Image.fromarray(img_array.astype(np.uint8), mode="RGB")

    buffer = BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _read_image_gray(file_bytes: bytes) -> np.ndarray:
    """Decode bytes → numpy grayscale array."""
    arr = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Tidak bisa membaca gambar. Pastikan file valid (JPG/PNG).")
    return img


def _apply_clahe(img_gray: np.ndarray) -> np.ndarray:
    """Terapkan CLAHE persis seperti di notebook skripsi."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(img_gray)


# ── Main Inference Function ───────────────────────────────────────────────────
def run_inference(file_bytes: bytes) -> dict:
    """
    Jalankan pipeline riil lengkap:
    CLAHE → U-Net Mask → ROI Crop → ViT Klasifikasi → EigenCAM Grad-CAM
    """
    start = time.time()

    # 1. Baca gambar & resize ke 512x512
    img_gray = _read_image_gray(file_bytes)
    img_gray = cv2.resize(img_gray, (512, 512))

    # 2. CLAHE & jadikan RGB (3 channel untuk input U-Net)
    clahe_img = _apply_clahe(img_gray)
    clahe_rgb = cv2.cvtColor(clahe_img, cv2.COLOR_GRAY2RGB)

    # 3. U-Net Segmentasi (Prediksi Mask)
    unet_input_img = cv2.resize(clahe_rgb, (256, 256))
    unet_arr = np.array(unet_input_img, dtype=np.float32) / 255.0
    unet_arr = np.transpose(unet_arr, (2, 0, 1))
    unet_tensor = torch.tensor(unet_arr).unsqueeze(0).to(device)

    with torch.no_grad():
        unet_output = model_unet(unet_tensor)  # output logits shape (1, 4, 256, 256)
        _, pred_mask = torch.max(unet_output, 1)
        pred_mask_np = pred_mask.squeeze(0).cpu().numpy().astype(np.uint8)  # (256, 256)

    # Beri warna mask untuk visualisasi di frontend (0: background, 1: paru, 2: pneumonia, 3: TBC)
    mask_color_256 = COLOR_MAP[pred_mask_np]
    mask_color_512 = cv2.resize(mask_color_256, (512, 512), interpolation=cv2.INTER_NEAREST)

    # 4. Isolasi ROI (pada ukuran 512x512)
    binary_mask_256 = (pred_mask_np > 0).astype(np.uint8)
    binary_mask_512 = cv2.resize(binary_mask_256, (512, 512), interpolation=cv2.INTER_NEAREST)
    
    # Masked image (Full Size) - ini adalah format asli saat ViT ditraining
    masked_img = (clahe_rgb * np.expand_dims(binary_mask_512, axis=-1)).astype(np.uint8)

    # Dapatkan koordinat bounding box untuk tight crop
    coords = np.argwhere(binary_mask_512 > 0)
    if len(coords) > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
    else:
        y_min, x_min, y_max, x_max = 0, 0, 512, 512

    # 5. ViT Klasifikasi
    # PERHATIAN: ViT ditraining menggunakan gambar masked UTUH (non-cropped)
    # yang diresize ke 224x224. Jangan menggunakan ROI crop untuk input klasifikasi ViT.
    masked_img_pil = Image.fromarray(masked_img)
    vit_tensor = vit_transform(masked_img_pil).unsqueeze(0).to(device)

    with torch.no_grad():
        vit_output = model_vit(vit_tensor)
        probs = torch.softmax(vit_output, dim=1).squeeze(0).cpu().numpy()

    confidence = {
        "Normal": float(probs[0]),
        "Pneumonia": float(probs[1]),
        "Tuberculosis": float(probs[2])
    }
    prediction = max(confidence, key=confidence.get)

    # 6. Grad-CAM (EigenCAM) Heatmap pada input ViT
    grayscale_cam = cam(input_tensor=vit_tensor, targets=None)[0, :]
    
    # Kembalikan grayscale_cam ke ukuran 512x512
    grayscale_cam_512 = cv2.resize(grayscale_cam, (512, 512))
    # Batasi heatmap hanya pada area paru
    grayscale_cam_masked_512 = grayscale_cam_512 * binary_mask_512

    # Overlay heatmap di atas CLAHE 512x512
    rgb_img_float = np.float32(clahe_rgb) / 255.0
    cam_image_512 = show_cam_on_image(rgb_img_float, grayscale_cam_masked_512, use_rgb=True)

    # --- PENGEMASAN UNTUK VISUALISASI FRONTEND (CROP SECARA PRESENTASI) ---
    # Crop ROI Paru untuk tab visualisasi 'ROI Crop'
    cropped_roi_512 = masked_img[y_min:y_max+1, x_min:x_max+1]
    roi_img_224 = cv2.resize(cropped_roi_512, (224, 224))
    
    # Crop Grad-CAM untuk tab visualisasi 'Grad-CAM'
    cropped_cam_512 = cam_image_512[y_min:y_max+1, x_min:x_max+1]
    cam_image_224 = cv2.resize(cropped_cam_512, (224, 224))

    elapsed = round(time.time() - start, 3)

    return {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "prediction": prediction,
        "confidence": confidence,
        "processing_time_s": elapsed,
        "images": {
            "original": _array_to_b64(img_gray),
            "clahe": _array_to_b64(clahe_img),
            "mask": _array_to_b64(mask_color_512),
            "roi": _array_to_b64(roi_img_224),
            "gradcam": _array_to_b64(cam_image_224),
        },
    }
