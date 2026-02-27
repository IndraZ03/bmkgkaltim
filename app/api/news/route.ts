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

// GET all news
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // If slug param is passed, return single news by slug
    if (slug) {
      const news = await prisma.news.findUnique({
        where: { slug },
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
    }

    const news = await prisma.news.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new news
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, content, imageUrl, category, status } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ message: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const userId = parseInt(session.user?.id || "0");
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        description,
        content,
        imageUrl,
        category: category || "berita",
        status: status || "PUBLISHED",
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity({
      userId,
      action: "CREATE",
      target: "Berita & Kegiatan",
      details: `Menambahkan berita: "${title}" (/${news.slug})`,
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
