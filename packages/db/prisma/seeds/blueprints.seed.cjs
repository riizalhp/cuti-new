const { PrismaClient } = require('../../src/generated/client/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedBlueprints() {
  console.log('🚀 Memulai proses seeding 788 Master Role Blueprints ke PostgreSQL...');

  // 1. Pastikan kolom details (jsonb) tersedia di tabel learned_role_blueprints
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE learned_role_blueprints 
      ADD COLUMN IF NOT EXISTS details jsonb;
    `);
    console.log('✓ Kolom details (jsonb) siap di tabel learned_role_blueprints.');
  } catch (err) {
    console.warn('Catatan kolom details:', err.message);
  }

  // 2. Baca file role_blueprints_seed.json
  const seedFilePath = path.join(__dirname, '../../data/role_blueprints_seed.json');
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`File seed tidak ditemukan di: ${seedFilePath}`);
  }

  const rawJson = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
  const blueprintsMap = rawJson.blueprints || rawJson;
  const roles = Object.values(blueprintsMap);
  console.log(`📦 Terdeteksi ${roles.length} blueprint untuk di-ingest.`);

  let insertedCount = 0;
  const startTime = Date.now();

  // 3. Loop upsert
  for (const role of roles) {
    const roleName = (role.canonical_title || '').trim();
    if (!roleName) continue;

    const essential = (role.essential_skills || []).map(s => String(s).trim()).filter(Boolean);
    const niceToHave = (role.nice_to_have_skills || []).map(s => String(s).trim()).filter(Boolean);
    const category = (role.category || 'other').trim();
    const entryCount = role.raw_source_metadata?.listing_count || 10;

    const details = {
      role_id: role.role_id,
      target_education: role.target_education || null,
      experience: role.experience || null,
      market_aliases_and_slang: role.market_aliases_and_slang || [],
      responsibilities: role.responsibilities || [],
      tools_and_platforms: role.tools_and_platforms || [],
      local_context_requirements: role.local_context_requirements || [],
      transferable_experience_bridges: role.transferable_experience_bridges || [],
    };

    const detailsJson = JSON.stringify(details);

    await prisma.$executeRaw`
      INSERT INTO learned_role_blueprints (
        id, role_name, entry_count, top_essential_skills, top_nicetohave_skills, category, is_promoted, details, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${roleName},
        ${entryCount},
        ${essential}::text[],
        ${niceToHave}::text[],
        ${category},
        true,
        ${detailsJson}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (role_name)
      DO UPDATE SET
        entry_count = EXCLUDED.entry_count,
        top_essential_skills = EXCLUDED.top_essential_skills,
        top_nicetohave_skills = EXCLUDED.top_nicetohave_skills,
        category = EXCLUDED.category,
        is_promoted = true,
        details = EXCLUDED.details,
        updated_at = NOW();
    `;

    insertedCount++;
    if (insertedCount % 100 === 0 || insertedCount === roles.length) {
      console.log(`  ➔ Progress: ${insertedCount} / ${roles.length} roles diproses...`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Berhasil meng-upsert ${insertedCount} Master Blueprints dalam ${durationSec} detik!`);
}

seedBlueprints()
  .catch((e) => {
    console.error('❌ Gagal seeding role blueprints:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
