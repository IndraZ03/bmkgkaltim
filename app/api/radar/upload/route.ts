import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Function to handle POST requests (Upload API)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const type = formData.get("type") as string | null;
    const apiKey = req.headers.get("x-api-key"); // Basic security

    // Simple security check (replace with a real token in production, but keeps it safe for now)
    if (apiKey !== "bmkg-radar-upload-123") {
      return NextResponse.json({ error: "Unauthorized. Invalid 'x-api-key' header." }, { status: 401 });
    }

    if (!image || !type) {
      return NextResponse.json({ error: "Missing 'image' or 'type' in form data" }, { status: 400 });
    }

    // Usually radar types match the component needs: "CMAX_Balikpapan", "CMAX-HWIND_Balikpapan", etc.
    const ext = image.name.split(".").pop() || "gif";
    const filename = `${type}.${ext}`;
    
    // Directory to save
    const uploadDir = join(process.cwd(), "public", "radar");
    try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const filepath = join(uploadDir, filename);
    const arrayBuffer = await image.arrayBuffer();
    await writeFile(filepath, Buffer.from(arrayBuffer));

    // Upsert into database for tracking update time
    await prisma.radarImage.upsert({
      where: { type },
      update: { filename, updatedAt: new Date() },
      create: { type, filename, updatedAt: new Date() },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Image uploaded successfully", 
      filename: filename,
      type: type,
      updatedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Radar Upload API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
