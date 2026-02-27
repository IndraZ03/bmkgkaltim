import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all SKM responses (admin/datin)  
// Query params: ?format=json|csv|pdf
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "DATIN"].includes(session.user?.role || "")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";

  try {
    const responses = await prisma.skmResponse.findMany({
      include: {
        question: true,
        request: {
          select: {
            id: true,
            fullName: true,
            email: true,
            requestType: true,
            skmFeedback: true,
            skmRating: true,
            skmCompletedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      // Build CSV
      const questions = await prisma.skmQuestion.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      });

      const questionCodes = questions.map((q: { code: string }) => q.code);
      const questionLabels = questions.map((q: { question: string }) => `"${q.question.replace(/"/g, '""')}"`);

      // Group responses by requestId
      const grouped: Record<number, any> = {};
      for (const r of responses) {
        if (!grouped[r.requestId]) {
          grouped[r.requestId] = {
            id: r.request.id,
            nama: r.request.fullName,
            email: r.request.email,
            tipe: r.request.requestType,
            feedback: r.request.skmFeedback || "",
            rataRata: r.request.skmRating || 0,
            tanggal: r.request.skmCompletedAt
              ? new Date(r.request.skmCompletedAt).toISOString()
              : "",
            ratings: {} as Record<string, number>,
          };
        }
        grouped[r.requestId].ratings[r.question.code] = r.rating;
      }

      let csv = `"ID","Nama","Email","Tipe Permohonan",${questionLabels.join(",")},"Rata-rata","Feedback","Tanggal"\n`;

      for (const g of Object.values(grouped)) {
        const ratings = questionCodes.map((code: string) => g.ratings[code] || "");
        csv += `${g.id},"${g.nama}","${g.email}","${g.tipe}",${ratings.join(",")},${g.rataRata},"${g.feedback.replace(/"/g, '""')}","${g.tanggal}"\n`;
      }

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="skm_report_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching SKM responses:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
