"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
    const [captchaValue, setCaptchaValue] = useState("")
    const [captchaInput, setCaptchaInput] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const router = useRouter()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (captchaInput !== captchaValue) {
            setError("Captcha salah, silakan coba lagi.");
            generateCaptcha();
            setCaptchaInput("");
            return;
        }

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        // Note: Real signup usually hits an API route. Since we can't create that dynamically properly without setup, this is a placeholder for the logic.
        // But I will create the API route next.
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                setSuccess("Pendaftaran berhasil! Silakan login.");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.message || "Gagal mendaftar.");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem.");
        }
    }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <Image 
            src="/BMKG.png"
            alt="BMKG Logo"
            width={80}
            height={80}
            className="mb-2"
        />
        <h1 className="text-2xl font-bold">Daftar Akun</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Masukkan data diri Anda untuk membuat akun baru
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" type="text" placeholder="Nama Anda" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <div className="grid gap-2">
            <Label htmlFor="captcha">Captcha</Label>
            <div className="flex gap-2">
                 <div className="flex-1 bg-gray-100 flex items-center justify-center font-mono text-xl font-bold tracking-widest border rounded select-none relative overflow-hidden">
                     {/* Simple noise background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '5px 5px'}}></div>
                    {captchaValue.split('').map((char, i) => (
                        <span key={i} style={{transform: `rotate(${Math.random() * 20 - 10}deg)`, display: 'inline-block', margin: '0 2px'}}>{char}</span>
                    ))}
                 </div>
                 <Button type="button" variant="outline" size="icon" onClick={generateCaptcha} title="Refresh Captcha">
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button type="submit" className="w-full">
          Daftar
        </Button>
      </div>
      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <a href="/login" className="underline underline-offset-4 font-medium hover:text-primary">
          Login
        </a>
      </div>
    </form>
  )
}
