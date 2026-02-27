import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List data requests for current user (or all for admin)
export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user?.id || "0");
    const isAdminOrDatin = ["ADMIN", "DATIN"].includes(session.user?.role || "");

    const requests = await prisma.dataRequest.findMany({
      where: isAdminOrDatin ? {} : { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
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
      items, // for INFORMASI type: [{ serviceId, serviceName, unit, pricePerUnit, quantity }]
    } = body;

    if (!requestType || !fullName || !email) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Calculate total for INFORMASI type
    let totalAmount = 0;
    if (requestType === "INFORMASI" && items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => sum + (item.pricePerUnit * item.quantity), 0);
    }

    const dataRequest = await prisma.dataRequest.create({
      data: {
        userId,
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
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "CREATE",
        target: "Permohonan Data",
        details: `Permohonan ${requestType === "INFORMASI" ? "Data Informasi" : "Data Nol Rupiah"} oleh ${fullName}`,
      },
    });

    return NextResponse.json(dataRequest, { status: 201 });
  } catch (error) {
    console.error("Create data request error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
