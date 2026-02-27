"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, FileText, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [captchaValue, setCaptchaValue] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [address, setAddress] = useState("")
  const [institution, setInstitution] = useState("")
  
  // File upload
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [identityPreview, setIdentityPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    generateCaptcha();
  }, [])

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file terlalu besar (maksimal 10MB).");
      return;
    }

    setIdentityFile(file);
    setError("");

    // Preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setIdentityPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIdentityPreview(null);
    }
  }

  const removeFile = () => {
    setIdentityFile(null);
    setIdentityPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload gagal");
    const data = await res.json();
    return data.url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (captchaInput !== captchaValue) {
      setError("Captcha salah, silakan coba lagi.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    if (!identityFile) {
      setError("Silakan unggah dokumen identitas (KTP/SIM/Passport).");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload identity document
      setUploading(true);
      const identityDocUrl = await uploadFile(identityFile, "identity");
      setUploading(false);

      // 2. Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          address,
          institution,
          identityDocUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to verification page
        router.push(`/verify?userId=${data.userId}&email=${encodeURIComponent(email)}&code=${data.verificationCode || ""}`);
      } else {
        setError(data.message || "Gagal mendaftar.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-10 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="w-full max-w-lg bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
        <Link
          href="/pelayanan-data"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
            <Image 
              src="/BMKG.png"
              alt="BMKG Logo"
              width={72}
              height={72}
              className="mb-1"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Pelayanan Data
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
            <p className="text-sm text-gray-500">Buat akun untuk mengakses layanan data BMKG</p>
          </div>

          <div className="space-y-4">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
            </div>

            {/* Phone & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Telepon / HP <span className="text-red-500">*</span></Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="institution">Instansi / Universitas</Label>
                <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Opsional" />
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-1.5">
              <Label htmlFor="address">Alamat</Label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap Anda (opsional)"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Minimal 6 karakter"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Identity Document Upload */}
            <div className="grid gap-1.5">
              <Label>
                Upload KTP / SIM / Passport <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-400 -mt-1">Format: JPG, PNG, PDF • Maksimal 10MB</p>

              {!identityFile ? (
                <label
                  htmlFor="identity-upload"
                  className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Klik untuk upload</p>
                    <p className="text-xs text-gray-400">atau seret file ke sini</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="identity-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                  {identityPreview ? (
                    <img src={identityPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{identityFile.name}</p>
                    <p className="text-xs text-gray-500">{(identityFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={removeFile} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Captcha */}
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
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {uploading ? "Mengunggah dokumen..." : "Mendaftar..."}</>
            ) : (
              "Daftar Akun"
            )}
          </Button>
        </form>

        <div className="text-center text-sm mt-5">
          Sudah punya akun?{" "}
          <Link href="/pelayanan-data" className="font-semibold text-emerald-600 hover:text-emerald-800 underline underline-offset-4">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
