import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List data requests for current user (or filtered by station for DATIN)
export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user?.id || "0");
    const userRole = session.user?.role || "USER";
    const userStationId = session.user?.stationId
      ? parseInt(session.user.stationId)
      : null;

    let where: any = {};

    if (userRole === "ADMIN") {
      // Admin sees all requests
      where = {};
    } else if (userRole === "DATIN") {
      // DATIN sees only requests for their station
      if (userStationId) {
        where = { stationId: userStationId };
      } else {
        where = {}; // fallback: DATIN without station sees all (shouldn't happen)
      }
    } else {
      // Regular users see only their own requests
      where = { userId };
    }

    const requests = await prisma.dataRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        station: { select: { id: true, name: true, code: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch data requests error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create new data request
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = parseInt(session.user?.id || "0");

    const {
      requestType,
      fullName,
      email,
      phone,
      address,
      institution,
      locationInfo,
      monthInfo,
      ktpDocUrl,
      introLetterUrl,
      statementUrl,
      proposalUrl,
      stationId, // NEW: station ID
      items, // for INFORMASI type: [{ serviceId, serviceName, unit, pricePerUnit, quantity }]
    } = body;

    if (!requestType || !fullName || !email) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    if (!stationId) {
      return NextResponse.json({ message: "Stasiun tujuan wajib dipilih" }, { status: 400 });
    }

    // Verify station exists
    const station = await prisma.station.findUnique({ where: { id: stationId } });
    if (!station) {
      return NextResponse.json({ message: "Stasiun tidak ditemukan" }, { status: 400 });
    }

    // Calculate total for INFORMASI type
    let totalAmount = 0;
    if (requestType === "INFORMASI" && items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => sum + (item.pricePerUnit * item.quantity), 0);
    }

    const dataRequest = await prisma.dataRequest.create({
      data: {
        userId,
        stationId,
        requestType,
        fullName,
        email,
        phone: phone || null,
        address: address || null,
        institution: institution || null,
        locationInfo: locationInfo || null,
        monthInfo: monthInfo || null,
        ktpDocUrl: ktpDocUrl || null,
        introLetterUrl: introLetterUrl || null,
        statementUrl: statementUrl || null,
        proposalUrl: proposalUrl || null,
        applicationLetterUrl: body.applicationLetterUrl || null,
        totalAmount,
        status: "SUBMITTED",
        items: requestType === "INFORMASI" && items ? {
          create: items.map((item: any) => ({
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            unit: item.unit,
            pricePerUnit: item.pricePerUnit,
            quantity: item.quantity,
            subtotal: item.pricePerUnit * item.quantity,
          })),
        } : undefined,
      },
      include: {
        items: true,
        station: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "CREATE",
        target: "Permohonan Data",
        details: `Permohonan ${requestType === "INFORMASI" ? "Data Informasi" : "Data Nol Rupiah"} oleh ${fullName} ke ${station.name}`,
      },
    });

    return NextResponse.json(dataRequest, { status: 201 });
  } catch (error) {
    console.error("Create data request error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
