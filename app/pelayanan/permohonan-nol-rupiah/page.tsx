"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, FileText, X, Loader2, CheckCircle2, ExternalLink, Info, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface UploadedDoc {
  name: string
  url: string
  size: number
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default function PermohonanNolRupiahPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Form state
  const [fullName, setFullName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [institution, setInstitution] = useState("")
  const [locationInfo, setLocationInfo] = useState("")
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])

  // Document uploads
  const [ktpDoc, setKtpDoc] = useState<UploadedDoc | null>(null)
  const [introLetterDoc, setIntroLetterDoc] = useState<UploadedDoc | null>(null)
  const [statementDoc, setStatementDoc] = useState<UploadedDoc | null>(null)
  const [proposalDoc, setProposalDoc] = useState<UploadedDoc | null>(null)

  const [uploading, setUploading] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Refs
  const ktpRef = useRef<HTMLInputElement>(null)
  const introRef = useRef<HTMLInputElement>(null)
  const statementRef = useRef<HTMLInputElement>(null)
  const proposalRef = useRef<HTMLInputElement>(null)

  // Pre-fill user data
  useState(() => {
    if (session?.user) {
      setFullName(session.user.name || "")
      setEmail(session.user.email || "")
    }
  })

  const uploadFile = async (file: File, folder: string): Promise<UploadedDoc> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) throw new Error("Upload gagal")
    const data = await res.json()
    return { name: file.name, url: data.url, size: file.size }
  }

  const handleFileUpload = async (
    file: File,
    docType: string,
    setter: (doc: UploadedDoc | null) => void,
    maxSizeMB: number,
    acceptedTypes: string[]
  ) => {
    // Validate type
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const validExts = acceptedTypes
    if (!validExts.some(t => ext === t || file.type.includes(t))) {
      setError(`Format file ${docType} tidak didukung.`)
      return
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file ${docType} terlalu besar (maksimal ${maxSizeMB}MB).`)
      return
    }

    setUploading(docType)
    setError("")
    try {
      const doc = await uploadFile(file, "requests")
      setter(doc)
    } catch (err) {
      setError(`Gagal mengunggah ${docType}.`)
    } finally {
      setUploading(null)
    }
  }

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validations
    if (!fullName || !email || !phone || !address) {
      setError("Nama, email, telepon, dan alamat wajib diisi.")
      return
    }
    if (!locationInfo) {
      setError("Lokasi/wilayah informasi wajib diisi.")
      return
    }
    if (selectedMonths.length === 0) {
      setError("Pilih minimal satu bulan informasi.")
      return
    }
    if (!ktpDoc) {
      setError("Foto/scan KTP wajib diunggah.")
      return
    }
    if (!introLetterDoc) {
      setError("Surat pengantar wajib diunggah.")
      return
    }
    if (!statementDoc) {
      setError("Surat pernyataan wajib diunggah.")
      return
    }
    if (!proposalDoc) {
      setError("Dokumen proposal penelitian wajib diunggah.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/data-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "NOL_RUPIAH",
          fullName,
          email,
          phone,
          address,
          institution,
          locationInfo,
          monthInfo: selectedMonths.join(", "),
          ktpDocUrl: ktpDoc.url,
          introLetterUrl: introLetterDoc.url,
          statementUrl: statementDoc.url,
          proposalUrl: proposalDoc.url,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/pelayanan/riwayat"), 2500)
      } else {
        const data = await res.json()
        setError(data.message || "Gagal mengajukan permohonan")
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem")
    } finally {
      setSubmitting(false)
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
          <p className="text-gray-500">
            Permohonan data nol rupiah Anda telah dikirim dan akan diproses oleh tim kami.
          </p>
          <p className="text-sm text-gray-400 mt-4">Mengarahkan ke halaman riwayat...</p>
        </div>
      </div>
    )
  }

  const FileUploadField = ({
    label,
    required,
    hint,
    docType,
    doc,
    setter,
    inputRef,
    accept,
    maxSize,
    acceptedTypes,
    templateLink,
  }: {
    label: string
    required?: boolean
    hint?: string
    docType: string
    doc: UploadedDoc | null
    setter: (d: UploadedDoc | null) => void
    inputRef: React.RefObject<HTMLInputElement | null>
    accept: string
    maxSize: number
    acceptedTypes: string[]
    templateLink?: string
  }) => (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {templateLink && (
        <a 
          href={templateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 -mt-0.5"
        >
          <ExternalLink className="h-3 w-3" />
          Download template surat pernyataan
        </a>
      )}
      
      {!doc ? (
        <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
            {uploading === docType ? (
              <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading === docType ? "Mengunggah..." : "Klik untuk upload"}
            </p>
            <p className="text-xs text-gray-400">Maks {maxSize}MB • {accept}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f, docType, setter, maxSize, acceptedTypes)
            }}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
            <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button type="button" onClick={() => { setter(null); if (inputRef.current) inputRef.current.value = "" }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pelayanan" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permohonan Data Nol Rupiah</h1>
          <p className="text-gray-500 text-sm">Layanan data gratis untuk pendidikan & penelitian</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pemohon</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="fullName">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap pemohon" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Telepon / HP <span className="text-red-500">*</span></Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="institution">Sekolah / Universitas</Label>
                <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Kosongkan jika atas nama pribadi" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">Alamat <span className="text-red-500">*</span></Label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tuliskan alamat lengkap pemohon"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Location & Month Info */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Permohonan</h2>
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="locationInfo">
                Lokasi/Wilayah Informasi yang Diperlukan <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-400 -mt-1">Mohon disebutkan lokasi kejadian dengan lengkap dan jelas (sertakan juga rentang waktu kejadian jika memungkinkan)</p>
              <textarea
                id="locationInfo"
                value={locationInfo}
                onChange={(e) => setLocationInfo(e.target.value)}
                placeholder="Contoh: Kota Samarinda, Kecamatan Sungai Kunjang, periode Januari - Maret 2025"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Bulan Informasi yang Diperlukan <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {MONTHS.map(month => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleMonth(month)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedMonths.includes(month)
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
              {selectedMonths.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  Dipilih: {selectedMonths.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Dokumen Pendukung</h2>
          <p className="text-sm text-gray-500 mb-4">Semua dokumen wajib diunggah untuk proses verifikasi</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Mohon nama file dokumen yang dicantumkan disesuaikan dengan nama pemohon untuk memudahkan proses pelayanan data.
            </p>
          </div>

          <div className="space-y-5">
            <FileUploadField
              label="Foto/Scan Dokumen KTP"
              required
              hint="Upload file PDF atau gambar (JPG, PNG). Maks 10MB."
              docType="KTP"
              doc={ktpDoc}
              setter={setKtpDoc}
              inputRef={ktpRef}
              accept="image/*,.pdf"
              maxSize={10}
              acceptedTypes={["jpg", "jpeg", "png", "webp", "pdf", "image"]}
            />

            <FileUploadField
              label="Scan Surat Pengantar dari Universitas / Sekolah"
              required
              hint="Upload file PDF, Word, atau gambar. Maks 10MB."
              docType="Surat Pengantar"
              doc={introLetterDoc}
              setter={setIntroLetterDoc}
              inputRef={introRef}
              accept="image/*,.pdf,.doc,.docx"
              maxSize={10}
              acceptedTypes={["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "image", "document"]}
            />

            <FileUploadField
              label="Scan Dokumen Surat Pernyataan"
              required
              hint="Upload file PDF, Word, atau gambar. Maks 10MB."
              docType="Surat Pernyataan"
              doc={statementDoc}
              setter={setStatementDoc}
              inputRef={statementRef}
              accept="image/*,.pdf,.doc,.docx"
              maxSize={10}
              acceptedTypes={["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "image", "document"]}
              templateLink="https://drive.google.com/open?id=1I0J1GFkmvry06NgqWV-fy0vDcYn4lzT1"
            />

            <FileUploadField
              label="Dokumen Proposal Penelitian"
              required
              hint="Upload file PDF atau Word. Maks 100MB."
              docType="Proposal"
              doc={proposalDoc}
              setter={setProposalDoc}
              inputRef={proposalRef}
              accept=".pdf,.doc,.docx"
              maxSize={100}
              acceptedTypes={["pdf", "doc", "docx"]}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-base"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Mengirim Permohonan...</>
            ) : (
              "Ajukan Permohonan Data Nol Rupiah"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
