"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
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
        loginType: "internal",
        redirect: false,
      })

      if (res?.error) {
        setError("Email atau password salah, atau akun tidak memiliki akses internal.")
      } else {
        router.push("/backoffice")
        router.refresh()
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="w-full max-w-sm bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
            <Image 
              src="/BMKG.png"
              alt="BMKG Logo"
              width={72}
              height={72}
              className="mb-1"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <Shield className="h-3 w-3" />
              Akses Internal
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login Internal BMKG</h1>
            <p className="text-sm text-gray-500">Masuk dengan akun pegawai BMKG</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="email@bmkg.go.id" required />
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
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Masuk...</>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
