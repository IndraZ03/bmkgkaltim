import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ message: "User ID dan kode verifikasi diperlukan" }, { status: 400 });
    }

    // Find valid verification
    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId: parseInt(userId),
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!verification) {
      return NextResponse.json({ message: "Kode verifikasi tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    // Mark as used and verify user
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isVerified: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: parseInt(userId),
        action: "UPDATE",
        target: "Verifikasi Email",
        details: `Pengguna berhasil memverifikasi email`,
      },
    });

    return NextResponse.json({ message: "Email berhasil diverifikasi! Silakan login." });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
