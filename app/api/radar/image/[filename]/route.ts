import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(req: Request, context: { params: any }) {
  try {
    const params = await context.params;
    const filename = params.filename as string;
    
    if (!filename) {
      return new NextResponse("Not found", { status: 404 });
    }
    
    const uploadDir = join(process.cwd(), "public", "radar");
    const filepath = join(uploadDir, filename);

    // Prevent directory traversal
    if (!filepath.startsWith(uploadDir)) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (!existsSync(filepath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const file = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase();
    
    let contentType = "image/gif";
    if (ext === "png") contentType = "image/png";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60", // 1 minute cache
      },
    });
  } catch (error) {
    console.error("Error serving image", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
