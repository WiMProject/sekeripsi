/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '10mb' }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze-xray", async (req, res) => {
  const { imageBase64, patientMetadata } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ error: "No image data provided" });
  }

  try {
    // 1. Convert base64 to buffer and create file blob
    const buffer = Buffer.from(imageBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });
    
    // 2. Prepare multipart/form-data for FastAPI
    const formData = new FormData();
    formData.append('file', blob, 'image.png');

    // 3. Post to local FastAPI backend
    const fastApiUrl = "http://127.0.0.1:8000/api/predict";
    const apiRes = await fetch(fastApiUrl, {
      method: "POST",
      body: formData,
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(`FastAPI error (${apiRes.status}): ${errorText}`);
    }

    const apiData = await apiRes.json();
    
    // 4. Map backend prediction class to frontend format
    let prediction = apiData.prediction;
    if (prediction === "Tuberculosis") {
      prediction = "Tuberculosis (TBC)";
    }

    // 5. Calculate confidence percentage
    const confidenceScore = apiData.confidence[apiData.prediction] * 100;

    // 6. Generate clinical explanation
    let explanation = "";
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = "gemini-2.5-flash";
        const prompt = `Based on a chest X-ray analysis, the classifier (using CLAHE -> U-Net -> ViT) predicted: "${prediction}" with a confidence of ${confidenceScore.toFixed(2)}%.
        The patient is ${patientMetadata?.gender === 'Male' ? 'Male' : 'Female'}, age ${patientMetadata?.age || 'unknown'}.
        Reported symptoms: ${patientMetadata?.symptoms?.join(', ') || 'none'}.
        Write a brief medical explanation/report of this diagnosis in Indonesian. Keep it professional and short (2-3 sentences).`;

        const geminiRes = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        explanation = geminiRes.text?.trim() || "";
      } catch (err) {
        console.warn("Gemini explanation generation failed, falling back:", err);
      }
    }

    if (!explanation) {
      // Fallback rule-based explanation
      if (prediction === "Normal") {
        explanation = `Hasil analisis citra rontgen dada menunjukkan struktur paru-paru yang bersih dan simetris tanpa adanya infiltrat atau konsolidasi abnormal. Tidak ditemukan tanda-tanda infeksi aktif seperti Pneumonia atau Tuberkulosis. Kondisi klinis saat ini diklasifikasikan sebagai Normal.`;
      } else if (prediction === "Pneumonia") {
        explanation = `Ditemukan area opasitas/infiltrat (konsolidasi) abnormal pada parenkim paru-paru, yang merupakan karakteristik utama infeksi Pneumonia. Disarankan untuk berkonsultasi dengan dokter spesialis paru untuk penanganan lebih lanjut dan pemberian terapi antibiotik/antiviral yang sesuai.`;
      } else {
        explanation = `Ditemukan lesi kavitasi, infiltrat di lobus atas paru, atau pola nodular yang mengarah pada infeksi Tuberkulosis (TBC) aktif. Sangat disarankan untuk melakukan pemeriksaan dahak (BTA/TCM) guna mengonfirmasi diagnosis secara mikrobiologis dan memulai program pengobatan OAT.`;
      }
    }

    // Return the response in the format the frontend expects
    res.json({
      prediction,
      confidence: confidenceScore,
      explanation,
      images: apiData.images, // Pass along all processing step images
      confidenceScores: apiData.confidence,
      processingTime: apiData.processing_time_s
    });
  } catch (error) {
    console.error("Local backend analysis error:", error);
    res.status(500).json({ error: "Failed to analyze image using the local FastAPI backend. Make sure the backend is running." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
