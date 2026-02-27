"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, UploadCloud, 
  CreditCard, FileCheck, Download, Star, AlertCircle, Loader2,
  ChevronRight, Sparkles, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Dynamic STEPS based on request type
const getSteps = (requestType: string) => {
  if (requestType === "NOL_RUPIAH") {
    return [
      { id: "SUBMITTED", label: "Pengajuan", icon: FileText, description: "Formulir diajukan" },
      { id: "PAYMENT_CONFIRMED", label: "Review", icon: Clock, description: "Ditinjau petugas" },
      { id: "DATA_UPLOADED", label: "Data Siap", icon: FileCheck, description: "Dokumen disiapkan" },
      { id: "COMPLETED", label: "SKM & Selesai", icon: Star, description: "Survei & unduh data" },
    ];
  }
  return [
    { id: "SUBMITTED", label: "Pengajuan", icon: FileText, description: "Formulir diajukan" },
    { id: "BILLING_ISSUED", label: "Pembayaran", icon: CreditCard, description: "Bayar via SIMPONI" },
    { id: "PAYMENT_UPLOADED", label: "Verifikasi", icon: Clock, description: "Verifikasi pembayaran" },
    { id: "PAYMENT_CONFIRMED", label: "Proses Data", icon: FileCheck, description: "Data dikerjakan" },
    { id: "DATA_UPLOADED", label: "SKM", icon: Star, description: "Survei kepuasan" },
    { id: "COMPLETED", label: "Selesai", icon: CheckCircle2, description: "Unduh data" },
  ];
};

interface SkmQuestion {
  id: number;
  code: string;
  question: string;
  category: string | null;
  orderIndex: number;
}

// Star rating labels
const ratingLabels: Record<number, string> = {
  1: "Tidak Baik",
  2: "Kurang Baik",
  3: "Cukup",
  4: "Baik",
  5: "Sangat Baik",
};

export default function DetailPermohonanPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [skmFeedback, setSkmFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // SKM multi-question state
  const [skmQuestions, setSkmQuestions] = useState<SkmQuestion[]>([]);
  const [questionRatings, setQuestionRatings] = useState<Record<number, number>>({});
  const [hoveredStar, setHoveredStar] = useState<Record<number, number>>({});

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/data-requests/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      } else {
        router.push("/pelayanan/riwayat");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkmQuestions = async () => {
    try {
      const res = await fetch("/api/skm/questions");
      if (res.ok) {
        const data = await res.json();
        setSkmQuestions(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequest();
    fetchSkmQuestions();
  }, [params.id]);

  const handleUploadPayment = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payments");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      await fetch(`/api/data-requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPLOAD_PAYMENT", paymentProofUrl: url }),
      });
      
      setFile(null);
      fetchRequest();
    } catch (error) {
      alert("Gagal mengupload bukti pembayaran");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitSKM = async () => {
    const allAnswered = skmQuestions.every(q => questionRatings[q.id] > 0);
    if (!allAnswered || !skmFeedback.trim()) return;
    
    setSubmitting(true);
    try {
      const avgRating = Math.round(
        Object.values(questionRatings).reduce((a, b) => a + b, 0) / 
        Object.values(questionRatings).length
      );

      await fetch(`/api/data-requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "SUBMIT_SKM", 
          rating: avgRating, 
          feedback: skmFeedback,
          questionRatings: Object.entries(questionRatings).map(([qId, rating]) => ({
            questionId: parseInt(qId),
            rating,
          })),
        }),
      });
      fetchRequest();
    } catch (error) {
      alert("Gagal mengirim SKM");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 animate-pulse" />
        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-blue-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">Memuat detail permohonan...</p>
    </div>
  );
  if (!request) return null;

  const STEPS = getSteps(request.requestType);
  const currentStepIndex = STEPS.findIndex(s => s.id === request.status);
  const isRejected = request.status === "REJECTED";
  const allQuestionsAnswered = skmQuestions.length > 0 && skmQuestions.every(q => questionRatings[q.id] > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-blue-50 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Permohonan #{request.id}</h1>
          <p className="text-gray-500 text-sm">
            {request.requestType === "INFORMASI" ? "Data Informasi" : "Data Nol Rupiah"} • {new Date(request.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* ========== MODERN DYNAMIC PROGRESS STEPPER ========== */}
      {!isRejected ? (
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl border border-blue-100/50 shadow-lg shadow-blue-100/20 p-6 md:p-8 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />
          
          <div className="relative">
            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Progress Permohonan</h3>
            </div>

            {/* Desktop Stepper */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between relative">
                {/* Connecting line background */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full -z-0" />
                {/* Animated progress line */}
                <div 
                  className="absolute top-6 left-6 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 rounded-full -z-0 transition-all duration-1000 ease-out"
                  style={{ 
                    width: currentStepIndex >= 0 
                      ? `calc(${(currentStepIndex / (STEPS.length - 1)) * 100}% - 48px)` 
                      : '0%'
                  }}
                />

                {STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isFuture = index > currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 relative z-10" style={{ flex: 1 }}>
                      {/* Step circle */}
                      <div className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center 
                        transition-all duration-500 ease-out
                        ${isCompleted 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200 scale-100" 
                          : isCurrent 
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-200 scale-110 ring-4 ring-blue-100" 
                            : "bg-white text-gray-300 border-2 border-gray-200 scale-95"
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 animate-in zoom-in duration-300" />
                        ) : (
                          <Icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                        )}
                        
                        {/* Pulse ring for current step */}
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                        )}
                      </div>

                      {/* Label */}
                      <div className="text-center mt-1">
                        <p className={`text-xs font-bold transition-colors ${
                          isCompleted ? "text-emerald-700" : 
                          isCurrent ? "text-blue-700" : 
                          "text-gray-400"
                        }`}>
                          {step.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 transition-colors max-w-[100px] ${
                          isCompleted ? "text-emerald-500" : 
                          isCurrent ? "text-blue-500" : 
                          "text-gray-300"
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden space-y-3">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {/* Step indicator */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      transition-all duration-300
                      ${isCompleted 
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" 
                        : isCurrent 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100" 
                          : "bg-gray-100 text-gray-300"
                      }
                    `}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                    </div>
                    
                    {/* Label */}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-700" : "text-gray-400"
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-xs ${
                        isCompleted ? "text-emerald-500" : isCurrent ? "text-blue-500" : "text-gray-300"
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Status badge */}
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full animate-pulse">
                        AKTIF
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg shadow-red-100/30">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-700">Permohonan Ditolak</h3>
          <p className="text-red-600 mt-2 max-w-md text-sm">{request.rejectionReason || "Tidak ada alasan spesifik."}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content / Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ACTION: Billing & Payment */}
          {request.status === "BILLING_ISSUED" && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 border-l-4 border-l-blue-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Pembayaran Diperlukan
              </h3>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl mb-6 border border-blue-100">
                <p className="text-sm text-blue-700 mb-1 font-medium">Kode Billing SIMPONI</p>
                <p className="text-3xl font-mono font-bold text-blue-900 tracking-wider select-all">
                  {request.billingCode}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Silakan lakukan pembayaran melalui ATM/Internet Banking dengan kode di atas sebesar 
                   <span className="font-bold"> Rp {request.totalAmount?.toLocaleString("id-ID")}</span>
                </p>
              </div>

              <div className="space-y-4">
                <Label>Upload Bukti Pembayaran</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group hover:border-blue-300">
                   <Input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                   />
                   <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <UploadCloud className={`h-8 w-8 transition-colors ${file ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400"}`} />
                      <p className="text-sm text-gray-500">
                        {file ? file.name : "Klik untuk upload bukti bayar"}
                      </p>
                   </div>
                </div>
                {file && (
                  <Button onClick={handleUploadPayment} disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {uploading ? "Mengupload..." : "Kirim Bukti Pembayaran"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ACTION: Waiting Confirmation */}
          {request.status === "PAYMENT_UPLOADED" && (
            <div className="bg-white rounded-2xl border shadow-sm p-8 text-center bg-gradient-to-br from-yellow-50 to-white">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-yellow-200/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Menunggu Konfirmasi</h3>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                Bukti pembayaran Anda sedang diverifikasi oleh petugas. Kami akan memproses data setelah pembayaran terkonfirmasi.
              </p>
            </div>
          )}

          {/* ACTION: Processing Data */}
          {request.status === "PAYMENT_CONFIRMED" && (
            <div className="bg-white rounded-2xl border shadow-sm p-8 text-center bg-gradient-to-br from-blue-50 to-white">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-200/30 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sedang Diproses</h3>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                Data Anda sedang dipersiapkan oleh tim DATIN. Notifikasi akan dikirim setelah data siap.
              </p>
            </div>
          )}

          {/* ACTION: SKM Survey & Download */}
          {(request.status === "DATA_UPLOADED" || request.status === "COMPLETED") && (
             <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-0">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-500" />
                    Hasil Permohonan
                  </h3>
                  {request.status === "COMPLETED" && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Selesai
                    </span>
                  )}
                </div>

                {request.status === "DATA_UPLOADED" ? (
                  <div className="p-6">
                    {/* SKM Survey Header */}
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-900">Survei Kepuasan Masyarakat (SKM)</h4>
                          <p className="text-xs text-amber-700">Mohon isi survei berikut untuk membuka akses unduhan data</p>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${(Object.keys(questionRatings).length / Math.max(skmQuestions.length, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-amber-700 font-bold whitespace-nowrap">
                          {Object.keys(questionRatings).length}/{skmQuestions.length}
                        </span>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      {skmQuestions.map((q, qIndex) => (
                        <div 
                          key={q.id} 
                          className={`
                            bg-white border rounded-xl p-5 transition-all duration-300
                            ${questionRatings[q.id] 
                              ? 'border-emerald-200 bg-emerald-50/30 shadow-sm' 
                              : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                            }
                          `}
                        >
                          {/* Question header */}
                          <div className="flex items-start gap-3 mb-3">
                            <span className={`
                              w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
                              ${questionRatings[q.id] 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-gray-100 text-gray-500'
                              }
                            `}>
                              {q.code}
                            </span>
                            <div className="flex-1">
                              {q.category && (
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{q.category}</span>
                              )}
                              <p className="text-sm text-gray-800 font-medium leading-relaxed">{q.question}</p>
                            </div>
                          </div>

                          {/* Star rating */}
                          <div className="flex items-center gap-1 ml-10">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isActive = (hoveredStar[q.id] || questionRatings[q.id] || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoveredStar(prev => ({ ...prev, [q.id]: star }))}
                                  onMouseLeave={() => setHoveredStar(prev => ({ ...prev, [q.id]: 0 }))}
                                  onClick={() => setQuestionRatings(prev => ({ ...prev, [q.id]: star }))}
                                  className="group relative p-1 transition-transform duration-200 hover:scale-125"
                                >
                                  <Star 
                                    className={`h-7 w-7 transition-all duration-200 ${
                                      isActive 
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
                                        : 'text-gray-200 hover:text-amber-200'
                                    }`} 
                                  />
                                </button>
                              );
                            })}
                            {(hoveredStar[q.id] || questionRatings[q.id]) > 0 && (
                              <span className={`
                                ml-2 text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-200
                                ${(hoveredStar[q.id] || questionRatings[q.id]) >= 4 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : (hoveredStar[q.id] || questionRatings[q.id]) >= 3 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-red-100 text-red-700'
                                }
                              `}>
                                {ratingLabels[hoveredStar[q.id] || questionRatings[q.id]]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback and Submit */}
                    <div className="mt-6 space-y-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <Label className="text-sm font-bold text-gray-700">Kritik dan Saran</Label>
                        </div>
                        <Textarea
                          placeholder="Tulis kritik, saran, atau masukan Anda untuk peningkatan layanan kami..."
                          value={skmFeedback}
                          onChange={(e) => setSkmFeedback(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <Button 
                        onClick={handleSubmitSKM} 
                        disabled={submitting || !allQuestionsAnswered || !skmFeedback.trim()}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base shadow-lg shadow-amber-200/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Mengirim...</>
                        ) : !allQuestionsAnswered ? (
                          `Jawab ${skmQuestions.length - Object.keys(questionRatings).length} pertanyaan lagi`
                        ) : (
                          <>
                            <Star className="h-5 w-5 mr-2" />
                            Kirim Ulasan & Buka Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-8 text-center">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                        <Download className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-800 mb-2">Download Data Anda</h3>
                      <p className="text-sm text-emerald-600 mb-6">
                        Data permohonan Anda siap untuk diunduh. Tautan ini berlaku selamanya.
                      </p>
                      <Button 
                        onClick={() => window.open(request.dataDocumentUrl, "_blank")}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 h-11 px-8"
                      >
                        <Download className="h-5 w-5" />
                        Unduh Dokumen
                      </Button>
                      
                      {/* Show completed survey results */}
                      {request.skmResponses && request.skmResponses.length > 0 && (
                        <div className="mt-8 bg-white border border-emerald-200 rounded-xl p-5 text-left">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            Hasil Survei Anda
                          </h4>
                          <div className="space-y-2">
                            {request.skmResponses.map((sr: any) => (
                              <div key={sr.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{sr.question?.category || sr.question?.code}</span>
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star 
                                      key={s} 
                                      className={`h-4 w-4 ${s <= sr.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Rata-rata</span>
                            <span className="text-lg font-bold text-amber-600">{request.skmRating}/5 ★</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>
          )}
          
          {/* Requester Details */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Detail Pemohon</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-gray-500 text-xs">Nama Lengkap</p>
                 <p className="font-medium">{request.fullName}</p>
               </div>
               <div>
                 <p className="text-gray-500 text-xs">Email</p>
                 <p className="font-medium">{request.email}</p>
               </div>
               {request.institution && (
                 <div className="col-span-2">
                   <p className="text-gray-500 text-xs">Instansi</p>
                   <p className="font-medium">{request.institution}</p>
                 </div>
               )}
            </div>
            
            {request.applicationLetterUrl && (
              <div className="mt-4 pt-4 border-t">
                 <p className="text-gray-500 text-xs mb-2">Dokumen Pendukung</p>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 h-8 text-xs"
                    onClick={() => window.open(request.applicationLetterUrl, "_blank")}
                 >
                   <FileText className="h-3 w-3" />
                   Lihat Surat Permohonan
                 </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Summary */}
        <div className="lg:col-span-1 space-y-6">
           {request.items && request.items.length > 0 && (
             <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Rincian Layanan</h3>
                <div className="space-y-4">
                   {request.items.map((item: any) => (
                     <div key={item.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                        <p className="font-medium text-gray-900">{item.serviceName}</p>
                        <div className="flex justify-between text-gray-500 mt-1 text-xs">
                           <span>{item.quantity} {item.unit}</span>
                           <span>x Rp {item.pricePerUnit.toLocaleString("id-ID")}</span>
                        </div>
                        <p className="text-right font-medium text-gray-900 mt-1">
                           Rp {item.subtotal.toLocaleString("id-ID")}
                        </p>
                     </div>
                   ))}
                   <div className="pt-3 border-t flex justify-between items-center font-bold">
                      <span>Total Biaya</span>
                      <span className="text-blue-600">
                        Rp {request.totalAmount?.toLocaleString("id-ID")}
                      </span>
                   </div>
                </div>
             </div>
           )}
           
           <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-800 leading-relaxed">
              <p className="font-bold mb-1">Butuh Bantuan?</p>
              Hubungi tim DATIN kami melalui WhatsApp atau email jika Anda mengalami kendala dalam proses permohonan.
           </div>
        </div>
      </div>
    </div>
  );
}
