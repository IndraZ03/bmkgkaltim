import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// GET all IKM stations
export async function GET() {
  try {
    const stations = await prisma.ikmStation.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching IKM stations:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new IKM station
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { stationName, ikmValue, rating } = await req.json();

    if (!stationName || ikmValue === undefined) {
      return NextResponse.json({ message: "Nama stasiun dan nilai IKM wajib diisi" }, { status: 400 });
    }

    const station = await prisma.ikmStation.create({
      data: {
        stationName,
        ikmValue: parseFloat(ikmValue),
        rating: rating || "Sangat Baik",
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "CREATE",
      target: "IKM Station",
      details: `Menambahkan stasiun IKM: "${stationName}" dengan nilai ${ikmValue}`,
    });

    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    console.error("Error creating IKM station:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
