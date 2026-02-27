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
    const existing = await prisma.article.findFirst({
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

// GET all articles
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // If slug param is passed, return single article by slug
    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (!article) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    const articles = await prisma.article.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new article
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, content, imageUrl, pdfUrl, category, status } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ message: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const userId = parseInt(session.user?.id || "0");
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        content,
        imageUrl,
        pdfUrl: pdfUrl || null,
        category: category || "press_release",
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
      target: "Artikel & Press Release",
      details: `Menambahkan artikel: "${title}" (/${article.slug})`,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
