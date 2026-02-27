"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Users, ArrowLeft, Loader2 } from "lucide-react"

type LoginMode = "select" | "internal" | "pelayanan";

export function LoginForm({
  className,
  initialMode,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { initialMode?: LoginMode }) {
  const [mode, setMode] = useState<LoginMode>(initialMode || "select")
  const [captchaValue, setCaptchaValue] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateCaptcha();
    // Check if there's a mode param
    const modeParam = searchParams.get("mode");
    if (modeParam === "internal" || modeParam === "pelayanan") {
      setMode(modeParam);
    }
  }, [searchParams])

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (captchaInput !== captchaValue) {
      setError("Captcha salah, silakan coba lagi.");
      generateCaptcha();
      setCaptchaInput("");
      setLoading(false);
      return;
    }

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        loginType: mode,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("UNVERIFIED:")) {
          const userId = res.error.split("UNVERIFIED:")[1];
          router.push(`/verify?userId=${userId}`);
          return;
        }
        if (mode === "internal") {
          setError("Email atau password salah, atau akun tidak memiliki akses internal.");
        } else {
          setError("Email atau password salah, atau akun belum diverifikasi.");
        }
      } else {
        if (mode === "internal") {
          router.push("/backoffice");
        } else {
          router.push("/pelayanan");
        }
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message?.includes("UNVERIFIED:")) {
        const userId = err.message.split("UNVERIFIED:")[1];
        router.push(`/verify?userId=${userId}`);
        return;
      }
      setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  }

  // Mode Selection Screen
  if (mode === "select") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Image 
            src="/BMKG.png"
            alt="BMKG Logo"
            width={80}
            height={80}
            className="mb-1"
          />
          <h1 className="text-2xl font-bold text-gray-900">Portal BMKG Kaltim</h1>
          <p className="text-sm text-gray-500">
            Pilih jenis akses untuk melanjutkan
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setMode("internal"); generateCaptcha(); }}
            className="w-full group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Akses Internal</p>
              <p className="text-xs text-gray-500">Login untuk pegawai BMKG (Admin, Konten, Datin)</p>
            </div>
          </button>

          <button
            onClick={() => { setMode("pelayanan"); generateCaptcha(); }}
            className="w-full group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Pelayanan Data</p>
              <p className="text-xs text-gray-500">Login untuk pengguna pelayanan data MKG</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  const isInternal = mode === "internal";
  const accentColor = isInternal ? "blue" : "emerald";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <button
        onClick={() => { setMode("select"); setError(""); setCaptchaInput(""); }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors self-start -mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-2 text-center">
          <Image 
            src="/BMKG.png"
            alt="BMKG Logo"
            width={72}
            height={72}
            className="mb-1"
          />
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isInternal ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
          }`}>
            {isInternal ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {isInternal ? "Akses Internal" : "Pelayanan Data"}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isInternal ? "Login Internal BMKG" : "Login Pelayanan Data"}
          </h1>
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
          className={cn(
            "w-full h-11",
            isInternal 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Masuk...</>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {!isInternal && (
        <>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-white px-2 text-muted-foreground">
              Atau
            </span>
          </div>
          <div className="text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-800 underline underline-offset-4">
              Daftar sekarang
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
