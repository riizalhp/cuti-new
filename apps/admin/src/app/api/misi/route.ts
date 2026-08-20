import { NextResponse } from "next/server";
import { prisma } from "@cuti/db";

export async function GET() {
  try {
    const misiList = await prisma.misi.findMany({
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { misi_submissions: true } },
      },
    });

    const formatted = misiList.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      rewardAmount: m.reward_amount,
      maxSubmissions: m.max_submissions,
      currentSubmissions: m.current_submissions,
      submissionCount: m._count.misi_submissions,
      requiresProof: m.requires_proof,
      proofType: m.proof_type,
      isActive: m.is_active,
      deadline: m.deadline?.toISOString() || null,
      createdAt: m.created_at.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("[Misi API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data misi." },
      { status: 500 }
    );
  }
}
