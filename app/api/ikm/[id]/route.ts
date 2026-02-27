import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// PUT update IKM station
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !["ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { stationName, ikmValue, rating } = await req.json();

    const station = await prisma.ikmStation.update({
      where: { id: parseInt(id) },
      data: {
        stationName,
        ikmValue: parseFloat(ikmValue),
        rating,
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "UPDATE",
      target: "IKM Station",
      details: `Mengubah IKM "${stationName}" ke nilai ${ikmValue}`,
    });

    return NextResponse.json(station);
  } catch (error) {
    console.error("Error updating IKM station:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE IKM station
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !["ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const station = await prisma.ikmStation.findUnique({ where: { id: parseInt(id) } });

    await prisma.ikmStation.delete({
      where: { id: parseInt(id) },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "DELETE",
      target: "IKM Station",
      details: `Menghapus stasiun IKM: "${station?.stationName}"`,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting IKM station:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
