import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all stations
export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stations = await prisma.station.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
