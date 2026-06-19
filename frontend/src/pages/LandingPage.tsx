import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Scan,
  Brain,
  Eye,
  Shield,
  History,
  FileText,
  LineChart,
  Database,
  BookOpen,
  Lock,
  Sparkles,
  Cpu
} from "lucide-react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { Spotlight } from "@/components/ui/spotlight";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const products = [
    {
      title: "Pre-processing CLAHE",
      link: "/process",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      icon: <Scan className="w-12 h-12 text-blue-400" />,
    },
    {
      title: "Segmentasi U-Net",
      link: "/process",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
      icon: <Brain className="w-12 h-12 text-indigo-400" />,
    },
    {
      title: "Klasifikasi ViT",
      link: "/process",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      icon: <Cpu className="w-12 h-12 text-purple-400" />,
    },
    {
      title: "Visualisasi Grad-CAM",
      link: "/process",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
      icon: <Eye className="w-12 h-12 text-pink-400" />,
    },
    {
      title: "Hasil Diagnosis Realtime",
      link: "/classify",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-rose-500/20 to-orange-500/20",
      icon: <Activity className="w-12 h-12 text-rose-400" />,
    },
    {
      title: "Deteksi Paru Normal",
      link: "/classify",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      icon: <Shield className="w-12 h-12 text-green-400" />,
    },
    {
      title: "Deteksi Pneumonia",
      link: "/classify",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
      icon: <Sparkles className="w-12 h-12 text-amber-400" />,
    },
    {
      title: "Deteksi Tuberkulosis",
      link: "/classify",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-red-500/20 to-rose-500/20",
      icon: <Activity className="w-12 h-12 text-red-400" />,
    },
    {
      title: "Histori & Riwayat Pasien",
      link: "/history",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-teal-500/20 to-cyan-500/20",
      icon: <History className="w-12 h-12 text-teal-400" />,
    },
    {
      title: "Export Laporan PDF",
      link: "/history",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
      icon: <FileText className="w-12 h-12 text-blue-400" />,
    },
    {
      title: "Statistik Klasifikasi",
      link: "/history",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20",
      icon: <LineChart className="w-12 h-12 text-violet-400" />,
    },
    {
      title: "Dataset X-Ray Dada",
      link: "/features",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-sky-500/20 to-blue-500/20",
      icon: <Database className="w-12 h-12 text-sky-400" />,
    },
    {
      title: "Akurasi Klasifikasi Tinggi",
      link: "/features",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
      icon: <Shield className="w-12 h-12 text-emerald-400" />,
    },
    {
      title: "Panduan & Tutorial",
      link: "/tutorial",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
      icon: <BookOpen className="w-12 h-12 text-yellow-400" />,
    },
    {
      title: "Privasi & Keamanan Data",
      link: "/",
      thumbnail: "",
      gradient: "bg-gradient-to-br from-slate-500/20 to-zinc-500/20",
      icon: <Lock className="w-12 h-12 text-slate-400" />,
    },
  ];

  const aboutItems = [
    {
      title: "Preprocessing Citra",
      description: "Menggunakan CLAHE untuk meningkatkan kontras dan U-Net untuk segmentasi area paru-paru secara otomatis.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Scan className="w-6 h-6 text-blue-400" />
        </div>
      ),
    },
    {
      title: "AI Klasifikasi",
      description: "Vision Transformer (ViT) mengklasifikasikan citra X-Ray ke dalam 3 kelas: Normal, Pneumonia, dan Tuberkulosis.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
      ),
    },
    {
      title: "Explainable AI",
      description: "Grad-CAM menghasilkan heatmap visual yang menunjukkan area paru yang menjadi fokus model dalam pengambilan keputusan.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Eye className="w-6 h-6 text-cyan-400" />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950">
      {/* ─── Light Background Ambient Orbs ──────────────── */}
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[-10%] w-[700px] h-[700px] bg-blue-500 blur-[120px] rounded-full pointer-events-none z-0 transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.04, 0.07, 0.04] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[40%] right-[-10%] w-[900px] h-[900px] bg-purple-500 blur-[140px] rounded-full pointer-events-none z-0 transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-cyan-500 blur-[100px] rounded-full pointer-events-none z-0 transform-gpu will-change-[opacity]"
      />


      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.15)" />
      
      {/* ─── Hero Section with Parallax ──────────────── */}
      <HeroParallax products={products} />

      {/* ─── Stats Section ───────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "3", label: "Kelas Penyakit", suffix: "" },
              { value: "4", label: "Tahap Pipeline", suffix: "" },
              { value: "99.03", label: "Akurasi Model", suffix: "%" },
              { value: "< 5", label: "Detik Proses", suffix: "s" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 group"
              >
                <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight group-hover:scale-110 transition-transform duration-500">
                  {stat.value}<span className="text-blue-400">{stat.suffix}</span>
                </p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ───────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
              Tentang <span className="gradient-text">Lung-AI</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Sistem klasifikasi citra X-Ray paru menggunakan teknologi deep learning terkini
            </p>
          </motion.div>

          <HoverEffect items={aboutItems} />
        </div>
      </section>

      {/* ─── Model Specs & Performance Section ───────── */}
      <section className="relative z-10 py-24 px-6 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Tech Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                Spesifikasi Teknis
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                Arsitektur AI <br />
                <span className="gradient-text">Kelas Medis</span>
              </h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                Sistem kami menggabungkan model pengolahan citra adaptif, segmentasi organ paru, dan klasifikasi neural network berbasis transformer untuk akurasi tertinggi.
              </p>
              
              <div className="space-y-4 pt-4">
                {[
                  {
                    name: "Vision Transformer (ViT-Base)",
                    desc: "Menggunakan patch projection 16x16 dan 12 transformer encoder layer untuk menangkap pola attention global pada paru.",
                    params: "86.5 Juta Parameter"
                  },
                  {
                    name: "U-Net Segmenter (ResNet Backbone)",
                    desc: "Segmentasi presisi untuk menghasilkan binary mask area paru, mengabaikan noise di luar organ target.",
                    params: "31.2 Juta Parameter"
                  },
                  {
                    name: "CLAHE Preprocessor",
                    desc: "Contrast Limited Adaptive Histogram Equalization untuk normalisasi intensitas cahaya citra secara lokal.",
                    params: "Grid 8x8, Clip Limit 2.0"
                  }
                ].map((tech) => (
                  <div key={tech.name} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-white font-bold text-base">{tech.name}</h4>
                      <Badge className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {tech.params}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Interactive Accuracy/Metrics Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" /> Akurasi Klasifikasi Model
                </h3>

                <div className="space-y-6 relative z-10">
                  {[
                    { label: "Normal (Sehat)", rate: 99.4, color: "from-emerald-500 to-green-400" },
                    { label: "Pneumonia (Paru-Paru Basah)", rate: 99.0, color: "from-blue-500 to-cyan-400" },
                    { label: "Tuberkulosis (TBC)", rate: 98.7, color: "from-purple-500 to-pink-400" }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>{metric.label}</span>
                        <span className="font-mono text-white">{metric.rate}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${metric.rate}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          viewport={{ once: true }}
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-6 border-t border-white/5 mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Sensitivity</p>
                      <p className="text-2xl font-black text-white font-mono">99.1%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Specificity</p>
                      <p className="text-2xl font-black text-white font-mono">99.0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
              Bantuan
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Pertanyaan <span className="gradient-text">Umum (FAQ)</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Bagaimana cara kerja pipeline klasifikasi Lung-AI?",
                a: "Saat rontgen diunggah, sistem pertama-tama meningkatkan kontras gambar menggunakan CLAHE. Kemudian, U-Net memotong area paru-paru (mengabaikan organ lain). Hasil potongan ini diklasifikasikan oleh Vision Transformer (ViT) menjadi Normal, Pneumonia, atau TBC. Terakhir, EigenCAM memvisualisasikan heatmap area deteksi."
              },
              {
                q: "Apakah data citra rontgen pasien aman diunggah ke sini?",
                a: "Sangat aman. Sistem ini dirancang untuk mendeteksi secara lokal di peramban (browser) Anda. Riwayat data diagnosis dan berkas citra medis rontgen Anda disimpan secara aman di penyimpanan lokal (localStorage) browser Anda sendiri tanpa dikirim ke server pihak ketiga eksternal."
              },
              {
                q: "Seberapa akurat prediksi yang dihasilkan oleh model AI?",
                a: "Akurasi rata-rata model kami adalah 99.03%. Model Vision Transformer (ViT) dilatih menggunakan dataset rontgen paru-paru yang luas dan divalidasi oleh metrik medis sensitivitas (99.1%) dan spesifisitas (99.0%). Namun, hasil sistem ini ditujukan sebagai pendukung keputusan klinis (CAD), bukan pengganti diagnosis dokter ahli."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300"
              >
                <h4 className="text-white font-bold text-base mb-2 flex items-center gap-3">
                  <span className="text-blue-400 font-mono">Q.</span> {faq.q}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed pl-6">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Footer ──────────────────────────────── */}
      <section className="relative z-10 py-32 px-6 bg-slate-950/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-16 rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-white/5 relative overflow-hidden group"
        >
          <BackgroundBeams className="opacity-40" />
          <div className="relative z-10">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">
              Siap Untuk Klasifikasi?
            </h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto">
              Upload citra X-Ray dada dan dapatkan hasil klasifikasi dalam hitungan detik menggunakan pipeline AI kami.
            </p>
            <Link
              to="/classify"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold rounded-2xl shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all duration-500 hover:scale-105 text-lg"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
