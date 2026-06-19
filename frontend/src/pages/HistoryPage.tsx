import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, ChevronLeft, ChevronRight, FileSearch, Trash2, Download, Ruler, Weight, Users } from "lucide-react";
import { Examination } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "motion/react";
import { generatePdfReport } from "@/lib/generatePdfReport";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const existingHistoryJson = localStorage.getItem("lungai_history");
      if (existingHistoryJson) {
        const docs = JSON.parse(existingHistoryJson) as Examination[];
        setExaminations(docs);
      } else {
        setExaminations([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setExaminations([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = (id: string) => {
    const updated = examinations.filter((e) => e.id !== id);
    setExaminations(updated);
    localStorage.setItem("lungai_history", JSON.stringify(updated));
    if (selectedExam?.id === id) setSelectedExam(null);
    toast.success("Data Dihapus", { description: "Riwayat pemeriksaan telah dihapus." });
  };

  const clearLedger = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat pemeriksaan?")) {
      localStorage.removeItem("lungai_history");
      setExaminations([]);
      toast.success("Riwayat Dihapus", { description: "Seluruh riwayat pemeriksaan telah dihapus." });
    }
  };

  const filteredExams = examinations.filter(
    (exam) =>
      exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.prediction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 pt-28 pb-20">
      {/* BG */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-purple-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />
      <motion.div
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[10%] left-[-5%] w-[700px] h-[700px] bg-blue-500 blur-[120px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
      />


      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 flex-1 max-w-lg">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Histori
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
                  Riwayat <span className="gradient-text">Klasifikasi</span>
                </h1>
                <p className="text-slate-500 text-sm">
                  Lihat dan kelola semua riwayat klasifikasi X-Ray yang telah dilakukan.
                </p>
              </div>

              {/* Animated Placeholders Vanish Search Box */}
              <PlaceholdersAndVanishInput
                placeholders={[
                  "Cari nama pasien...",
                  "Cari ID pasien (misal: #LN-...)",
                  "Cari berdasarkan prediksi (Normal, Pneumonia, TBC)...",
                  "Masukkan nama pasien untuk mencari riwayat..."
                ]}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 font-semibold px-5 rounded-xl text-sm"
                onClick={fetchHistory}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2 text-blue-400" />}
                Refresh
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300 font-semibold px-5 rounded-xl text-sm"
                onClick={clearLedger}
                disabled={loading || examinations.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-3xl">
              <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <p className="text-sm text-slate-400">Memuat riwayat...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center p-12 text-center bg-black/20 backdrop-blur-3xl border border-white/5 shadow-2xl relative group overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-radial from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center mb-6 text-slate-500 transition-all duration-700 group-hover:scale-110 group-hover:border-blue-500/20 group-hover:text-blue-400">
                <FileSearch className="w-10 h-10" />
              </div>
              <p className="text-lg font-bold text-slate-200 mb-2 tracking-tight group-hover:text-white transition-colors">
                {examinations.length === 0 ? "Belum ada riwayat klasifikasi" : "Tidak ada hasil yang cocok"}
              </p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mx-auto">
                {examinations.length === 0 ? "Mulai klasifikasi pertama Anda dengan mengunggah citra rontgen di halaman Klasifikasi." : "Coba periksa kembali ejaan nama pasien atau ID rujukan yang Anda masukkan."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-3xl border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">
                <Table>
                  <TableHeader className="bg-white/[0.02] border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[130px] font-bold text-slate-500 uppercase text-[10px] tracking-wider pl-8 py-5">Tanggal</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5">Pasien</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5 text-center">Gender</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5 text-center">Umur</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5 text-center">TB/BB</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5 text-center">Prediksi</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-5 text-center">Confidence</TableHead>
                      <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider pr-8 py-5">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExams.map((exam) => (
                      <TableRow key={exam.id} className="border-white/5 hover:bg-white/[0.03] transition-all">
                        <TableCell className="font-mono text-[10px] text-slate-400 pl-8 py-4">
                          {new Date(exam.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          <p className="text-[9px] text-slate-600 mt-0.5">
                            {new Date(exam.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-bold text-white text-sm">{exam.patientName}</p>
                            <p className="font-mono text-[9px] text-blue-500/70 tracking-wider">{exam.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="text-xs text-slate-400">{exam.gender}</span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="text-xs text-slate-400">{exam.age} thn</span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <span className="text-xs text-slate-400">{exam.height} cm / {exam.weight} kg</span>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <Badge
                            variant="outline"
                            className={`font-bold text-[9px] tracking-wider px-3 py-1 border-none rounded-full ${
                              exam.prediction === "Normal"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : exam.prediction === "Tuberculosis (TBC)"
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {exam.prediction}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <div className="inline-flex flex-col items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{exam.confidence.toFixed(1)}%</span>
                            <div className="w-14 bg-white/5 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${
                                  exam.confidence > 90 ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${exam.confidence}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedExam(exam)}
                              className="h-9 px-4 bg-white/[0.02] border border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 font-bold text-[10px] tracking-wider rounded-lg"
                            >
                              Detail
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExam(exam.id)}
                              className="h-9 px-3 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedExams.map((exam) => (
                  <Card key={exam.id} className="lg:hidden bg-black/40 backdrop-blur-3xl border-white/5 overflow-hidden rounded-2xl hover:border-white/10 transition-all">
                    <CardHeader className="p-5 border-b border-white/5 bg-white/[0.02]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-slate-600 font-mono">
                            {new Date(exam.date).toLocaleDateString("id-ID")} • {new Date(exam.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <h3 className="font-bold text-white text-lg mt-1">{exam.patientName}</h3>
                          <p className="text-[9px] text-blue-500/70 font-mono">{exam.patientId}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {exam.gender} • {exam.age} thn • {exam.height} cm / {exam.weight} kg
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-bold text-[8px] tracking-wider px-3 py-1 border-none rounded-full ${
                            exam.prediction === "Normal"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : exam.prediction === "Tuberculosis (TBC)"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {exam.prediction}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-600 uppercase">Confidence</span>
                        <span className="font-mono text-xs text-white font-bold">{exam.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedExam(exam)}
                          className="flex-1 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 h-10 font-semibold text-xs rounded-xl"
                        >
                          Detail
                        </Button>
                        <Button
                          onClick={() => deleteExam(exam.id)}
                          variant="ghost"
                          className="h-10 px-3 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <Button
                    variant="outline"
                    className="h-10 bg-white/[0.02] border-white/5 text-slate-400 gap-2 font-semibold text-xs px-5 rounded-xl disabled:opacity-30 transition-all duration-300"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all border ${
                          page === currentPage
                            ? "bg-white text-black shadow-lg shadow-white/5 border-white"
                            : "bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 bg-white/[0.02] border-white/5 text-slate-400 gap-2 font-semibold text-xs px-5 rounded-xl disabled:opacity-30 transition-all duration-300"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={selectedExam !== null} onOpenChange={(open) => { if (!open) setSelectedExam(null); }}>
        <DialogContent className="max-w-3xl bg-[#030712] border-white/5 text-white rounded-3xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-bold text-[10px] tracking-wider px-3 py-1 border-none rounded-full ${
                  selectedExam?.prediction === "Normal"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : selectedExam?.prediction === "Tuberculosis (TBC)"
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {selectedExam?.prediction}
              </Badge>
              <span className="text-slate-500 text-xs">{selectedExam?.confidence?.toFixed(2)}% confidence</span>
            </div>
            <DialogTitle className="text-2xl font-black text-white mt-2">
              {selectedExam?.patientName}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              ID: {selectedExam?.patientId} • {selectedExam?.date ? new Date(selectedExam.date).toLocaleString("id-ID") : ""}
            </DialogDescription>
          </DialogHeader>

          {/* Patient Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {selectedExam && [
              { label: "Gender", value: selectedExam.gender, icon: <Users className="w-3.5 h-3.5 text-indigo-400" /> },
              { label: "Umur", value: `${selectedExam.age} tahun`, icon: <Calendar className="w-3.5 h-3.5 text-teal-400" /> },
              { label: "Tinggi Badan", value: `${selectedExam.height} cm`, icon: <Ruler className="w-3.5 h-3.5 text-purple-400" /> },
              { label: "Berat Badan", value: `${selectedExam.weight} kg`, icon: <Weight className="w-3.5 h-3.5 text-pink-400" /> },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.icon}
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl mt-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-2">Penjelasan Klinis</p>
            <p className="text-xs text-slate-300 leading-relaxed pl-2">
              {selectedExam?.notes || "Tidak ada penjelasan tersedia."}
            </p>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input Scan</p>
              <div className="aspect-square bg-black/60 p-1.5 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                {selectedExam?.imageUrl ? (
                  <img src={selectedExam.imageUrl} alt="Original Scan" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Tidak tersedia</div>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Grad-CAM Heatmap</p>
              <div className="aspect-square bg-black/60 p-1.5 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                {selectedExam?.heatmapUrl ? (
                  <img src={selectedExam.heatmapUrl} alt="Grad-CAM Heatmap" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Tidak tersedia</div>
                )}
              </div>
            </div>
          </div>

          {/* Export PDF Button */}
          {selectedExam && (
            <div className="mt-6 flex justify-end">
              <Button
                className="h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 px-6"
                onClick={() => {
                  // Extract base64 from data URLs
                  const getBase64 = (dataUrl?: string) => {
                    if (!dataUrl) return undefined;
                    const parts = dataUrl.split(",");
                    return parts.length > 1 ? parts[1] : dataUrl;
                  };

                  generatePdfReport({
                    patientName: selectedExam.patientName,
                    patientId: selectedExam.patientId,
                    gender: selectedExam.gender,
                    age: selectedExam.age,
                    height: selectedExam.height,
                    weight: selectedExam.weight,
                    prediction: selectedExam.prediction,
                    confidence: selectedExam.confidence,
                    explanation: selectedExam.notes || "Tidak ada penjelasan tersedia.",
                    date: selectedExam.date,
                    images: {
                      original: getBase64(selectedExam.imageUrl),
                      gradcam: getBase64(selectedExam.heatmapUrl),
                    },
                  });
                  toast.success("PDF Berhasil", { description: "Laporan PDF telah diunduh." });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
