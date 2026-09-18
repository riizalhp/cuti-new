import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("employr_admin_session")?.value || req.cookies.get("cuti_admin_session")?.value;
    const session = sessionCookie ? await verifyAdminSession(sessionCookie) : null;
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    // Validasi tipe mime
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File harus berupa format gambar (JPG, PNG, WEBP, GIF, SVG)." },
        { status: 400 }
      );
    }

    // Validasi ukuran (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar terlalu besar (maksimal 10MB)." },
        { status: 400 }
      );
    }

    // Tentukan ekstensi
    let ext = "png";
    if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/png") ext = "png";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/svg+xml") {
      return NextResponse.json(
        { success: false, message: "Format SVG tidak diizinkan karena alasan keamanan." },
        { status: 400 }
      );
    }
    else {
      const match = file.name.split(".").pop();
      if (match) ext = match.toLowerCase();
    }

    const filename = `art-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Simpan ke apps/admin/public/uploads/articles dan sync ke app publik lain
    const targetDirs = [
      path.join(process.cwd(), "public", "uploads", "articles"),
      path.resolve(process.cwd(), "..", "dashboard", "public", "uploads", "articles"),
      path.resolve(process.cwd(), "..", "portal-loker", "public", "uploads", "articles"),
      path.resolve(process.cwd(), "..", "web", "public", "uploads", "articles"),
    ];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, filename), buffer);
      } catch (err) {
        // Abaikan jika folder app tetangga tidak ada
      }
    }

    const publicUrl = `/uploads/articles/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("[CMS Upload Error]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah file gambar." },
      { status: 500 }
    );
  }
}
