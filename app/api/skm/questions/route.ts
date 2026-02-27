import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all active SKM questions (public for survey takers)
export async function GET() {
  try {
    const questions = await prisma.skmQuestion.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching SKM questions:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST create new SKM question (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, question, category, orderIndex } = await req.json();

    if (!code || !question) {
      return NextResponse.json({ message: "Code and question are required" }, { status: 400 });
    }

    const q = await prisma.skmQuestion.create({
      data: {
        code,
        question,
        category: category || null,
        orderIndex: orderIndex || 0,
      },
    });

    return NextResponse.json(q, { status: 201 });
  } catch (error) {
    console.error("Error creating SKM question:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
