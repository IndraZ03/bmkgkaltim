import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE - Remove a station service
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user?.role || "USER";
  if (!["ADMIN", "DATIN"].includes(userRole)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const serviceId = parseInt(id);

    const service = await prisma.stationService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // DATIN can only delete services from their own station
    if (userRole === "DATIN") {
      const userStationId = parseInt(session.user?.stationId || "0");
      if (userStationId !== service.stationId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    await prisma.stationService.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete station service error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update a station service
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user?.role || "USER";
  if (!["ADMIN", "DATIN"].includes(userRole)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const serviceId = parseInt(id);
    const body = await req.json();

    const service = await prisma.stationService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // DATIN can only update services from their own station
    if (userRole === "DATIN") {
      const userStationId = parseInt(session.user?.stationId || "0");
      if (userStationId !== service.stationId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.stationService.update({
      where: { id: serviceId },
      data: {
        layanan: body.layanan ?? service.layanan,
        satuan: body.satuan ?? service.satuan,
        tarif: body.tarif !== undefined ? parseFloat(body.tarif) : service.tarif,
        isActive: body.isActive ?? service.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update station service error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
