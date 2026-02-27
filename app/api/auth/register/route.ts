import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, address, institution, identityDocUrl } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: "Data tidak lengkap. Nama, email, password, dan telepon wajib diisi." }, { status: 400 });
    }

    if (!identityDocUrl) {
      return NextResponse.json({ message: "Dokumen identitas (KTP/SIM/Passport) wajib diunggah." }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    // Create user with PELAYANAN role, not verified yet
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address: address || null,
        institution: institution || null,
        identityDocUrl,
        role: "PELAYANAN",
        isVerified: false,
      },
    });

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        code: verificationCode,
        expiresAt,
      },
    });

    // In production, send email here. For now, log the code.
    console.log(`[EMAIL VERIFICATION] User: ${email}, Code: ${verificationCode}`);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        target: "Registrasi Pelayanan Data",
        details: `Pengguna baru mendaftar: ${name} (${email})`,
      },
    });

    return NextResponse.json({ 
      message: "Registrasi berhasil! Silakan verifikasi email Anda.",
      userId: user.id,
      verificationCode, // Remove in production — for demo
    }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
