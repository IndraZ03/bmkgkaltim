import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all stations - public endpoint for station selection
export async function GET() {
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
