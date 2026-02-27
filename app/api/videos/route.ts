import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// GET all videos
export async function GET() {
  try {
    const videos = await prisma.videoGallery.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new video
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, youtubeId, description, status } = await req.json();

    if (!title || !youtubeId) {
      return NextResponse.json({ message: "Judul dan YouTube ID wajib diisi" }, { status: 400 });
    }

    const video = await prisma.videoGallery.create({
      data: {
        title,
        youtubeId,
        description,
        status: status || "PUBLISHED",
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "CREATE",
      target: "Galeri Video",
      details: `Menambahkan video: "${title}" (${youtubeId})`,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
