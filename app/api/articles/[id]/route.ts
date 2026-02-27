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

// GET single article
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
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
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update article
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
    const articleId = parseInt(id);
    const { title, description, content, imageUrl, pdfUrl, category, status } = await req.json();

    // Regenerate slug if title changed
    const existing = await prisma.article.findUnique({ where: { id: articleId } });
    let slug = existing?.slug || "";
    if (title && title !== existing?.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, articleId);
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        slug,
        description,
        content,
        imageUrl,
        pdfUrl: pdfUrl !== undefined ? pdfUrl : existing?.pdfUrl,
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
      target: "Artikel & Press Release",
      details: `Mengubah artikel: "${title}" (/${article.slug})`,
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE article
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
    const article = await prisma.article.findUnique({ where: { id: parseInt(id) } });

    await prisma.article.delete({
      where: { id: parseInt(id) },
    });

    const userId = parseInt(session.user?.id || "0");
    await logActivity({
      userId,
      action: "DELETE",
      target: "Artikel & Press Release",
      details: `Menghapus artikel: "${article?.title}"`,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
