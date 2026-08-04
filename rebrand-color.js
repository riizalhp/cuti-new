const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, 'apps', 'dashboard', 'components'),
  path.join(__dirname, 'apps', 'dashboard', 'app')
];

const patterns = [
  { from: /\bindigo-50\b/g, to: 'violet-50' },
  { from: /\bindigo-100\b/g, to: 'violet-100' },
  { from: /\bindigo-200\b/g, to: 'violet-200' },
  { from: /\bindigo-300\b/g, to: 'violet-300' },
  { from: /\bindigo-400\b/g, to: 'violet-400' },
  { from: /\bindigo-500\b/g, to: 'violet-500' },
  { from: /\bindigo-600\b/g, to: 'violet-600' },
  { from: /\bindigo-700\b/g, to: 'violet-700' },
  { from: /\bindigo-800\b/g, to: 'violet-800' },
  { from: /\bindigo-900\b/g, to: 'violet-900' },
  { from: /\bindigo-950\b/g, to: 'violet-950' },
  { from: /"indigo"/g, to: '"violet"' },
  { from: /'indigo'/g, to: "'violet'" }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const pattern of patterns) {
    content = content.replace(pattern.from, pattern.to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated colors in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
      processFile(filePath);
    }
  }
}

for (const dir of DIRECTORIES) {
  if (fs.existsSync(dir)) {
    console.log(`Processing colors in ${dir}...`);
    walkDir(dir);
  }
}

console.log('Color rebranding from Indigo to Violet completed!');
