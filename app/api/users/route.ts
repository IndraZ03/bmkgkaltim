import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// GET all users
export async function GET() {
  const session = await auth();
  
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        stationId: true,
        station: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new user
export async function POST(req: Request) {
  const session = await auth();
  
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, role, stationId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        stationId: stationId || null,
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "CREATE",
      target: "Manajemen User",
      details: `Menambahkan user baru: "${name}" (${email}) dengan role ${role || "USER"}`,
    });

    return NextResponse.json(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
