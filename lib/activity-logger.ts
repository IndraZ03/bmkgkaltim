import prisma from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  target,
  details,
  ipAddress,
}: {
  userId: number;
  action: string;
  target: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        target,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
