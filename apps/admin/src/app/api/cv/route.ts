import { NextResponse } from "next/server";
import { prisma } from "@employr/db";
import { KNOWN_PURPOSES, normalizePurposeId } from "./template-stats/route";

export async function GET() {
  try {
    const cvProjects = await prisma.cv_projects.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users: { select: { name: true, email: true } },
        cv_sections: true,
      },
    });

    const formatted = cvProjects.map((cv) => {
      const dataObj =
        typeof cv.data === "object" && cv.data !== null
          ? (cv.data as Record<string, any>)
          : {};
      const rawPurpose = dataObj.purpose || dataObj.cvPurpose || "job";
      const purposeId = normalizePurposeId(rawPurpose);
      const meta = KNOWN_PURPOSES[purposeId] || {
        id: purposeId,
        title: "Lamar Kerja",
        badge: "Professional",
        category: "career",
        categoryTitle: "Karier & Profesional",
        color: "#1738D1",
      };

      return {
        id: cv.id,
        userName: cv.users?.name || "Unknown",
        userEmail: cv.users?.email || "",
        title: cv.title,
        template: cv.template_id,
        targetPosition: cv.target_position,
        purpose: purposeId,
        purposeTitle: meta.title,
        purposeBadge: meta.badge,
        purposeCategory: meta.category,
        purposeColor: meta.color,
        processingType: cv.processing_type,
        status: cv.status,
        isActive: cv.is_active,
        createdAt: cv.created_at.toISOString(),
        updatedAt: cv.updated_at.toISOString(),
        readyAt: cv.ready_at?.toISOString() || null,
        sectionsCount: cv.cv_sections?.length || 0,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[CV API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data CV." },
      { status: 500 }
    );
  }
}
