# 🫁 LungAI — Deteksi Penyakit Paru-Paru Berbasis Deep Learning

Sistem deteksi penyakit paru-paru dari citra X-Ray menggunakan pipeline:  
**CLAHE → U-Net Segmentasi → ViT Klasifikasi → Grad-CAM (XAI)**

Klasifikasi 3 kelas: **Normal**, **Pneumonia**, **Tuberkulosis**

## 📂 Struktur Folder

```
skripsi/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # Entry point server
│   ├── requirements.txt        # Python dependencies
│   ├── routes/                 # API endpoints
│   │   └── predict.py
│   ├── services/               # Business logic & model
│   │   ├── inference.py        # Pipeline inferensi lengkap
│   │   └── models.py           # Arsitektur U-Net & ViT
│   └── weights/                # Model weights hasil training
│       ├── unet_paru_lr_1e4_best.pth
│       └── vit_skripsi_multiclass_bestV2.pth
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   └── ...
├── notebooks/                  # Notebook training Kaggle
│   ├── multi-class-segment.ipynb
│   └── extracted_code.py
├── tests/                      # Test scripts & data
│   ├── test_model.py
│   ├── test_prediction.py
│   └── data/                   # Gambar X-Ray untuk testing
│       ├── normal/
│       ├── pneumonia/
│       └── tuberculosis/
├── .gitignore
├── README.md
└── start_dev.ps1               # Script untuk menjalankan dev server
```

## 🚀 Cara Menjalankan

### Prasyarat
- Python 3.11+
- Node.js 18+
- Model weights (`.pth`) di folder `backend/weights/`

### Quick Start
```powershell
# Jalankan backend + frontend sekaligus
.\start_dev.ps1
```

### Manual
```powershell
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Frontend (terminal terpisah)
cd frontend
npm install
npm run dev
```

## 🔬 Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Preprocessing | CLAHE (Contrast Limited Adaptive Histogram Equalization) |
| Segmentasi | U-Net (4 kelas: Background, Paru, Pneumonia, TBC) |
| Klasifikasi | Vision Transformer (ViT-B/16) |
| Explainability | EigenCAM (Grad-CAM variant) |
| Backend | FastAPI + PyTorch |
| Frontend | React + TypeScript + Vite |
