import { motion } from "motion/react";
import { Upload, UserPlus, Scan, Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TracingBeam } from "@/components/ui/tracing-beam";

const tutorialSteps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Isi Data Pasien",
    description: "Masukkan informasi pasien pada halaman Klasifikasi. Data yang diperlukan meliputi:",
    details: [
      "Nama lengkap pasien",
      "Jenis kelamin (Laki-laki / Perempuan)",
      "Umur pasien (tahun)",
      "Tinggi badan (cm)",
      "Berat badan (kg)",
    ],
    tip: "Semua field wajib diisi untuk melanjutkan proses klasifikasi.",
  },
  {
    number: "2",
    icon: Upload,
    title: "Upload Citra X-Ray",
    description: "Klik area upload atau drag-and-drop file citra X-Ray dada ke zona upload.",
    details: [
      "Format yang didukung: JPG, JPEG, PNG",
      "Ukuran maksimum file: 10 MB",
      "Pastikan citra X-Ray berkualitas baik dan jelas",
      "Anda dapat melihat preview sebelum menganalisis",
    ],
    tip: "Gunakan citra X-Ray PA (Posteroanterior) untuk hasil terbaik.",
  },
  {
    number: "3",
    icon: Scan,
    title: "Jalankan Klasifikasi",
    description: "Klik tombol \"Klasifikasi Sekarang\" untuk memulai proses analisis AI. Sistem akan menjalankan pipeline 4 tahap:",
    details: [
      "CLAHE Enhancement → meningkatkan kontras citra",
      "U-Net Segmentasi → memisahkan area paru",
      "ViT Klasifikasi → menentukan kelas penyakit",
      "Grad-CAM → menghasilkan heatmap visualisasi",
    ],
    tip: "Proses biasanya memakan waktu 3-5 detik tergantung spesifikasi server.",
  },
  {
    number: "4",
    icon: Download,
    title: "Lihat Hasil & Simpan",
    description: "Setelah analisis selesai, Anda akan melihat hasil klasifikasi lengkap. Hasil otomatis tersimpan ke histori.",
    details: [
      "Prediksi kelas: Normal, Pneumonia, atau Tuberkulosis",
      "Confidence score untuk setiap kelas penyakit",
      "Visualisasi pipeline: Original, CLAHE, Mask, ROI, Grad-CAM",
      "Penjelasan klinis dari hasil analisis",
    ],
    tip: "Hasil klasifikasi otomatis tersimpan di halaman Histori. Anda juga dapat mengekspor hasil.",
  },
];

export default function TutorialPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 pt-28 pb-20">
      {/* BG */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[10%] right-[-5%] w-[700px] h-[700px] bg-blue-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />


      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            Panduan
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Cara <span className="gradient-text">Penggunaan</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Panduan langkah demi langkah untuk menggunakan sistem klasifikasi Lung-AI.
          </p>
        </motion.div>

        {/* Tracing Beam timeline wrapper */}
        <TracingBeam className="relative">
          <div className="space-y-12">
            {tutorialSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                  {/* Large Step Number BG */}
                  <span className="absolute top-6 right-8 text-[8rem] font-black text-white/[0.02] leading-none pointer-events-none select-none">
                    {step.number}
                  </span>

                  <div className="relative z-10">
                    {/* Step Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Langkah {step.number}</p>
                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xl">
                      {step.description}
                    </p>

                    {/* Detail List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {step.details.map((detail, j) => (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-blue-400">{j + 1}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex-shrink-0 mt-0.5">💡 Tips:</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.tip}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TracingBeam>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            to="/classify"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105 text-lg"
          >
            Mulai Klasifikasi Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
