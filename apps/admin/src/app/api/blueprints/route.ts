import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";

export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        role_name, 
        entry_count, 
        top_essential_skills, 
        top_nicetohave_skills, 
        category, 
        is_promoted, 
        created_at, 
        updated_at
      FROM learned_role_blueprints
      ORDER BY is_promoted DESC, entry_count DESC, updated_at DESC
    `;

    const totalSubmissionsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count FROM learned_role_entries
    `;

    const totalSubmissions = totalSubmissionsResult[0]?.count
      ? Number(totalSubmissionsResult[0].count)
      : 0;

    const totalPromoted = rows.filter((r) => r.is_promoted).length;

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        totalBlueprints: rows.length,
        totalPromoted,
        totalSubmissions,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/blueprints] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data blueprints dari database." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 1. Batch Import Mode ──
    if (Array.isArray(body?.items) && body.items.length > 0) {
      let successCount = 0;
      for (const item of body.items) {
        const cleanRoleName = (item.role_name || "").trim();
        if (!cleanRoleName) continue;

        const essential = Array.isArray(item.top_essential_skills)
          ? item.top_essential_skills.map((s: any) => String(s).trim()).filter(Boolean)
          : [];
        const niceToHave = Array.isArray(item.top_nicetohave_skills)
          ? item.top_nicetohave_skills.map((s: any) => String(s).trim()).filter(Boolean)
          : [];
        const category = item.category || "other";
        const isPromoted = item.is_promoted !== undefined ? Boolean(item.is_promoted) : true;

        await prisma.$executeRaw`
          INSERT INTO learned_role_blueprints (
            id,
            role_name,
            entry_count,
            top_essential_skills,
            top_nicetohave_skills,
            category,
            is_promoted,
            created_at,
            updated_at
          )
          VALUES (
            gen_random_uuid(),
            ${cleanRoleName},
            0,
            ${essential}::text[],
            ${niceToHave}::text[],
            ${category},
            ${isPromoted},
            NOW(),
            NOW()
          )
          ON CONFLICT (role_name)
          DO UPDATE SET
            top_essential_skills = ${essential}::text[],
            top_nicetohave_skills = ${niceToHave}::text[],
            category = ${category},
            is_promoted = ${isPromoted},
            updated_at = NOW()
        `;
        successCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${successCount} blueprint peran secara batch.`,
        importedCount: successCount,
      });
    }

    // ── 2. Single Item Mode ──
    const {
      role_name,
      category = "other",
      top_essential_skills = [],
      top_nicetohave_skills = [],
      is_promoted = true,
    } = body || {};

    const cleanRoleName = (role_name || "").trim();
    if (!cleanRoleName) {
      return NextResponse.json(
        { success: false, message: "Nama peran harus diisi." },
        { status: 400 }
      );
    }

    const essential = Array.isArray(top_essential_skills)
      ? top_essential_skills.map((s: any) => String(s).trim()).filter(Boolean)
      : [];
    const niceToHave = Array.isArray(top_nicetohave_skills)
      ? top_nicetohave_skills.map((s: any) => String(s).trim()).filter(Boolean)
      : [];

    await prisma.$executeRaw`
      INSERT INTO learned_role_blueprints (
        id,
        role_name,
        entry_count,
        top_essential_skills,
        top_nicetohave_skills,
        category,
        is_promoted,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${cleanRoleName},
        0,
        ${essential}::text[],
        ${niceToHave}::text[],
        ${category},
        ${Boolean(is_promoted)},
        NOW(),
        NOW()
      )
      ON CONFLICT (role_name)
      DO UPDATE SET
        top_essential_skills = ${essential}::text[],
        top_nicetohave_skills = ${niceToHave}::text[],
        category = ${category},
        is_promoted = ${Boolean(is_promoted)},
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: `Blueprint "${cleanRoleName}" berhasil disimpan.`,
    });
  } catch (error: any) {
    console.error("[POST /api/blueprints] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan blueprint." },
      { status: 500 }
    );
  }
}
