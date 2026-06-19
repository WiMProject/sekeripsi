"""
predict.py — Router untuk endpoint prediksi dan history
"""

import io
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.inference import run_inference

router = APIRouter(tags=["Prediction"])

# In-memory history (list of result dicts, max 50)
_history: List[dict] = []
MAX_HISTORY = 50
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload citra X-Ray paru → jalankan pipeline AI → return hasil prediksi.

    - **file**: Gambar X-Ray (JPG/PNG, max 10MB)
    """
    # Validasi tipe file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipe file tidak didukung: {file.content_type}. Gunakan JPG atau PNG.",
        )

    # Baca bytes
    file_bytes = await file.read()

    # Validasi ukuran
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Ukuran file terlalu besar. Maksimum 10MB.",
        )

    # Jalankan inference
    try:
        result = run_inference(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inferensi gagal: {str(e)}")

    # Simpan ke history (tanpa data gambar agar ringan)
    history_entry = {
        "id": result["id"],
        "timestamp": result["timestamp"],
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "processing_time_s": result["processing_time_s"],
        "filename": file.filename,
        # Simpan thumbnail original saja untuk history
        "thumbnail": result["images"]["original"],
    }
    _history.insert(0, history_entry)
    if len(_history) > MAX_HISTORY:
        _history.pop()

    return result


@router.get("/history")
def get_history():
    """Ambil riwayat prediksi terakhir (max 50 entri, tanpa gambar lengkap)."""
    return {"count": len(_history), "items": _history}


@router.delete("/history")
def clear_history():
    """Hapus semua riwayat prediksi."""
    _history.clear()
    return {"message": "History berhasil dihapus."}
