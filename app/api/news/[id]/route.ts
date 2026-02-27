import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.news.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET single news
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!news) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update news
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
    const newsId = parseInt(id);
    const { title, description, content, imageUrl, category, status } = await req.json();

    // Regenerate slug if title changed
    const existing = await prisma.news.findUnique({ where: { id: newsId } });
    let slug = existing?.slug || "";
    if (title && title !== existing?.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, newsId);
    }

    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        title,
        slug,
        description,
        content,
        imageUrl,
        category,
        status,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "UPDATE",
      target: "Berita & Kegiatan",
      details: `Mengubah berita: "${title}" (/${news.slug})`,
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE news
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
    const news = await prisma.news.findUnique({ where: { id: parseInt(id) } });

    await prisma.news.delete({
      where: { id: parseInt(id) },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "DELETE",
      target: "Berita & Kegiatan",
      details: `Menghapus berita: "${news?.title}"`,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
