const { PrismaClient } = require('../packages/db/node_modules/@prisma/client');
const prisma = new PrismaClient();

function formatHtml(text) {
  if (!text) return '';
  return text
    .replace(/<h>/gi, '<h3>')
    .replace(/<\/h>/gi, '</h3>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p>\n<p>')
    .replace(/<\/p>\s*/gi, '</p>\n\n')
    .replace(/<h([1-6])[^>]*>/gi, (m, g1) => '\n\n<h' + g1 + '>')
    .replace(/<\/h([1-6])>\s*/gi, (m, g1) => '</h' + g1 + '>\n\n')
    .replace(/<ul[^>]*>/gi, '\n<ul>\n')
    .replace(/<\/ul>\s*/gi, '\n</ul>\n\n')
    .replace(/<ol[^>]*>/gi, '\n<ol>\n')
    .replace(/<\/ol>\s*/gi, '\n</ol>\n\n')
    .replace(/\s*<li>/gi, '\n  <li>')
    .replace(/<\/li>\s*/gi, '</li>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function run() {
  const articles = await prisma.articles.findMany();
  for (const a of articles) {
    const formatted = formatHtml(a.content);
    await prisma.articles.update({
      where: { id: a.id },
      data: { content: formatted }
    });
  }
  console.log(`Successfully formatted ${articles.length} articles!`);
  await prisma.$disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
