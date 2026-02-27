"use client"

import { useEffect, useState } from "react"
import { FileText, FileCheck, Clock, Loader2 as LoaderIcon, CheckCircle2, XCircle, Search, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface DataRequestItem {
  id: number
  serviceId: number
  serviceName: string
  unit: string
  pricePerUnit: number
  quantity: number
  subtotal: number
}

interface DataRequest {
  id: number
  requestType: "INFORMASI" | "NOL_RUPIAH"
  status: "SUBMITTED" | "REVIEWING" | "BILLING_ISSUED" | "PAYMENT_UPLOADED" | "PAYMENT_CONFIRMED" | "DATA_UPLOADED" | "SKM_PENDING" | "COMPLETED" | "REJECTED"
  fullName: string
  email: string
  phone: string | null
  address: string | null
  institution: string | null
  locationInfo: string | null
  monthInfo: string | null
  totalAmount: number | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  items: DataRequestItem[]
}

function getStatusConfig(status: string) {
  switch (status) {
    case "SUBMITTED": 
    case "REVIEWING":
      return { label: "Menunggu Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock }
    case "BILLING_ISSUED": 
      return { label: "Menunggu Pembayaran", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CreditCard }
    case "PAYMENT_UPLOADED":
      return { label: "Verifikasi Pembayaran", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Clock }
    case "PAYMENT_CONFIRMED":
    case "DATA_UPLOADED":
    case "SKM_PENDING":
      return { label: "Diproses", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: LoaderIcon }
    case "COMPLETED": 
      return { label: "Selesai", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 }
    case "REJECTED": 
      return { label: "Ditolak", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle }
    default: 
      return { label: status, color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock }
  }
}

export default function RiwayatPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | "INFORMASI" | "NOL_RUPIAH">("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  
  useEffect(() => {
    fetch("/api/data-requests")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = requests.filter(req => {
    const matchType = filterType === "ALL" || req.requestType === filterType
    const matchStatus = filterStatus === "ALL"
      // Simple status grouping for filter
      ? true 
      : (filterStatus === "PENDING" ? ["SUBMITTED", "REVIEWING", "BILLING_ISSUED", "PAYMENT_UPLOADED"].includes(req.status)
        : filterStatus === "PROCESSING" ? ["PAYMENT_CONFIRMED", "DATA_UPLOADED", "SKM_PENDING"].includes(req.status)
        : req.status === filterStatus)

    const matchSearch = req.fullName.toLowerCase().includes(search.toLowerCase()) ||
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      (req.institution || "").toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Permohonan</h1>
        <p className="text-gray-500 text-sm">Pantau status permohonan data Anda</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan nama, email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="INFORMASI">Data Informasi</option>
            <option value="NOL_RUPIAH">Data Nol Rupiah</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PROCESSING">Diproses</option>
            <option value="COMPLETED">Selesai</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {requests.length === 0 ? "Belum Ada Permohonan" : "Tidak Ditemukan"}
          </h3>
          <p className="text-gray-500 text-sm">
            {requests.length === 0 ? "Ajukan permohonan data pertama Anda" : "Coba ubah filter pencarian"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const statusConfig = getStatusConfig(req.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={req.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div
                  onClick={() => router.push(`/pelayanan/riwayat/${req.id}`)}
                  className="w-full p-5 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                      req.requestType === "INFORMASI" ? "bg-blue-100" : "bg-emerald-100"
                    }`}>
                      {req.requestType === "INFORMASI" 
                        ? <FileText className="h-6 w-6 text-blue-600" />
                        : <FileCheck className="h-6 w-6 text-emerald-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {req.requestType === "INFORMASI" ? "Permohonan Data Informasi" : "Permohonan Data Nol Rupiah"}
                        </h3>
                        <span className="text-xs text-gray-400">#{req.id}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                        {req.requestType === "INFORMASI" && req.totalAmount && req.totalAmount > 0 && (
                          <> • <strong className="text-blue-600">Rp {req.totalAmount.toLocaleString("id-ID")}</strong></>
                        )}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border flex-shrink-0 ${statusConfig.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
