from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router

app = FastAPI(
    title="Lung Disease Detection API",
    description="API untuk deteksi penyakit paru-paru (Normal, Pneumonia, Tuberkulosis) menggunakan pipeline CLAHE → U-Net → ViT → Grad-CAM",
    version="1.0.0",
)

# CORS – izinkan semua origin mengakses API (misalnya domain Netlify Anda)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api")


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "Lung Disease Detection API is running",
        "version": "1.0.0",
    }
