/**
 * generatePdfReport.ts
 * Generates a professional medical-style PDF report for lung classification results.
 * Uses jsPDF with custom layout — not a browser print/screenshot.
 */

import jsPDF from "jspdf";

interface PdfReportData {
  patientName: string;
  patientId: string;
  gender: string;
  age: string | number;
  height: string | number;
  weight: string | number;
  prediction: string;
  confidence: number;
  explanation: string;
  date: string;
  processingTime?: number;
  confidenceScores?: Record<string, number>;
  images?: {
    original?: string;
    gradcam?: string;
  };
}

// ─── Color Palette ──────────────────────────────────
const COLORS = {
  primary: [41, 98, 255] as [number, number, number],       // #2962FF
  primaryLight: [227, 236, 255] as [number, number, number], // #E3ECFF
  dark: [15, 23, 42] as [number, number, number],            // #0F172A
  text: [30, 41, 59] as [number, number, number],            // #1E293B
  textLight: [100, 116, 139] as [number, number, number],    // #64748B
  white: [255, 255, 255] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],         // #10B981
  greenBg: [220, 252, 231] as [number, number, number],      // #DCFCE7
  red: [239, 68, 68] as [number, number, number],            // #EF4444
  redBg: [254, 226, 226] as [number, number, number],        // #FEE2E2
  amber: [245, 158, 11] as [number, number, number],         // #F59E0B
  amberBg: [254, 243, 199] as [number, number, number],      // #FEF3C7
  border: [226, 232, 240] as [number, number, number],       // #E2E8F0
  bgLight: [248, 250, 252] as [number, number, number],      // #F8FAFC
  bgCard: [241, 245, 249] as [number, number, number],       // #F1F5F9
};

function getPredictionColor(prediction: string): {
  text: [number, number, number];
  bg: [number, number, number];
} {
  if (prediction === "Normal") return { text: COLORS.green, bg: COLORS.greenBg };
  if (prediction.includes("Tuberculosis") || prediction.includes("TBC")) return { text: COLORS.red, bg: COLORS.redBg };
  return { text: COLORS.amber, bg: COLORS.amberBg };
}

function addBase64Image(doc: jsPDF, b64: string, x: number, y: number, w: number, h: number) {
  try {
    doc.addImage(`data:image/png;base64,${b64}`, "PNG", x, y, w, h);
  } catch {
    // Draw placeholder if image fails
    doc.setFillColor(...COLORS.bgCard);
    doc.roundedRect(x, y, w, h, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text("Gambar tidak tersedia", x + w / 2, y + h / 2, { align: "center" });
  }
}

export function generatePdfReport(data: PdfReportData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();   // 297
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ═══════════════════════════════════════════════════
  // ──── HEADER BAR ──────────────────────────────────
  // ═══════════════════════════════════════════════════
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 38, "F");

  // Accent line
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 38, pageW, 1.5, "F");

  // Logo text
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Lung-AI", margin, 18);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  doc.text("Sistem Klasifikasi Penyakit Paru Berbasis Deep Learning", margin, 25);

  // Report title right-aligned
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("LAPORAN HASIL KLASIFIKASI", pageW - margin, 18, { align: "right" });

  // Date right-aligned
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 190, 210);
  const dateStr = new Date(data.date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(data.date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`${dateStr} — ${timeStr}`, pageW - margin, 25, { align: "right" });

  // Report ID
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 170);
  doc.text(`ID: ${data.patientId}`, pageW - margin, 32, { align: "right" });

  y = 48;

  // ═══════════════════════════════════════════════════
  // ──── PATIENT INFO SECTION ────────────────────────
  // ═══════════════════════════════════════════════════
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("DATA PASIEN", margin, y);

  y += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 28, y);

  y += 6;

  // Patient info card background
  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "FD");

  const col1X = margin + 6;
  const col2X = margin + contentW / 3 + 4;
  const col3X = margin + (contentW / 3) * 2 + 4;

  // Row 1
  const row1Y = y + 8;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nama Pasien", col1X, row1Y);
  doc.text("Jenis Kelamin", col2X, row1Y);
  doc.text("Umur", col3X, row1Y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(data.patientName, col1X, row1Y + 6);
  doc.text(data.gender, col2X, row1Y + 6);
  doc.text(`${data.age} Tahun`, col3X, row1Y + 6);

  // Row 2
  const row2Y = row1Y + 14;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("ID Pasien", col1X, row2Y);
  doc.text("Tinggi Badan", col2X, row2Y);
  doc.text("Berat Badan", col3X, row2Y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.text);
  doc.text(data.patientId, col1X, row2Y + 6);
  doc.text(`${data.height} cm`, col2X, row2Y + 6);
  doc.text(`${data.weight} kg`, col3X, row2Y + 6);

  y += 36;

  // ═══════════════════════════════════════════════════
  // ──── PREDICTION RESULT ───────────────────────────
  // ═══════════════════════════════════════════════════
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("HASIL KLASIFIKASI", margin, y);
  y += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(margin, y, margin + 34, y);
  y += 6;

  const predColors = getPredictionColor(data.prediction);

  // Main result card
  doc.setFillColor(...predColors.bg);
  doc.setDrawColor(...predColors.text);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 30, 3, 3, "FD");

  // Prediction label
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Prediksi Kelas Penyakit", margin + 8, y + 9);

  // Prediction value
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...predColors.text);
  doc.text(data.prediction.toUpperCase(), margin + 8, y + 21);

  // Confidence on right side
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Confidence Score", pageW - margin - 8, y + 9, { align: "right" });

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...predColors.text);
  doc.text(`${data.confidence.toFixed(2)}%`, pageW - margin - 8, y + 23, { align: "right" });

  y += 38;

  // ─── Confidence breakdown (if available) ──────────
  if (data.confidenceScores) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.textLight);
    doc.text("DISTRIBUSI CONFIDENCE PER KELAS:", margin, y);
    y += 6;

    const barHeight = 7;
    const barWidth = contentW - 60;
    const labels: [string, string][] = [
      ["Normal", "Normal"],
      ["Pneumonia", "Pneumonia"],
      ["Tuberculosis", "Tuberculosis (TBC)"],
    ];

    labels.forEach(([key, label]) => {
      const score = (data.confidenceScores?.[key] ?? 0) * 100;
      const barColor = key === "Normal" ? COLORS.green : key === "Pneumonia" ? COLORS.amber : COLORS.red;

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      doc.text(label, margin, y + 5);

      // Bar background
      const barX = margin + 52;
      doc.setFillColor(...COLORS.bgCard);
      doc.roundedRect(barX, y, barWidth, barHeight, 1.5, 1.5, "F");

      // Bar fill
      const fillW = Math.max(1, (score / 100) * barWidth);
      doc.setFillColor(...barColor);
      doc.roundedRect(barX, y, fillW, barHeight, 1.5, 1.5, "F");

      // Score text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.text);
      doc.text(`${score.toFixed(1)}%`, barX + barWidth + 4, y + 5);

      y += barHeight + 4;
    });

    y += 4;
  }

  // ═══════════════════════════════════════════════════
  // ──── X-RAY IMAGES ────────────────────────────────
  // ═══════════════════════════════════════════════════
  if (data.images?.original || data.images?.gradcam) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("VISUALISASI CITRA", margin, y);
    y += 2;
    doc.setDrawColor(...COLORS.primary);
    doc.line(margin, y, margin + 32, y);
    y += 6;

    const imgSize = (contentW - 10) / 2;
    const imgHeight = Math.min(imgSize, 65); // cap height

    if (data.images?.original) {
      // Label
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.textLight);
      doc.text("CITRA X-RAY ORIGINAL", margin, y);

      // Image border
      doc.setFillColor(...COLORS.bgCard);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y + 2, imgSize, imgHeight, 2, 2, "FD");
      addBase64Image(doc, data.images.original, margin + 1, y + 3, imgSize - 2, imgHeight - 2);
    }

    if (data.images?.gradcam) {
      const gradX = margin + imgSize + 10;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.textLight);
      doc.text("GRAD-CAM HEATMAP", gradX, y);

      doc.setFillColor(...COLORS.bgCard);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(gradX, y + 2, imgSize, imgHeight, 2, 2, "FD");
      addBase64Image(doc, data.images.gradcam, gradX + 1, y + 3, imgSize - 2, imgHeight - 2);
    }

    y += imgHeight + 10;
  }

  // ═══════════════════════════════════════════════════
  // ──── CLINICAL EXPLANATION ────────────────────────
  // ═══════════════════════════════════════════════════
  // Check if we need a new page
  if (y > pageH - 70) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("PENJELASAN KLINIS", margin, y);
  y += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(margin, y, margin + 34, y);
  y += 6;

  // Explanation card
  const explanationLines = doc.splitTextToSize(data.explanation, contentW - 16);
  const explanationH = Math.max(20, explanationLines.length * 5 + 12);

  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, explanationH, 3, 3, "FD");

  // Blue accent bar on left
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y, 2, explanationH, 1, 1, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(explanationLines, margin + 8, y + 8);

  y += explanationH + 8;

  // ═══════════════════════════════════════════════════
  // ──── PROCESSING INFO ─────────────────────────────
  // ═══════════════════════════════════════════════════
  if (data.processingTime) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textLight);
    doc.text(`Waktu Pemrosesan: ${data.processingTime} detik`, margin, y);
    y += 4;
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Pipeline: CLAHE → U-Net Segmentasi → ViT Klasifikasi → EigenCAM Visualisasi", margin, y);

  // ═══════════════════════════════════════════════════
  // ──── FOOTER ──────────────────────────────────────
  // ═══════════════════════════════════════════════════
  const footerY = pageH - 18;

  // Separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageW - margin, footerY);

  // Footer left
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Lung-AI — Sistem Klasifikasi Penyakit Paru Berbasis Deep Learning", margin, footerY + 6);

  // Footer right
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`, pageW - margin, footerY + 6, { align: "right" });

  // Disclaimer
  doc.setFontSize(6);
  doc.setTextColor(170, 180, 195);
  doc.text(
    "Disclaimer: Hasil klasifikasi ini dihasilkan oleh model AI dan bersifat pendukung. Konsultasikan dengan tenaga medis profesional untuk diagnosis final.",
    margin,
    footerY + 12
  );

  // ═══════════════════════════════════════════════════
  // ──── SAVE ────────────────────────────────────────
  // ═══════════════════════════════════════════════════
  const fileName = `LungAI_Report_${data.patientName.replace(/\s+/g, "_")}_${new Date(data.date).toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
