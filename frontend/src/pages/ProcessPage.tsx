import { motion } from "motion/react";
import { Scan, Layers, Brain, Eye, CheckCircle2 } from "lucide-react";
import { TracingBeam } from "@/components/ui/tracing-beam";

const steps = [
  {
    number: "01",
    icon: Scan,
    title: "CLAHE Enhancement",
    subtitle: "Preprocessing Citra",
    description: "Citra X-Ray dada yang diunggah terlebih dahulu diproses menggunakan Contrast Limited Adaptive Histogram Equalization (CLAHE). Teknik ini meningkatkan kontras lokal secara adaptif, sehingga detail halus pada area paru-paru yang sebelumnya tersembunyi menjadi lebih jelas terlihat.",
    details: [
      "Clip Limit: 2.0 untuk mencegah over-amplification noise",
      "Tile Grid Size: 8×8 untuk kontras adaptif per region",
      "Konversi grayscale ke RGB 3-channel untuk input U-Net",
      "Resize ke 512×512 piksel untuk konsistensi",
    ],
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Layers,
    title: "U-Net Segmentasi",
    subtitle: "Segmentasi Paru",
    description: "Model U-Net melakukan segmentasi semantik pada citra yang telah di-enhance. U-Net memisahkan area paru-paru dari background dan struktur non-paru (tulang rusuk, jantung, dll), menghasilkan mask presisi tinggi yang membatasi area analisis klasifikasi.",
    details: [
      "Arsitektur encoder-decoder dengan skip connections",
      "4 kelas output: Background, Paru, Pneumonia, TBC",
      "Input: 256×256 piksel, Output: mask multi-kelas",
      "Binary mask digunakan untuk isolasi ROI paru",
    ],
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: Brain,
    title: "ViT Klasifikasi",
    subtitle: "Klasifikasi AI",
    description: "Vision Transformer (ViT) menerima citra paru yang telah di-mask dan melakukan klasifikasi ke dalam 3 kelas penyakit. ViT menggunakan mekanisme self-attention untuk menangkap hubungan global antar patch gambar, menghasilkan prediksi dengan confidence score.",
    details: [
      "Input: citra masked 224×224 piksel (full frame, bukan crop)",
      "Patch size: 16×16 dengan 196 visual tokens",
      "3 kelas output: Normal, Pneumonia, Tuberkulosis",
      "Softmax probability untuk confidence score per kelas",
    ],
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    number: "04",
    icon: Eye,
    title: "EigenCAM Visualisasi",
    subtitle: "Explainable AI",
    description: "EigenCAM (varian Grad-CAM) menghasilkan heatmap visual yang menunjukkan area pada citra X-Ray yang paling berpengaruh terhadap keputusan model. Heatmap ini di-overlay pada citra asli, memberikan interpretasi transparan yang dapat divalidasi oleh tenaga medis.",
    details: [
      "EigenCAM pada layer terakhir transformer encoder",
      "Reshape transform untuk patch-based attention maps",
      "Heatmap di-mask hanya pada area paru (non-background)",
      "Overlay warna pada citra CLAHE untuk visualisasi final",
    ],
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", ring: "ring-blue-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", ring: "ring-purple-500/20" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", ring: "ring-cyan-500/20" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400", ring: "ring-pink-500/20" },
};

export default function ProcessPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 pt-28 pb-20">
      {/* BG Orbs */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[-5%] w-[600px] h-[600px] bg-cyan-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[5%] left-[-5%] w-[700px] h-[700px] bg-blue-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />


      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
            Pipeline
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Alur <span className="gradient-text">Proses</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Empat tahapan pipeline AI yang terintegrasi, dari preprocessing citra hingga visualisasi hasil klasifikasi.
          </p>
        </motion.div>

        {/* Tracing Beam timeline wrapper */}
        <TracingBeam className="relative" offset={["start 30%", "end 80%"]}>
          <div className="space-y-12">
            {steps.map((step, i) => {
              const colors = colorMap[step.color];

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative"
                >
                  <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700`} />

                    <div className="relative z-10">
                      {/* Step Header */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                          <step.icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${colors.text} uppercase tracking-widest mb-0.5`}>{step.subtitle}</p>
                          <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        </div>
                        <span className="ml-auto text-4xl font-black text-white/5 tracking-tighter">{step.number}</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2.5">
                        {step.details.map((detail, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <CheckCircle2 className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TracingBeam>
      </div>
    </div>
  );
}
