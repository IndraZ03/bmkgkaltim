import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET activity logs
export async function GET(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
