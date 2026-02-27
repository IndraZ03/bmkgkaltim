import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// DELETE video
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const video = await prisma.videoGallery.findUnique({ where: { id: parseInt(id) } });

    await prisma.videoGallery.delete({
      where: { id: parseInt(id) },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "DELETE",
      target: "Galeri Video",
      details: `Menghapus video: "${video?.title}"`,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update video
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title, youtubeId, description, status } = await req.json();

    const video = await prisma.videoGallery.update({
      where: { id: parseInt(id) },
      data: {
        title,
        youtubeId,
        description,
        status,
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "UPDATE",
      target: "Galeri Video",
      details: `Mengubah video: "${title}"`,
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
