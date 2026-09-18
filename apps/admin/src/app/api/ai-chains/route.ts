import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@employr/db";
import crypto from "crypto";

export interface AiRoutingChain {
  id: string;
  name: string;
  description: string;
  provider_ids: string[];
  temperature?: number;
  created_at: string;
  updated_at: string;
}

const CHAINS_SETTING_KEY = "ai_custom_chains";
const ASSIGNMENTS_SETTING_KEY = "ai_feature_chain_assignments";
const SETTING_GROUP = "ai_routing";

async function getStoredChains(): Promise<AiRoutingChain[]> {
  try {
    const record = await prisma.system_settings.findUnique({
      where: { key: CHAINS_SETTING_KEY },
    });
    if (!record?.value) return [];
    return JSON.parse(record.value) as AiRoutingChain[];
  } catch (e) {
    console.warn("[ai-chains] Gagal membaca chains dari system_settings:", e);
    return [];
  }
}

async function getStoredAssignments(): Promise<Record<string, string | null>> {
  try {
    const record = await prisma.system_settings.findUnique({
      where: { key: ASSIGNMENTS_SETTING_KEY },
    });
    if (!record?.value) return {};
    return JSON.parse(record.value) as Record<string, string | null>;
  } catch (e) {
    console.warn("[ai-chains] Gagal membaca assignments dari system_settings:", e);
    return {};
  }
}

async function saveChains(chains: AiRoutingChain[]) {
  await prisma.system_settings.upsert({
    where: { key: CHAINS_SETTING_KEY },
    create: {
      id: crypto.randomUUID(),
      key: CHAINS_SETTING_KEY,
      value: JSON.stringify(chains),
      group: SETTING_GROUP,
      description: "Daftar config gabungan / routing chain AI",
      updated_at: new Date(),
    },
    update: {
      value: JSON.stringify(chains),
      updated_at: new Date(),
    },
  });
}

async function saveAssignments(assignments: Record<string, string | null>) {
  await prisma.system_settings.upsert({
    where: { key: ASSIGNMENTS_SETTING_KEY },
    create: {
      id: crypto.randomUUID(),
      key: ASSIGNMENTS_SETTING_KEY,
      value: JSON.stringify(assignments),
      group: SETTING_GROUP,
      description: "Pemetaan fitur ke custom config gabungan AI",
      updated_at: new Date(),
    },
    update: {
      value: JSON.stringify(assignments),
      updated_at: new Date(),
    },
  });
}

export async function GET() {
  try {
    const [chains, assignments, allProviders] = await Promise.all([
      getStoredChains(),
      getStoredAssignments(),
      prisma.ai_providers.findMany({
        orderBy: { priority: "desc" },
      }),
    ]);

    const providerMap = new Map(allProviders.map((p) => [p.id, p]));

    // Enrich chains with provider objects
    const enrichedChains = chains.map((c) => ({
      ...c,
      providers: c.provider_ids
        .map((pid) => providerMap.get(pid))
        .filter(Boolean)
        .map((p) => ({
          id: p!.id,
          name: p!.name,
          provider: p!.alias || p!.name,
          model: p!.model,
          is_active: p!.is_active,
        })),
    }));

    return NextResponse.json({
      success: true,
      chains: enrichedChains,
      assignments,
    });
  } catch (err: any) {
    console.error("[GET /api/ai-chains] Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat config gabungan" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description = "", provider_ids, temperature } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama config gabungan wajib diisi" },
        { status: 400 }
      );
    }

    if (!Array.isArray(provider_ids) || provider_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Minimal pilih 1 endpoint provider untuk digabungkan" },
        { status: 400 }
      );
    }

    const currentChains = await getStoredChains();
    const newChain: AiRoutingChain = {
      id: `chain_${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      description: description.trim(),
      provider_ids,
      temperature: typeof temperature === "number" ? temperature : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentChains.push(newChain);
    await saveChains(currentChains);

    return NextResponse.json({ success: true, chain: newChain });
  } catch (err: any) {
    console.error("[POST /api/ai-chains] Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal membuat config gabungan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: Update feature-to-chain assignments
    if (body.assignments && typeof body.assignments === "object") {
      const currentAssignments = await getStoredAssignments();
      const updatedAssignments = {
        ...currentAssignments,
        ...body.assignments,
      };
      await saveAssignments(updatedAssignments);
      return NextResponse.json({ success: true, assignments: updatedAssignments });
    }

    // Mode 2: Update an existing chain definition
    const { id, name, description, provider_ids, temperature } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID config gabungan wajib disertakan" },
        { status: 400 }
      );
    }

    const currentChains = await getStoredChains();
    const index = currentChains.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Config gabungan tidak ditemukan" },
        { status: 404 }
      );
    }

    currentChains[index] = {
      ...currentChains[index],
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(Array.isArray(provider_ids) && { provider_ids }),
      ...(temperature !== undefined && { temperature }),
      updated_at: new Date().toISOString(),
    };

    await saveChains(currentChains);
    return NextResponse.json({ success: true, chain: currentChains[index] });
  } catch (err: any) {
    console.error("[PUT /api/ai-chains] Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui config gabungan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID config gabungan wajib disertakan" },
        { status: 400 }
      );
    }

    const currentChains = await getStoredChains();
    const filteredChains = currentChains.filter((c) => c.id !== id);
    await saveChains(filteredChains);

    // Clean up assignments using this chain
    const currentAssignments = await getStoredAssignments();
    let assignmentsChanged = false;
    for (const [feat, chainId] of Object.entries(currentAssignments)) {
      if (chainId === id) {
        currentAssignments[feat] = null;
        assignmentsChanged = true;
      }
    }
    if (assignmentsChanged) {
      await saveAssignments(currentAssignments);
    }

    return NextResponse.json({ success: true, message: "Config gabungan berhasil dihapus" });
  } catch (err: any) {
    console.error("[DELETE /api/ai-chains] Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus config gabungan" },
      { status: 500 }
    );
  }
}
