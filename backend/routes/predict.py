"""
predict.py — Router untuk endpoint prediksi dan history
"""

import io
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.inference import run_inference
import base64
import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class PatientMetadata(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None

class AnalyzeRequest(BaseModel):
    imageBase64: str
    patientMetadata: Optional[PatientMetadata] = None

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


@router.post("/analyze-xray")
async def analyze_xray(payload: AnalyzeRequest):
    """
    Endpoint baru untuk melayani request JSON dari frontend (Netlify).
    Menerima citra dalam format base64 dan metadata pasien, 
    menjalankan pipeline inferensi, dan memanggil Gemini API untuk penjelasan klinis.
    """
    if not payload.imageBase64:
        raise HTTPException(status_code=400, detail="Tidak ada data gambar yang diberikan.")

    # Decode base64 ke bytes
    try:
        # Menghapus header data URI jika ada (misal: "data:image/png;base64,")
        header_cutoff = payload.imageBase64.find(",")
        if header_cutoff != -1:
            base64_str = payload.imageBase64[header_cutoff + 1:]
        else:
            base64_str = payload.imageBase64
            
        file_bytes = base64.b64decode(base64_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal melakukan decode base64: {str(e)}")

    # Validasi menggunakan Gemini Vision untuk memastikan gambar yang diunggah adalah rontgen dada (X-Ray)
    if api_key:
        try:
            from PIL import Image
            import io
            
            # Buka bytes gambar dengan PIL
            img_pil = Image.open(io.BytesIO(file_bytes))
            
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = (
                "Assess if this image is a medical human chest X-ray. "
                "Respond with exactly one word: 'yes' if it is a chest X-ray, or 'no' if it is anything else "
                "(for example, photos of people, animals, landscapes, text, charts, food, or other medical scans "
                "like brain CT scan, ultrasound, dental X-ray, etc)."
            )
            response = model.generate_content([prompt, img_pil])
            validation_result = response.text.strip().lower()
            
            # Bersihkan tanda baca umum yang mungkin dikembalikan oleh LLM
            validation_result = validation_result.replace(".", "").replace(",", "").strip()
            
            print(f"[Gemini Validation] Response: '{validation_result}'")
            
            # Validasi ketat: Hanya izinkan jika jawaban tepat mengandung "yes" dan TIDAK mengandung "no"
            if "yes" not in validation_result or "no" in validation_result:
                raise HTTPException(
                    status_code=400,
                    detail="Berkas yang Anda unggah terdeteksi bukan merupakan citra rontgen dada (X-Ray) manusia yang valid."
                )
        except HTTPException:
            raise
        except Exception as e:
            # Jika API Gemini error/limit, jangan dilewati secara diam-diam. Tampilkan error agar user tahu penyebabnya.
            raise HTTPException(
                status_code=400,
                detail=f"Gagal melakukan validasi citra: {str(e)}"
            )
    else:
        # Jika API Key Gemini tidak diatur di backend, beritahu pengguna secara jelas
        raise HTTPException(
            status_code=400,
            detail="Gagal melakukan validasi: API Key Gemini belum dikonfigurasi di server backend. Silakan tambahkan secret GEMINI_API_KEY di Hugging Face Space."
        )

    # Jalankan inference
    try:
        result = run_inference(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inferensi gagal: {str(e)}")

    prediction = result["prediction"]
    confidence_score = result["confidence"][prediction] * 100

    # Petakan nama prediksi agar sesuai dengan frontend
    prediction_mapped = prediction
    if prediction == "Tuberculosis":
        prediction_mapped = "Tuberculosis (TBC)"

    # Peroleh metadata pasien
    gender = "unknown"
    age = "unknown"
    if payload.patientMetadata:
        gender = payload.patientMetadata.gender or "unknown"
        age = str(payload.patientMetadata.age) if payload.patientMetadata.age is not None else "unknown"

    # Panggil Gemini API untuk menyusun laporan klinis
    explanation = ""
    if api_key:
        try:
            # Menggunakan API Gemini 2.5 Flash yang terbaru
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = (
                f"Based on a chest X-ray analysis, the classifier (using CLAHE -> U-Net -> ViT) predicted: \"{prediction_mapped}\" "
                f"with a confidence of {confidence_score:.2f}%.\n"
                f"The patient is {gender}, age {age}.\n"
                f"Write a brief medical explanation/report of this diagnosis in Indonesian. Keep it professional and short (2-3 sentences)."
            )
            response = model.generate_content(prompt)
            explanation = response.text.strip()
        except Exception as err:
            print(f"Gemini generation failed: {err}")

    # Fallback jika Gemini gagal atau API key tidak diset
    if not explanation:
        if prediction == "Normal":
            explanation = (
                "Hasil analisis citra rontgen dada menunjukkan struktur paru-paru yang bersih dan simetris "
                "tanpa adanya infiltrat atau konsolidasi abnormal. Tidak ditemukan tanda-tanda infeksi aktif "
                "seperti Pneumonia atau Tuberkulosis. Kondisi klinis saat ini diklasifikasikan sebagai Normal."
            )
        elif prediction == "Pneumonia":
            explanation = (
                "Ditemukan area opasitas/infiltrat (konsolidasi) abnormal pada parenkim paru-paru, yang merupakan "
                "karakteristik utama infeksi Pneumonia. Disarankan untuk berkonsultasi dengan dokter spesialis paru "
                "untuk penanganan lebih lanjut dan pemberian terapi antibiotik/antiviral yang sesuai."
            )
        else:
            explanation = (
                "Ditemukan lesi kavitasi, infiltrat di lobus atas paru, atau pola nodular yang mengarah pada infeksi "
                "Tuberkulosis (TBC) aktif. Sangat disarankan untuk melakukan pemeriksaan dahak (BTA/TCM) guna "
                "mengonfirmasi diagnosis secara mikrobiologis dan memulai program pengobatan OAT."
            )

    # Simpan ke history (tanpa data gambar lengkap agar ringan)
    history_entry = {
        "id": result["id"],
        "timestamp": result["timestamp"],
        "prediction": prediction_mapped,
        "confidence": result["confidence"],
        "processing_time_s": result["processing_time_s"],
        "filename": "uploaded_file.png",
        "thumbnail": result["images"]["original"],
    }
    _history.insert(0, history_entry)
    if len(_history) > MAX_HISTORY:
        _history.pop()

    return {
        "prediction": prediction_mapped,
        "confidence": confidence_score,
        "explanation": explanation,
        "images": result["images"],
        "confidenceScores": result["confidence"],
        "processingTime": result["processing_time_s"]
    }
