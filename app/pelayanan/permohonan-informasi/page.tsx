"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Loader2, CheckCircle2, Info, UploadCloud, Building2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StationService {
  id: number
  layanan: string
  satuan: string
  tarif: number
  stationId: number
}

interface Station {
  id: number
  name: string
  code: string
}

interface CartItem {
  service: StationService
  quantity: number
}

function PermohonanInformasiContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stationId = searchParams.get("stationId")

  const [station, setStation] = useState<Station | null>(null)
  const [services, setServices] = useState<StationService[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [applicationFile, setApplicationFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!stationId) {
      router.push("/pelayanan")
      return
    }

    // Fetch station info
    fetch("/api/stations")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((s: Station) => s.id === parseInt(stationId))
          if (found) setStation(found)
        }
      })

    // Fetch services for this station
    fetch(`/api/station-services?stationId=${stationId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data)
        setLoadingServices(false)
      })
      .catch(() => setLoadingServices(false))
  }, [stationId, router])

  const addToCart = (service: StationService) => {
    const existing = cart.find(c => c.service.id === service.id)
    if (existing) {
      setCart(cart.map(c => 
        c.service.id === service.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, { service, quantity: 1 }])
    }
  }

  const updateQuantity = (serviceId: number, delta: number) => {
    setCart(cart.map(c => {
      if (c.service.id === serviceId) {
        const newQty = Math.max(1, c.quantity + delta)
        return { ...c, quantity: newQty }
      }
      return c
    }))
  }

  const removeFromCart = (serviceId: number) => {
    setCart(cart.filter(c => c.service.id !== serviceId))
  }

  const isInCart = (serviceId: number) => cart.some(c => c.service.id === serviceId)

  const totalAmount = cart.reduce((sum, item) => sum + (item.service.tarif * item.quantity), 0)

  const handleSubmit = async () => {
    if (cart.length === 0) return
    if (!applicationFile) {
      setError("Mohon upload Surat Permohonan terlebih dahulu")
      return
    }
    if (!stationId) {
      setError("Stasiun tujuan belum dipilih")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // 1. Upload File
      setUploading(true)
      const formData = new FormData()
      formData.append("file", applicationFile)
      formData.append("folder", "documents")

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Gagal mengupload dokumen")
      
      const { url: applicationLetterUrl } = await uploadRes.json()
      setUploading(false)

      // 2. Create Data Request
      const res = await fetch("/api/data-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "INFORMASI",
          stationId: parseInt(stationId),
          fullName: session?.user?.name || "",
          email: session?.user?.email || "",
          applicationLetterUrl,
          items: cart.map(item => ({
            serviceId: item.service.id,
            serviceName: item.service.layanan,
            unit: item.service.satuan,
            pricePerUnit: item.service.tarif,
            quantity: item.quantity,
          })),
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/pelayanan/riwayat"), 2500)
      } else {
        const data = await res.json()
        setError(data.message || "Gagal mengajukan permohonan")
        setSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      setError("Terjadi kesalahan sistem")
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permohonan Berhasil!</h2>
          <p className="text-gray-500 mb-2">
            Permohonan data informasi Anda telah dikirim ke {station?.name || "stasiun tujuan"}.
          </p>
          <p className="text-lg font-bold text-emerald-600 mb-6">
            Total: Rp {totalAmount.toLocaleString("id-ID")}
          </p>
          <p className="text-sm text-gray-400">Mengarahkan ke halaman riwayat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pelayanan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Permohonan Data Informasi</h1>
          <p className="text-gray-500 text-sm">Pilih layanan informasi yang Anda butuhkan</p>
        </div>
      </div>

      {/* Station Indicator */}
      {station && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Stasiun Tujuan</p>
            <p className="text-xs text-blue-700">{station.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Tarif sesuai dengan Peraturan Pemerintah tentang Jenis dan Tarif atas Jenis Penerimaan Negara Bukan Pajak. 
              Klik tombol <strong>+ Tambah</strong> untuk menambahkan layanan ke keranjang.
            </p>
          </div>

          {loadingServices ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Memuat layanan...</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-amber-800 mb-1">Belum Ada Layanan</h3>
              <p className="text-sm text-amber-700">
                Stasiun ini belum memiliki layanan yang tersedia. Silakan hubungi pihak stasiun atau pilih stasiun lain.
              </p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-relaxed mb-1">
                      {service.layanan}
                    </h3>
                    <p className="text-xs text-gray-500">{service.satuan}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      Rp {service.tarif.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isInCart(service.id) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ditambahkan
                      </span>
                    ) : (
                      <button
                        onClick={() => addToCart(service)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart / Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Ringkasan Permohonan</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">{cart.length} layanan dipilih</p>
            </div>

            <div className="p-5">
              {cart.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada layanan dipilih</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.service.id} className="flex flex-col gap-2 pb-3 border-b last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{item.service.layanan}</p>
                        <button onClick={() => removeFromCart(item.service.id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                          <button onClick={() => updateQuantity(item.service.id, -1)} className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.service.id, 1)} className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Rp {(item.service.tarif * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="mb-4">
                      <Label htmlFor="application-letter" className="mb-2 block text-sm font-medium text-gray-700">
                        Upload Surat Permohonan (Wajib)
                      </Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <Input
                          id="application-letter"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setApplicationFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <UploadCloud className={`h-8 w-8 ${applicationFile ? "text-blue-500" : "text-gray-400"}`} />
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {applicationFile ? applicationFile.name : "Klik untuk upload PDF/Gambar"}
                          </p>
                        </div>
                      </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                        <p className="text-red-600 text-xs">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {uploading ? "Mengupload..." : "Mengirim..."}</>
                      ) : (
                        "Ajukan Permohonan"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PermohonanInformasiPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    }>
      <PermohonanInformasiContent />
    </Suspense>
  )
}
