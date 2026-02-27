"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { 
  FileText, 
  FileCheck, 
  History, 
  HelpCircle, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from "lucide-react"
import { useEffect, useState } from "react"

interface RequestSummary {
  total: number
  pending: number
  processing: number
  completed: number
}

export default function PelayananPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/data-requests")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const summary: RequestSummary = {
    total: requests.length,
    pending: requests.filter(r => ["SUBMITTED", "REVIEWING", "BILLING_ISSUED", "PAYMENT_UPLOADED"].includes(r.status)).length,
    processing: requests.filter(r => ["PAYMENT_CONFIRMED", "DATA_UPLOADED", "SKM_PENDING"].includes(r.status)).length,
    completed: requests.filter(r => r.status === "COMPLETED").length,
  }

  const recentRequests = requests.slice(0, 3)

  const whatsappUrl = "https://wa.me/6281234567890?text=Halo,%20saya%20membutuhkan%20bantuan%20terkait%20pelayanan%20data%20BMKG%20Kaltim."

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-4 right-4 opacity-20">
          <Image src="/logo/nokorupsi1.png" alt="" width={100} height={100} className="object-contain" />
        </div>
        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium mb-1">Portal Pelayanan Data BMKG</p>
          <h1 className="text-3xl font-bold mb-2">
            Selamat Datang, {session?.user?.name}!
          </h1>
          <p className="text-emerald-100 max-w-xl">
            Ajukan permohonan data meteorologi, klimatologi, dan geofisika secara online melalui portal ini.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {summary.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{summary.total}</p>
                <p className="text-xs text-gray-500">Total Permohonan</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{summary.pending}</p>
                <p className="text-xs text-gray-500">Menunggu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{summary.processing}</p>
                <p className="text-xs text-gray-500">Diproses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{summary.completed}</p>
                <p className="text-xs text-gray-500">Selesai</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Layanan Permohonan Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Permohonan Data Informasi */}
          <Link
            href="/pelayanan/permohonan-informasi"
            className="group relative bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    Permohonan Data Informasi
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Layanan data berbayar sesuai dengan Peraturan Pemerintah. Pilih jenis informasi MKG yang Anda butuhkan.
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                    <span>Ajukan Permohonan</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Permohonan Data Nol Rupiah */}
          <Link
            href="/pelayanan/permohonan-nol-rupiah"
            className="group relative bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <FileCheck className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    Permohonan Data Nol Rupiah
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Layanan data gratis untuk keperluan pendidikan, penelitian, dan kegiatan non-komersial lainnya.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                    <span>Ajukan Permohonan</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Requests & Help */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Terakhir</h2>
              <Link href="/pelayanan/riwayat" className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Belum ada riwayat permohonan</p>
                <p className="text-gray-400 text-xs mt-1">Ajukan permohonan data pertama Anda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      req.requestType === "INFORMASI" 
                        ? "bg-blue-100" : "bg-emerald-100"
                    }`}>
                      {req.requestType === "INFORMASI" 
                        ? <FileText className="h-5 w-5 text-blue-600" />
                        : <FileCheck className="h-5 w-5 text-emerald-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {req.requestType === "INFORMASI" ? "Data Informasi" : "Data Nol Rupiah"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                        {req.requestType === "INFORMASI" && req.totalAmount > 0 && (
                          <> • Rp {req.totalAmount.toLocaleString("id-ID")}</>
                        )}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      ["SUBMITTED", "REVIEWING"].includes(req.status) ? "bg-yellow-100 text-yellow-700" :
                      req.status === "BILLING_ISSUED" ? "bg-blue-100 text-blue-700" :
                      req.status === "PAYMENT_UPLOADED" ? "bg-purple-100 text-purple-700" :
                      ["PAYMENT_CONFIRMED", "DATA_UPLOADED", "SKM_PENDING"].includes(req.status) ? "bg-indigo-100 text-indigo-700" :
                      req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {["SUBMITTED", "REVIEWING"].includes(req.status) ? "Menunggu Review" :
                       req.status === "BILLING_ISSUED" ? "Menunggu Pembayaran" :
                       req.status === "PAYMENT_UPLOADED" ? "Verifikasi Pembayaran" :
                       ["PAYMENT_CONFIRMED", "DATA_UPLOADED", "SKM_PENDING"].includes(req.status) ? "Diproses" :
                       req.status === "COMPLETED" ? "Selesai" :
                       req.status === "REJECTED" ? "Ditolak" : req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help & Info */}
        <div className="space-y-6">
          {/* Help Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Hubungi kami via WhatsApp untuk pertanyaan seputar pelayanan data.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat via WhatsApp
            </a>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo/nokorupsi1.png" alt="Anti Korupsi" width={40} height={40} className="object-contain" />
              <div>
                <p className="text-sm font-bold">Zona Integritas</p>
                <p className="text-xs text-slate-300">Wilayah Bebas Korupsi</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Layanan transparan & akuntabel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Zap className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <span>Proses cepat & efisien</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Globe className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>Akses online 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
