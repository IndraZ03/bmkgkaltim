import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const request = await prisma.dataRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
        skmResponses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Check ownership or admin/datin role
    const isOwner = request.userId === parseInt(session.user?.id || "0");
    const isStaff = ["ADMIN", "DATIN"].includes(session.user?.role || "");

    if (!isOwner && !isStaff) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Fetch request detail error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const requestId = parseInt(id);
    const body = await req.json();
    const { action } = body;
    const userRole = session.user?.role || "USER";
    const userId = parseInt(session.user?.id || "0");

    const request = await prisma.dataRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Determine updates based on action
    let updates: any = {};
    let activityDetails = "";

    // DATIN ACTIONS
    if (["ADMIN", "DATIN"].includes(userRole)) {
      if (action === "REVIEW") {
        const { decision, billingCode, rejectionReason, adminNotes, penanggungJawab } = body;
        
        if (decision === "approve") {
          // Special handling for NOL_RUPIAH (skip billing/payment)
          if (request.requestType === "NOL_RUPIAH") {
             updates = {
               status: "PAYMENT_CONFIRMED", // Jump to processing step
               adminNotes: adminNotes || request.adminNotes,
               penanggungJawab: penanggungJawab || "Carolina Meylita Sibarani, S.Tr.",
               reviewedAt: new Date(),
             };
             activityDetails = `Menyetujui permohonan nol rupiah #${requestId}`;
          } else {
             if (!billingCode) return NextResponse.json({ message: "Billing code required" }, { status: 400 });
             updates = {
               status: "BILLING_ISSUED",
               billingCode,
               penanggungJawab: penanggungJawab || "Carolina Meylita Sibarani, S.Tr.",
               adminNotes: adminNotes || request.adminNotes, // Preserve or update
               reviewedAt: new Date(),
             };
             activityDetails = `Menyetujui permohonan #${requestId} dan menerbitkan kode billing. PJ: ${penanggungJawab || "Carolina Meylita Sibarani, S.Tr."}`;
          }
        } else if (decision === "reject") {
          if (!rejectionReason) return NextResponse.json({ message: "Rejection reason required" }, { status: 400 });
          updates = {
            status: "REJECTED",
            rejectionReason,
            adminNotes: adminNotes || request.adminNotes,
            reviewedAt: new Date(),
          };
          activityDetails = `Menolak permohonan #${requestId}`;
        }
      } 
      else if (action === "CONFIRM_PAYMENT") {
         updates = {
           status: "PAYMENT_CONFIRMED",
           adminNotes: body.adminNotes || request.adminNotes,
         };
         activityDetails = `Mengonfirmasi pembayaran permohonan #${requestId}`;
      }
      else if (action === "UPLOAD_DATA") {
        if (!body.dataDocumentUrl) return NextResponse.json({ message: "Data document required" }, { status: 400 });
        updates = {
          status: "DATA_UPLOADED", // User needs to fill SKM next
          dataDocumentUrl: body.dataDocumentUrl,
          adminNotes: body.adminNotes || request.adminNotes,
        };
        activityDetails = `Mengunggah dokumen data untuk permohonan #${requestId}`;
      }
    }

    // USER ACTIONS
    if (request.userId === userId) {
      if (action === "UPLOAD_PAYMENT") {
        if (!body.paymentProofUrl) return NextResponse.json({ message: "Payment proof required" }, { status: 400 });
        updates = {
          status: "PAYMENT_UPLOADED",
          paymentProofUrl: body.paymentProofUrl,
        };
        activityDetails = `Mengunggah bukti pembayaran untuk permohonan #${requestId}`;
      }
      else if (action === "SUBMIT_SKM") {
        const { rating, feedback, questionRatings } = body;
        if (!rating || !feedback) return NextResponse.json({ message: "Rating and feedback required" }, { status: 400 });
        
        // Save individual question ratings
        if (questionRatings && Array.isArray(questionRatings)) {
          for (const qr of questionRatings) {
            await prisma.skmResponse.upsert({
              where: {
                requestId_questionId: {
                  requestId: requestId,
                  questionId: qr.questionId,
                },
              },
              update: { rating: qr.rating },
              create: {
                requestId: requestId,
                questionId: qr.questionId,
                rating: qr.rating,
              },
            });
          }
        }

        updates = {
          status: "COMPLETED",
          skmRating: parseInt(rating),
          skmFeedback: feedback,
          skmCompletedAt: new Date(),
          completedAt: new Date(), // Request is now fully complete
        };
        activityDetails = `Mengisi SKM untuk permohonan #${requestId}`;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Invalid action or permission" }, { status: 400 });
    }

    const updatedRequest = await prisma.dataRequest.update({
      where: { id: requestId },
      data: updates,
    });

    // Log Activity
    await logActivity({
      userId,
      action: "UPDATE",
      target: "Permohonan Data",
      details: activityDetails,
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
