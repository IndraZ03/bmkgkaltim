"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mail, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from "lucide-react"

export function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get("userId") || ""
  const emailParam = searchParams.get("email") || ""
  const demoCode = searchParams.get("code") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value) && !/^[A-Za-z]*$/.test(value)) return;
    
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").slice(0, 6)
    const newCode = [...code]
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Masukkan 6 digit kode verifikasi")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(userId), code: fullCode }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/pelayanan-data")
        }, 2500)
      } else {
        setError(data.message || "Verifikasi gagal.")
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Email Terverifikasi!</h2>
          <p className="text-sm text-gray-500">
            Akun Anda telah aktif. Anda akan diarahkan ke halaman login...
          </p>
          <div className="h-1 w-16 bg-emerald-200 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
      <Link
        href="/pelayanan-data"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Login
      </Link>

      <div className="flex flex-col items-center gap-3 text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
          <Mail className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
        <p className="text-sm text-gray-500">
          Masukkan 6 digit kode verifikasi yang telah dikirim ke{" "}
          {emailParam ? <strong className="text-gray-800">{emailParam}</strong> : "email Anda"}
        </p>
      </div>

      {/* Demo code display - remove in production */}
      {demoCode && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <p className="text-xs text-amber-700 text-center">
            <strong>Demo Mode:</strong> Kode verifikasi Anda adalah <span className="font-mono font-bold text-lg">{demoCode}</span>
          </p>
        </div>
      )}

      {/* Code Input */}
      <div className="flex gap-2 justify-center mb-6">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <Button
        onClick={handleVerify}
        disabled={loading || code.some(d => !d)}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 mb-4"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Memverifikasi...</>
        ) : (
          "Verifikasi"
        )}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Kode berlaku selama 30 menit
      </p>
    </div>
  )
}
