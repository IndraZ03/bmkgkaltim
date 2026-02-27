import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET dashboard summary
export async function GET() {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN", "DATIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalNews,
      totalArticles,
      totalVideos,
      publishedNews,
      publishedArticles,
      publishedVideos,
      recentLogs,
      ikmStations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.article.count(),
      prisma.videoGallery.count(),
      prisma.news.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.videoGallery.count({ where: { status: "PUBLISHED" } }),
      prisma.activityLog.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.ikmStation.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalNews,
      totalArticles,
      totalVideos,
      publishedNews,
      publishedArticles,
      publishedVideos,
      ikmStations,
      recentLogs,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
