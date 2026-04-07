import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List station services (optionally filtered by stationId query param)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    const where: any = { isActive: true };
    if (stationId) {
      where.stationId = parseInt(stationId);
    }

    const services = await prisma.stationService.findMany({
      where,
      include: {
        station: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Fetch station services error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new station service (DATIN only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user?.role || "USER";
  if (!["ADMIN", "DATIN"].includes(userRole)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { stationId, layanan, satuan, tarif } = body;

    if (!stationId || !layanan || !satuan || tarif === undefined) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // DATIN can only add services to their own station (ADMIN can add to any)
    if (userRole === "DATIN") {
      const userStationId = parseInt(session.user?.stationId || "0");
      if (userStationId !== stationId) {
        return NextResponse.json({ message: "Anda hanya dapat menambah layanan untuk stasiun Anda" }, { status: 403 });
      }
    }

    const service = await prisma.stationService.create({
      data: {
        stationId,
        layanan,
        satuan,
        tarif: parseFloat(tarif),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Create station service error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
