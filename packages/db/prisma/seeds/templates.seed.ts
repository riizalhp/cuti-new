import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'ATS Modern',
    category: 'ats_modern',
    description: 'Modern ATS-friendly template with clean design and excellent parsing compatibility',
    previewUrl: '/templates/ats-modern-preview.png',
    isPremium: false,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{fullName}} - Resume</title>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>{{fullName}}</h1>
      <div class="contact">
        <span>{{email}}</span>
        <span>{{phone}}</span>
        <span>{{location}}</span>
      </div>
    </header>

    <section class="summary">
      <h2>Professional Summary</h2>
      <p>{{summary}}</p>
    </section>

    <section class="experience">
      <h2>Experience</h2>
      {{#each experiences}}
      <div class="experience-item">
        <h3>{{position}}</h3>
        <div class="company">{{company}}</div>
        <div class="date">{{startDate}} - {{endDate}}</div>
        <p>{{description}}</p>
      </div>
      {{/each}}
    </section>

    <section class="education">
      <h2>Education</h2>
      {{#each education}}
      <div class="education-item">
        <h3>{{degree}} - {{field}}</h3>
        <div class="institution">{{institution}}</div>
        <div class="date">{{startDate}} - {{endDate}}</div>
      </div>
      {{/each}}
    </section>

    <section class="skills">
      <h2>Skills</h2>
      <ul>
        {{#each skills}}
        <li>{{name}}</li>
        {{/each}}
      </ul>
    </section>
  </div>
</body>
</html>
    `,
    cssContent: `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  border-bottom: 2px solid #2563eb;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 32px;
  color: #1e40af;
  margin-bottom: 10px;
}

.contact {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
}

section {
  margin-bottom: 30px;
}

section h2 {
  font-size: 20px;
  color: #1e40af;
  margin-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 5px;
}

.experience-item, .education-item {
  margin-bottom: 20px;
}

.experience-item h3, .education-item h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.company, .institution {
  font-weight: 600;
  color: #666;
}

.date {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.skills ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.skills li {
  background: #eff6ff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #1e40af;
}
    `,
  },
  {
    name: 'ATS Standard',
    category: 'ats_standard',
    description: 'Classic ATS-optimized template focused on content readability',
    previewUrl: '/templates/ats-standard-preview.png',
    isPremium: false,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{fullName}} - Resume</title>
</head>
<body>
  <div class="resume">
    <div class="header">
      <h1>{{fullName}}</h1>
      <p class="contact-info">
        {{email}} | {{phone}} | {{location}}
      </p>
    </div>

    <div class="section">
      <h2>SUMMARY</h2>
      <p>{{summary}}</p>
    </div>

    <div class="section">
      <h2>PROFESSIONAL EXPERIENCE</h2>
      {{#each experiences}}
      <div class="entry">
        <div class="entry-header">
          <strong>{{position}}</strong> - {{company}}
        </div>
        <div class="entry-date">{{startDate}} - {{endDate}}</div>
        <p>{{description}}</p>
      </div>
      {{/each}}
    </div>

    <div class="section">
      <h2>EDUCATION</h2>
      {{#each education}}
      <div class="entry">
        <div class="entry-header">
          <strong>{{degree}}</strong> - {{institution}}
        </div>
        <div class="entry-date">{{startDate}} - {{endDate}}</div>
      </div>
      {{/each}}
    </div>

    <div class="section">
      <h2>SKILLS</h2>
      <p>{{#each skills}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</p>
    </div>
  </div>
</body>
</html>
    `,
    cssContent: `
body {
  font-family: 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.4;
  color: #000;
  background: #fff;
  margin: 0;
  padding: 0;
}

.resume {
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0.75in;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}

.header h1 {
  font-size: 18pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  text-transform: uppercase;
}

.contact-info {
  font-size: 10pt;
  margin: 0;
}

.section {
  margin-bottom: 20px;
}

.section h2 {
  font-size: 12pt;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
  margin: 0 0 10px 0;
  padding-bottom: 2px;
}

.entry {
  margin-bottom: 15px;
}

.entry-header {
  font-size: 11pt;
}

.entry-date {
  font-size: 10pt;
  font-style: italic;
  color: #333;
  margin-bottom: 5px;
}

.entry p {
  margin: 5px 0 0 0;
}
    `,
  },
  {
    name: 'Fresh Graduate',
    category: 'fresh_graduate',
    description: 'Vibrant template designed for fresh graduates and entry-level positions',
    previewUrl: '/templates/fresh-graduate-preview.png',
    isPremium: false,
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{fullName}} - Resume</title>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="profile">
        <h1>{{fullName}}</h1>
        <p class="tagline">{{headline}}</p>
      </div>

      <section class="contact">
        <h3>Contact</h3>
        <div class="contact-item">{{email}}</div>
        <div class="contact-item">{{phone}}</div>
        <div class="contact-item">{{location}}</div>
      </section>

      <section class="skills-sidebar">
        <h3>Skills</h3>
        <ul>
          {{#each skills}}
          <li>{{name}}</li>
          {{/each}}
        </ul>
      </section>
    </aside>

    <main class="content">
      <section>
        <h2>About Me</h2>
        <p>{{summary}}</p>
      </section>

      <section>
        <h2>Education</h2>
        {{#each education}}
        <div class="item">
          <h4>{{degree}} - {{field}}</h4>
          <div class="meta">{{institution}} | {{startDate}} - {{endDate}}</div>
        </div>
        {{/each}}
      </section>

      <section>
        <h2>Experience</h2>
        {{#each experiences}}
        <div class="item">
          <h4>{{position}}</h4>
          <div class="meta">{{company}} | {{startDate}} - {{endDate}}</div>
          <p>{{description}}</p>
        </div>
        {{/each}}
      </section>

      <section>
        <h2>Projects</h2>
        {{#each projects}}
        <div class="item">
          <h4>{{name}}</h4>
          <p>{{description}}</p>
        </div>
        {{/each}}
      </section>
    </main>
  </div>
</body>
</html>
    `,
    cssContent: `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

.page {
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 40px 25px;
}

.profile h1 {
  font-size: 26px;
  margin-bottom: 10px;
  font-weight: 700;
}

.tagline {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.sidebar section {
  margin-bottom: 30px;
}

.sidebar h3 {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.contact-item {
  font-size: 13px;
  margin-bottom: 8px;
  opacity: 0.95;
}

.skills-sidebar ul {
  list-style: none;
}

.skills-sidebar li {
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.content {
  flex: 1;
  padding: 40px;
}

.content section {
  margin-bottom: 35px;
}

.content h2 {
  font-size: 22px;
  color: #667eea;
  margin-bottom: 20px;
  font-weight: 700;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.item {
  margin-bottom: 20px;
}

.item h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.meta {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  font-style: italic;
}

.item p {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}
    `,
  },
];

async function seedTemplates() {
  console.log('Seeding templates...');

  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
    console.log(`✓ Created/Updated template: ${template.name}`);
  }

  console.log('Template seeding complete!');
}

seedTemplates()
  .catch((e) => {
    console.error('Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
