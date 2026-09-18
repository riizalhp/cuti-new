import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

const scoringWeights = [
  { key: 'ats_content_quality', value: '0.4', description: 'ATS: Bobot Content Quality (0-1)' },
  { key: 'ats_readability', value: '0.25', description: 'ATS: Bobot Readability (0-1)' },
  { key: 'ats_completeness', value: '0.2', description: 'ATS: Bobot Completeness (0-1)' },
  { key: 'ats_integrity', value: '0.15', description: 'ATS: Bobot Content Integrity (0-1)' },
  { key: 'jobmatch_skills', value: '0.45', description: 'Job Match: Bobot Skills (0-1)' },
  { key: 'jobmatch_experience', value: '0.30', description: 'Job Match: Bobot Experience (0-1)' },
  { key: 'jobmatch_location', value: '0.15', description: 'Job Match: Bobot Location (0-1)' },
  { key: 'jobmatch_salary', value: '0.10', description: 'Job Match: Bobot Salary (0-1)' },
];

const experiments = [
  { key: 'exp_new_recommendation_algo', value: JSON.stringify({ enabled: false, variant: 'control' }), description: 'Experiment: New recommendation algorithm' },
  { key: 'exp_feedback_widget_visible', value: JSON.stringify({ enabled: true, variant: 'treatment' }), description: 'Experiment: Show feedback widget on ATS & recommendations' },
];

async function main() {
  console.log('Seeding scoring weights...');
  for (const sw of scoringWeights) {
    await prisma.system_settings.upsert({
      where: { key: sw.key },
      update: { value: sw.value, updated_at: new Date() },
      create: {
        id: crypto.randomUUID(),
        key: sw.key,
        value: sw.value,
        group: 'scoring_weights',
        description: sw.description,
        updated_at: new Date(),
      },
    });
  }

  console.log('Seeding experiments...');
  for (const exp of experiments) {
    await prisma.system_settings.upsert({
      where: { key: exp.key },
      update: { value: exp.value, updated_at: new Date() },
      create: {
        id: crypto.randomUUID(),
        key: exp.key,
        value: exp.value,
        group: 'experiments',
        description: exp.description,
        updated_at: new Date(),
      },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
