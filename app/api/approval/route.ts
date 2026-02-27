import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// GET all pending review content
export async function GET() {
  const session = await auth();
  
  if (!session || !["ADMIN", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [news, articles, videos] = await Promise.all([
      prisma.news.findMany({
        where: { status: "PENDING_REVIEW" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.article.findMany({
        where: { status: "PENDING_REVIEW" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.videoGallery.findMany({
        where: { status: "PENDING_REVIEW" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ news, articles, videos });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST approve or reject content
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contentType, contentId, action } = await req.json();
    // contentType: "news" | "articles" | "videos"
    // action: "approve" | "reject"

    if (!contentType || !contentId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "PUBLISHED" : "DRAFT";
    const userId = parseInt(session.user?.id || "0");

    let title = "";

    if (contentType === "news") {
      const item = await prisma.news.update({
        where: { id: parseInt(contentId) },
        data: { status: newStatus },
      });
      title = item.title;
    } else if (contentType === "articles") {
      const item = await prisma.article.update({
        where: { id: parseInt(contentId) },
        data: { status: newStatus },
      });
      title = item.title;
    } else if (contentType === "videos") {
      const item = await prisma.videoGallery.update({
        where: { id: parseInt(contentId) },
        data: { status: newStatus },
      });
      title = item.title;
    } else {
      return NextResponse.json({ message: "Invalid content type" }, { status: 400 });
    }

    const actionLabel = action === "approve" ? "Menyetujui" : "Menolak";
    const typeLabel = contentType === "news" ? "Berita" : contentType === "articles" ? "Artikel" : "Video";

    await logActivity({
      userId,
      action: action === "approve" ? "APPROVE" : "REJECT",
      target: `Persetujuan ${typeLabel}`,
      details: `${actionLabel} ${typeLabel.toLowerCase()}: "${title}"`,
    });

    return NextResponse.json({ 
      message: `Konten berhasil ${action === "approve" ? "disetujui" : "ditolak"}`,
      status: newStatus 
    });
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
