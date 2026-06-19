import { motion } from "motion/react";
import { Scan, Brain, Eye, Layers, Zap, BarChart3, Shield, Cpu } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const features = [
  {
    icon: <Scan className="w-6 h-6 text-blue-400" />,
    title: "CLAHE Enhancement",
    desc: "Contrast Limited Adaptive Histogram Equalization meningkatkan kontras citra X-Ray secara adaptif, mempertahankan detail halus pada area paru untuk analisis yang lebih akurat.",
    className: "md:col-span-2",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 p-6 items-center justify-center">
        <Scan className="w-16 h-16 text-blue-400/40 animate-pulse" />
      </div>
    ),
  },
  {
    icon: <Layers className="w-6 h-6 text-purple-400" />,
    title: "U-Net Segmentasi",
    desc: "Arsitektur U-Net melakukan segmentasi semantik untuk memisahkan area paru-paru secara presisi.",
    className: "md:col-span-1",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 p-6 items-center justify-center">
        <Layers className="w-12 h-12 text-purple-400/40" />
      </div>
    ),
  },
  {
    icon: <Brain className="w-6 h-6 text-cyan-400" />,
    title: "Vision Transformer (ViT)",
    desc: "Model ViT menggunakan mekanisme self-attention untuk klasifikasi citra X-Ray ke dalam 3 kelas utama.",
    className: "md:col-span-1",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/5 p-6 items-center justify-center">
        <Brain className="w-12 h-12 text-cyan-400/40" />
      </div>
    ),
  },
  {
    icon: <Eye className="w-6 h-6 text-pink-400" />,
    title: "Grad-CAM Heatmap",
    desc: "Gradient-weighted Class Activation Mapping menghasilkan visualisasi heatmap yang menunjukkan area fokus model, memberikan interpretasi transparan atas keputusan AI.",
    className: "md:col-span-2",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/5 p-6 items-center justify-center">
        <Eye className="w-16 h-16 text-pink-400/40 animate-pulse" />
      </div>
    ),
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    title: "Inferensi Real-Time",
    desc: "Proses cepat dari preprocessing hingga klasifikasi.",
    className: "md:col-span-1",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 p-6 items-center justify-center">
        <Zap className="w-12 h-12 text-amber-400/40" />
      </div>
    ),
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
    title: "Confidence Score",
    desc: "Hasil klasifikasi disertai skor kepercayaan prediksi model.",
    className: "md:col-span-1",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/5 p-6 items-center justify-center">
        <BarChart3 className="w-12 h-12 text-emerald-400/40" />
      </div>
    ),
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-400" />,
    title: "Data Pasien Aman",
    desc: "Data disimpan lokal di browser Anda, menjamin kerahasiaan.",
    className: "md:col-span-1",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/5 p-6 items-center justify-center">
        <Shield className="w-12 h-12 text-indigo-400/40" />
      </div>
    ),
  },
  {
    icon: <Cpu className="w-6 h-6 text-rose-400" />,
    title: "Multi-Stage Pipeline Terintegrasi",
    desc: "Pipeline 4 tahap yang terintegrasi (Enhancement → Segmentasi → Klasifikasi → Visualisasi) untuk menjamin keakuratan analisis end-to-end yang komprehensif pada citra medis.",
    className: "md:col-span-3",
    header: (
      <div className="flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/5 p-6 items-center justify-center">
        <Cpu className="w-16 h-16 text-rose-400/40 animate-pulse" />
      </div>
    ),
  },
];
export default function FeaturesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 pt-28 pb-20">
      {/* BG Orbs */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-blue-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[10%] right-[-5%] w-[700px] h-[700px] bg-purple-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />


      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
            Teknologi
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Fitur <span className="gradient-text">Unggulan</span>
          </h1>
          <TextGenerateEffect
            words="Dibangun dengan teknologi deep learning state-of-the-art untuk memberikan hasil klasifikasi yang akurat dan dapat diinterpretasi secara transparan."
            className="text-lg text-slate-400 max-w-2xl mx-auto font-normal font-sans"
          />
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="mb-10 md:auto-rows-[22rem]">
          {features.map((feature, i) => (
            <BentoGridItem
              key={feature.title}
              title={feature.title}
              description={feature.desc}
              header={feature.header}
              icon={feature.icon}
              className={feature.className}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
