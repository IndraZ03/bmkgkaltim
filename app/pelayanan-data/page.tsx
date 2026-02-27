"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, Loader2, Shield, Zap, Globe } from "lucide-react"

export default function PelayananDataLoginPage() {
  const [captchaValue, setCaptchaValue] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaValue(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (captchaInput !== captchaValue) {
      setError("Captcha salah, silakan coba lagi.")
      generateCaptcha()
      setCaptchaInput("")
      setLoading(false)
      return
    }

    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    try {
      const res = await signIn("credentials", {
        email,
        password,
        loginType: "pelayanan",
        redirect: false,
      })

      if (res?.error) {
        if (res.error.includes("UNVERIFIED:")) {
          const userId = res.error.split("UNVERIFIED:")[1]
          router.push(`/verify?userId=${userId}`)
          return
        }
        setError("Email atau password salah, atau akun belum diverifikasi.")
      } else {
        router.push("/pelayanan")
        router.refresh()
      }
    } catch (err: any) {
      if (err?.message?.includes("UNVERIFIED:")) {
        const userId = err.message.split("UNVERIFIED:")[1]
        router.push(`/verify?userId=${userId}`)
        return
      }
      setError("Terjadi kesalahan saat login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-10 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 md:gap-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/BMKG.png" alt="BMKG" width={48} height={48} />
              <div>
                <p className="font-bold text-lg leading-tight">BMKG</p>
                <p className="text-emerald-100 text-xs">Kalimantan Timur</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Portal Pelayanan Data
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Ajukan permohonan data meteorologi, klimatologi, dan geofisika secara online dengan mudah dan transparan.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-8">
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <span>Layanan transparan & akuntabel</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <span>Proses cepat & efisien</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <span>Akses online 24/7</span>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
            <Image src="/logo/nokorupsi1.png" alt="Anti Korupsi" width={100} height={40} className="object-contain opacity-60" />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="p-7 md:p-8 flex flex-col justify-center">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
              <div className="md:hidden mb-2">
                <Image src="/BMKG.png" alt="BMKG Logo" width={64} height={64} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <Users className="h-3 w-3" />
                Pelayanan Data
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h1>
              <p className="text-sm text-gray-500">
                Gunakan email dan password yang terdaftar
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@example.com" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="captcha">Captcha</Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-100 flex items-center justify-center font-mono text-xl font-bold tracking-widest border rounded-lg select-none relative overflow-hidden h-11">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '5px 5px'}}></div>
                    {captchaValue.split('').map((char, i) => (
                      <span key={i} style={{transform: `rotate(${Math.random() * 20 - 10}deg)`, display: 'inline-block', margin: '0 2px'}}>{char}</span>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} title="Refresh Captcha" className="h-11 w-11">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
                  </Button>
                </div>
                <Input 
                  id="captcha" 
                  placeholder="Masukkan kode captcha" 
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Masuk...</>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="relative text-center text-sm mt-5 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-white px-2 text-muted-foreground">
              Atau
            </span>
          </div>
          <div className="text-center text-sm mt-5">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-800 underline underline-offset-4">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
