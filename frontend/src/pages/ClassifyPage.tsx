import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileSearch, AlertCircle, Loader2, User, Ruler, Weight, Download, Calendar, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Prediction, Examination } from "@/types";
import { toast } from "sonner";
import { generatePdfReport } from "@/lib/generatePdfReport";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Compare } from "@/components/ui/compare";

const loadingStates = [
  { text: "Membaca data pasien dan citra rontgen..." },
  { text: "Meningkatkan kontras gambar dengan CLAHE..." },
  { text: "Menjalankan segmentasi area paru dengan U-Net..." },
  { text: "Menganalisis kelas penyakit dengan Vision Transformer..." },
  { text: "Menghasilkan peta fokus perhatian dengan Grad-CAM..." },
  { text: "Menyusun ringkasan diagnosis akhir..." }
];

export default function ClassifyPage() {
  // Patient data
  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // File & result
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    prediction: Prediction;
    confidence: number;
    explanation: string;
    images?: {
      original: string;
      clahe: string;
      mask: string;
      roi: string;
      gradcam: string;
    };
    confidenceScores?: Record<string, number>;
    processingTime?: number;
  } | null>(null);
  const [activeStep, setActiveStep] = useState<"original" | "clahe" | "mask" | "roi" | "gradcam">("gradcam");
  const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const isFormValid = patientName.trim() && age && height && weight && file;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error("Data Tidak Lengkap", { description: "Mohon isi nama pasien." });
      return;
    }
    if (!age || !height || !weight) {
      toast.error("Data Tidak Lengkap", { description: "Mohon isi umur, tinggi badan, dan berat badan." });
      return;
    }
    if (!file) {
      toast.error("Berkas Hilang", { description: "Mohon unggah gambar rontgen dada untuk analisis." });
      return;
    }

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/analyze-xray`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            patientMetadata: {
              name: patientName,
              age: parseInt(age),
              gender: gender,
              height: parseFloat(height),
              weight: parseFloat(weight),
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || "Gagal melakukan analisis citra.");
        }

        setResult(data);
        setActiveStep("gradcam");
        setIsAnalyzing(false);

        // Auto-save to history
        const examData: Examination = {
          id: "exam-" + Date.now(),
          patientId: "#LN-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000),
          patientName: patientName,
          age: parseInt(age),
          gender: gender,
          height: parseFloat(height),
          weight: parseFloat(weight),
          date: new Date().toISOString(),
          prediction: data.prediction,
          confidence: data.confidence,
          imageUrl: data.images?.original ? `data:image/png;base64,${data.images.original}` : (previewUrl || ""),
          heatmapUrl: data.images?.gradcam ? `data:image/png;base64,${data.images.gradcam}` : "",
          notes: data.explanation,
        };

        const existingHistoryJson = localStorage.getItem("lungai_history");
        const existingHistory: Examination[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
        const updatedHistory = [examData, ...existingHistory];
        localStorage.setItem("lungai_history", JSON.stringify(updatedHistory));

        toast.success("Analisis Berhasil", {
          description: "Hasil klasifikasi telah tersimpan ke histori.",
        });
      };
    } catch (error: any) {
      console.error("Analysis error:", error);
      setIsAnalyzing(false);
      toast.error("Analisis Gagal", {
        description: error.message || "Model AI mengalami kesalahan saat inferensi. Pastikan backend berjalan.",
      });
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setPatientName("");
    setGender("Laki-laki");
    setAge("");
    setHeight("");
    setWeight("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 pt-28 pb-20">
      {/* Fullscreen Multi-Step Loader */}
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={isAnalyzing}
        duration={700}
        loop={false}
      />

      {/* BG */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-purple-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />



      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            Klasifikasi
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Klasifikasi <span className="gradient-text">X-Ray</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Isi data pasien, upload citra X-Ray dada, dan dapatkan hasil klasifikasi AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Input Form ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="bg-black/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold text-white">Data Pasien & Upload</CardTitle>
                <CardDescription className="text-slate-500 text-xs">
                  Lengkapi informasi pasien dan unggah citra X-Ray
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-2">
                <form onSubmit={handleAnalyze} className="space-y-5">
                  {/* Patient Name */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Nama Pasien
                    </Label>
                    <Input
                      placeholder="Masukkan nama lengkap pasien"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:bg-white/[0.06] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Jenis Kelamin
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Laki-laki", "Perempuan"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`h-12 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                            gender === g
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-slate-200"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age, Height, Weight */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" /> Umur
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="150"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:bg-white/[0.06] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">THN</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Ruler className="w-3.5 h-3.5 text-purple-400" /> TB
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="300"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:bg-white/[0.06] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">CM</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Weight className="w-3.5 h-3.5 text-pink-400" /> BB
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="500"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:bg-white/[0.06] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">KG</span>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Citra X-Ray Dada
                    </Label>
                    {!file ? (
                      <div
                        className="border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-300 cursor-pointer group"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4 group-hover:rotate-6 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:text-blue-400 transition-all duration-500">
                          <Upload className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Klik untuk Upload</p>
                        <p className="text-[10px] text-slate-600 mt-1">JPG, PNG — Maks. 10MB</p>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-video bg-black/40 shadow-inner">
                        <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-xl shadow-2xl transition-all hover:bg-rose-600 hover:scale-105 active:scale-95 z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between">
                          <p className="text-[10px] font-medium text-slate-300 truncate max-w-[150px]">{file.name}</p>
                          <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className={`w-full h-14 text-sm font-bold transition-all duration-300 mt-2 rounded-2xl ${
                      !isFormValid
                        ? "bg-white/[0.02] text-slate-500 border border-white/5 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                    }`}
                    disabled={isAnalyzing || !isFormValid}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Memproses Analisis...
                      </>
                    ) : (
                      <>
                        <FileSearch className="mr-3 h-5 w-5" />
                        Klasifikasi Sekarang
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Results Area ──────────────────────────── */}
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <Card className="bg-black/40 backdrop-blur-3xl border-white/5 shadow-2xl h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="w-24 h-24 mb-10 relative">
                      <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] will-change-transform"
                      />
                      <Loader2 className="w-10 h-10 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <CardTitle className="text-3xl font-black text-white mb-3 tracking-tight">
                      Menganalisis...
                    </CardTitle>
                    <CardDescription className="max-w-xs text-slate-500 text-sm">
                      Pipeline AI sedang mengolah citra di latar belakang. Lihat detail tahap pada loader overlay.
                    </CardDescription>
                  </div>
                </Card>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="h-full"
              >
                <Card className="h-full bg-black/40 backdrop-blur-3xl flex flex-col border-white/5 shadow-2xl overflow-hidden group rounded-3xl">
                  <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                          ✓ Analisis Selesai
                        </div>
                        <CardTitle className="text-2xl font-black text-white tracking-tight">
                          Hasil Klasifikasi
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs">
                          Pasien: {patientName} • {gender} • {age} tahun
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-8 space-y-8">
                    {/* Prediction Result */}
                    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-radial from-white/[0.03] to-transparent" />
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Prediksi</p>
                        <h3
                          className={`text-4xl md:text-5xl font-black mb-3 tracking-tight ${
                            result.prediction === "Normal"
                              ? "text-emerald-400"
                              : result.prediction === "Tuberculosis (TBC)"
                              ? "text-rose-500"
                              : "text-amber-400"
                          }`}
                        >
                          {result.prediction}
                        </h3>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs font-semibold text-slate-500">Confidence:</span>
                          <Badge className="bg-white text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                            {result.confidence.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Patient Info Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Umur", value: `${age} thn` },
                        { label: "Gender", value: gender },
                        { label: "TB", value: `${height} cm` },
                        { label: "BB", value: `${weight} kg` },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pipeline Visualizations */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                          Visualisasi Pipeline
                        </Label>
                        <div className="flex bg-white/[0.02] p-1 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                              viewMode === "grid"
                                ? "bg-white text-black shadow-md"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Grid View
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode("compare")}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                              viewMode === "compare"
                                ? "bg-white text-black shadow-md"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Bandingkan
                          </button>
                        </div>
                      </div>

                      {viewMode === "compare" ? (
                        <div className="aspect-square w-full">
                          <Compare
                            firstImage={result.images?.original ? `data:image/png;base64,${result.images.original}` : (previewUrl || "")}
                            secondImage={result.images?.gradcam ? `data:image/png;base64,${result.images.gradcam}` : ""}
                            slideMode="drag"
                            className="w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-xl"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-5 gap-1.5 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                            {[
                              { id: "original", label: "Original" },
                              { id: "clahe", label: "CLAHE" },
                              { id: "mask", label: "U-Net" },
                              { id: "roi", label: "ROI" },
                              { id: "gradcam", label: "Grad-CAM" },
                            ].map((step) => (
                              <Button
                                key={step.id}
                                type="button"
                                variant="ghost"
                                onClick={() => setActiveStep(step.id as typeof activeStep)}
                                className={`h-8 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                  activeStep === step.id
                                    ? "bg-white text-black hover:bg-white hover:text-black shadow-lg"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                {step.label}
                              </Button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Input</Label>
                              <div className="aspect-square bg-black/60 p-1 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                <img
                                  src={result.images?.original ? `data:image/png;base64,${result.images.original}` : previewUrl!}
                                  alt="Original"
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                                {activeStep === "original" && "Original"}
                                {activeStep === "clahe" && "CLAHE"}
                                {activeStep === "mask" && "U-Net Mask"}
                                {activeStep === "roi" && "ROI Crop"}
                                {activeStep === "gradcam" && "Grad-CAM"}
                              </Label>
                              <div className="aspect-square bg-black/60 p-1 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                {result.images?.[activeStep] ? (
                                  <img
                                    src={`data:image/png;base64,${result.images[activeStep]}`}
                                    alt={activeStep}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                    Tidak tersedia
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-sm text-slate-400 leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-2">
                        Penjelasan Klinis
                      </span>
                      {result.explanation}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-black/40 border-t border-white/5 p-8 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold rounded-xl"
                      onClick={() => {
                        if (!result) return;
                        generatePdfReport({
                          patientName,
                          patientId: "#LN-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000),
                          gender,
                          age,
                          height,
                          weight,
                          prediction: result.prediction,
                          confidence: result.confidence,
                          explanation: result.explanation,
                          date: new Date().toISOString(),
                          processingTime: result.processingTime,
                          confidenceScores: result.confidenceScores,
                          images: {
                            original: result.images?.original,
                            gradcam: result.images?.gradcam,
                          },
                        });
                        toast.success("PDF Berhasil", { description: "Laporan PDF telah diunduh." });
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button
                      className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25"
                      onClick={resetForm}
                    >
                      Klasifikasi Baru
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/20 backdrop-blur-3xl h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-white/5 shadow-2xl relative group overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-radial from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  {/* Stylized Chest X-Ray Scanning Animation mockup */}
                  <div className="relative w-48 h-48 mb-8 border border-white/10 rounded-2xl bg-slate-950/60 overflow-hidden flex items-center justify-center group-hover:border-blue-500/20 transition-all duration-500 shadow-inner">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
                    
                    {/* SVG Lungs shape */}
                    <svg className="w-32 h-32 text-white/[0.03] group-hover:text-blue-500/5 transition-all duration-700" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M45,20 C35,20 20,25 20,50 C20,70 30,85 45,85 C47,85 48,80 48,70 C48,60 45,55 45,50 C45,35 47,20 45,20 Z" />
                      <path d="M55,20 C65,20 80,25 80,50 C80,70 70,85 55,85 C53,85 52,80 52,70 C52,60 55,55 55,50 C55,35 53,20 55,20 Z" />
                      <path d="M22,35 Q35,32 45,38 M78,35 Q65,32 55,38 M20,48 Q35,45 45,52 M80,48 Q65,45 55,52 M22,61 Q35,58 45,66 M78,61 Q65,58 55,66 M25,74 Q35,71 45,78 M75,74 Q65,71 55,78" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2" />
                      <rect x="48" y="15" width="4" height="70" rx="1" opacity="0.1" />
                    </svg>

                    {/* Scanning Line */}
                    <motion.div
                      animate={{
                        top: ["0%", "100%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-200 mb-2 tracking-tight group-hover:text-white transition-colors">
                    Menunggu Input
                  </CardTitle>
                  <CardDescription className="max-w-xs text-slate-500 text-xs leading-relaxed">
                    Isi data pasien dan upload citra X-Ray dada untuk memulai klasifikasi AI.
                  </CardDescription>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
