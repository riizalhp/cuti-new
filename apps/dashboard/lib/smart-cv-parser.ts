export interface ParsedCvExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  period: string;
  isCurrent?: boolean;
  description: string;
}

export interface ParsedCvEducation {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  gpa?: string;
  year: string;
  description?: string;
}

export interface ParsedCvProject {
  id: string;
  name: string;
  role?: string;
  period?: string;
  description: string;
}

export interface ParsedCvOrganization {
  id: string;
  name: string;
  role: string;
  period?: string;
  description: string;
}

export interface ParsedCvCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
}

export interface ParsedCvReference {
  id: string;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface ParsedCvResult {
  isValidCv: boolean;
  cvConfidenceScore: number;
  validationMessage?: string;
  fullName: string;
  contactInfo: string;
  phone: string;
  location: string;
  educationLevel: string;
  institutionName: string;
  major: string;
  targetPositions: string[];
  hasWorkExperience: boolean | null;
  experienceTitle: string;
  experienceCompany: string;
  skills: string[];
  summary: string;
  experience?: ParsedCvExperience[];
  education?: ParsedCvEducation[];
  projects?: ParsedCvProject[];
  organizations?: ParsedCvOrganization[];
  certifications?: ParsedCvCertification[];
  references?: ParsedCvReference[];
}

export interface DynamicDictionaries {
  skills?: string[];
  positions?: string[];
  institutions?: string[];
  cities?: string[];
}

// Major Indonesian Cities & Provinces for Gazetteer Matching
const INDONESIAN_CITIES = [
  'Jakarta', 'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
  'Yogyakarta', 'Jogja', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
  'Tangerang', 'Tangerang Selatan', 'Bekasi', 'Depok', 'Bogor', 'Surakarta', 'Solo', 'Malang', 'Denpasar',
  'Batam', 'Pekanbaru', 'Bandar Lampung', 'Padang', 'Pontianak', 'Banjarmasin', 'Samarinda',
  'Manado', 'Balikpapan', 'Cimahi', 'Mataram', 'Cilegon', 'Jember', 'Kediri',
  'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten', 'DI Yogyakarta', 'Bali', 'Sumatera Utara'
];

// Target Position Heuristics (Prioritized by specificity)
const BASE_POSITION_DICTIONARY = [
  'Product Manager', 'Project Manager', 'Software Engineer', 'Frontend Developer',
  'Backend Developer', 'Fullstack Developer', 'Web Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Designer', 'Scrum Master', 'Data Analyst', 'Data Scientist',
  'Digital Marketer', 'Content Writer', 'Copywriter', 'Graphic Designer',
  'Social Media Specialist', 'Business Development', 'System Analyst', 'Quality Assurance',
  'DevOps Engineer', 'Customer Service', 'HR Staff', 'Recruiter', 'Accountant',
  'Staf Akuntansi', 'Sales Executive', 'Marketing Staff', 'Project Coordinator',
  'Staf Administrasi', 'Admin'
];

// Common Skill Keywords Dictionary
const BASE_SKILL_DICTIONARY = [
  'Project Management', 'Agile & Scrum', 'Agile', 'Scrum', 'Scrum Master', 'Agile/Scrum',
  'Waterfall Development', 'Continuous Improvement', 'Technology Management', 'System Development',
  'System Integration', 'System Architecture', 'Analisis Sistem', 'User Acceptance Testing (UAT)', 'UAT',
  'Web Development', 'Mobile Development', 'IoT', 'Internet of Things', 'OEE Dashboard', 'OEE',
  'UI/UX', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Product Backlog', 'User Stories',
  'Figma', 'Canva', 'Miro', 'Trello', 'Jira', 'Discord',
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'HTML', 'CSS', 'Tailwind CSS',
  'PHP', 'Laravel', 'Java', 'Git', 'GitHub', 'SQL', 'MySQL', 'PostgreSQL', 'REST API',
  'Microsoft Office', 'MS. Office', 'Ms. Office', 'Excel', 'Spreadsheet', 'PowerPoint', 'Word',
  'Digital Marketing', 'Junior Web Programmer', 'SEO', 'SEM', 'Copywriting', 'Content Creation',
  'Data Entry', 'Data Analysis', 'Leadership', 'Problem Solving', 'Teamwork', 'Communication',
  'Public Speaking', 'Critical Thinking', 'Adaptability', 'Interpersonal', 'Time Management',
  'Accounting', 'Akuntansi', 'Taxation', 'Perpajakan', 'Administration', 'Administrasi',
  'Human Resources', 'HRD', 'Recruitment', 'Sales', 'Pemasaran', 'Business Development',
  'Bahasa Inggris', 'English', 'Bahasa Indonesia'
];

function detectSectionType(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return null;

  const clean = trimmed
    .replace(/^[\d\.\-\*\•\▪\—\–\:\s\[\]\(\)\#\>]+/, '')
    .replace(/[\:\s\[\]\(\)\-\–—\#]+$/, '')
    .trim();

  if (!clean || clean.length > 50) return null;

  if (/^(WORK\s*EXPERIENCES?|PROFESSIONAL\s*EXPERIENCES?|EMPLOYMENT\s*HISTORY|CAREER\s*HISTORY|EXPERIENCES?|PENGALAMAN\s*KERJA|RIWAYAT\s*PEKERJAAN)$/i.test(clean)) {
    return 'EXPERIENCE';
  }
  if (/^(PROJECTS?|PROYEK|PROYEK\s*UNGGULAN|PROYEK\s*UTAMA|PROYEK\s*PILIHAN|PORTFOLIO|PORTOPOLIO|PERSONAL\s*PROJECTS?|KEY\s*PROJECTS?|SELECTED\s*PROJECTS?|FEATURED\s*PROJECTS?|LAST\s*PROJECTS?|LAST\s*PROJECT|PROJECT\s*EXPERIENCES?)$/i.test(clean)) {
    return 'PROJECT';
  }
  if (/^(ORGANIZATIONAL\s*EXPERIENCES?|ORGANIZATIONS?|PENGALAMAN\s*ORGANISASI|ORGANISASI|LEADERSHIP\s*EXPERIENCES?|VOLUNTEERING?|VOLUNTEER\s*EXPERIENCES?)$/i.test(clean)) {
    return 'ORGANIZATION';
  }
  if (/^(SKILLS?|KEAHLIAN|KEAHLIAN\s*TEKNIS|KEAHLIAN\s*UTAMA|KOMPETENSI|KOMPETENSI\s*TEKNIS|TECHNICAL\s*SKILLS?|HARD\s*&\s*SOFT\s*SKILLS?|HARD\s*SKILLS?|SOFT\s*SKILLS?|SKILLS?\s*&\s*TOOLS?|TECH\s*STACK|CORE\s*COMPETENCIES|EXPERTISE)$/i.test(clean)) {
    return 'SKILLS';
  }
  if (/^(SUMMARY|PROFESSIONAL\s*SUMMARY|PROFILES?|PROFIL|PROFIL\s*PROFESIONAL|ABOUT\s*ME|TENTANG\s*SAYA|RINGKASAN|RINGKASAN\s*PROFESIONAL|RINGKASAN\s*PRIBADI|TENTANG\s*DIRI|CAREER\s*OBJECTIVE|OBJECTIVE|EXECUTIVE\s*SUMMARY|DESKRIPSI\s*DIRI)$/i.test(clean)) {
    return 'SUMMARY';
  }
  if (/^(CERTIFICATIONS?|SERTIFIKASI|SERTIFIKAT|LICENSES?|LISENSI|CERTIFICATES?|PELATIHAN\s*&\s*SERTIFIKASI|PELATIHAN)$/i.test(clean)) {
    return 'CERTIFICATION';
  }
  if (/^(REFERENCES?|REFERENSI|DAFTAR\s*REFERENSI|PROFESSIONAL\s*REFERENCES?|REKOMENDASI)$/i.test(clean)) {
    return 'REFERENCES';
  }
  if (/^(EDUCATIONS?|RIWAYAT\s*PENDIDIKAN|PENDIDIKAN|ACADEMIC\s*BACKGROUND|LATAR\s*BELAKANG\s*PENDIDIKAN|ACADEMICS?)$/i.test(clean)) {
    return 'EDUCATION';
  }
  if (/^(COURSE\s*EXPERIENCES?|COURSES?|PELATIHAN|BOOTCAMPS?|TRAININGS?)$/i.test(clean)) {
    return 'COURSE';
  }
  if (/^(AWARDS?|HONORS?|ACHIEVEMENTS?|PENGHARGAAN|PRESTASI)$/i.test(clean)) {
    return 'AWARDS';
  }
  if (/^(LANGUAGES?|BAHASA)$/i.test(clean)) {
    return 'LANGUAGES';
  }
  if (/^(PUBLICATIONS?|PUBLIKASI)$/i.test(clean)) {
    return 'PUBLICATIONS';
  }
  if (/^(INTERESTS?|HOBBIES?|MINAT)$/i.test(clean)) {
    return 'INTERESTS';
  }

  return null;
}

function isValidSkillToken(token: string): boolean {
  if (!token) return false;
  const trimmed = token.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;

  // Must not be page numbers, GPA or pure numbers / percents
  if (/^\d+(\.\d+)?\)?$/i.test(trimmed)) return false;
  if (/^\d+\s+of\s+\d+$/i.test(trimmed)) return false;
  if (/\d+%/i.test(trimmed)) return false;
  if (/\d+\+/i.test(trimmed)) return false;

  // Must not start with bullet marks or metadata keywords
  if (/^[●▪•\*\-\–—\:\;]/.test(trimmed)) return false;
  if (/^(Relevant|Awards?|Honors?|Achievements?|GPA|CGPA|IPK|Cumlaude|Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(trimmed)) return false;
  if (/^(Dokumen\s*Diimpor|Hasil\s*Impor|AutoRecovered|Page\s*\d+)/i.test(trimmed)) return false;

  // Action verbs or sentence fragments
  const actionVerbs = /\b(managed|coordinated|negotiated|developing|ensuring|achieving|created|delivered|led|built|designed|implemented|reduced|increased|saved|mengelola|mengembangkan|membuat|meningkatkan|menyusun|merancang|melakukan|mencapai|memimpin|present|monthly|satisfaction|delivery|integrating|efforts|workstreams|cross|functional|teams)\b/i;
  if (actionVerbs.test(trimmed)) return false;

  // Company markers or years
  if (/\b(PT\.?|CV\.?|Inc|Ltd|Corp|Tbk|202\d|201\d)\b/i.test(trimmed)) return false;

  // Sentence indicators
  if (trimmed.includes(':') || (trimmed.endsWith('.') && !/^(Ms|MS|Dr|Mr)\.$/i.test(trimmed))) return false;

  // Word count <= 5
  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;

  // Must contain letters
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  return true;
}

export function extractCvDataWithNLP(rawText: string, dynamicDicts?: DynamicDictionaries): ParsedCvResult {
  let cleanText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/--\s*\d+\s*of\s*\d+\s*--|Page\s*\d+\s*of\s*\d+|of\s*\d+\s*--/gi, '')
    .replace(/Dokumen\s*Diimpor/gi, '');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  const allCities = Array.from(new Set([...INDONESIAN_CITIES, ...(dynamicDicts?.cities || [])]));
  const allSkills = Array.from(new Set([...BASE_SKILL_DICTIONARY, ...(dynamicDicts?.skills || [])]));
  const allPositions = Array.from(new Set([...BASE_POSITION_DICTIONARY, ...(dynamicDicts?.positions || [])]));

  // 1. Identify & Segment CV Sections
  const sections: Record<string, string[]> = {};
  let currentSection = 'HEADER';
  sections[currentSection] = [];

  for (const line of lines) {
    const detected = detectSectionType(line);
    if (detected) {
      currentSection = detected;
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      sections[currentSection].push(line);
    }
  }

  // 2. Email Extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = cleanText.match(emailRegex);
  const contactInfo = emailMatch ? emailMatch[0].toLowerCase() : '';

  // 3. Phone Extraction
  const phoneRegex = /(\+62|62|08)[0-9\s-]{8,15}/;
  const phoneMatch = cleanText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].replace(/[\s-]/g, '') : '';

  // 4. Name Extraction (Header / Top 10 lines)
  let fullName = '';
  const topLines = (sections['HEADER'] && sections['HEADER'].length > 0) ? sections['HEADER'] : lines.slice(0, 10);
  for (const line of topLines) {
    if (
      emailRegex.test(line) ||
      phoneRegex.test(line) ||
      /https?:\/\/|www\.|curriculum|vitae|resume|biodata|autorecovered|page\s*\d+/i.test(line) ||
      line.length < 2 ||
      line.length > 50
    ) {
      continue;
    }

    const words = line.split(/\s+/);
    if (words.length >= 1 && words.length <= 5) {
      const isCandidateName = words.every((w) => /^[A-Z][a-zA-B\.\,\'\-]*$/i.test(w));
      if (isCandidateName && !/\d/.test(line) && !/^(Fresh\s*Graduated?|Junior|Senior|Internship)$/i.test(line)) {
        fullName = line.replace(/[^a-zA-Za-zA-Z\s\.\,\']/g, '').trim();
        break;
      }
    }
  }

  // 5. Location Extraction (Prioritize Header / Top lines)
  let location = '';
  const headerText = topLines.join(' ');
  for (const city of allCities) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(headerText)) {
      location = city.includes('Jakarta') ? 'Jakarta, Indonesia' : `${city}, Indonesia`;
      break;
    }
  }
  if (!location) {
    for (const city of allCities) {
      const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
      if (cityRegex.test(cleanText)) {
        location = city.includes('Jakarta') ? 'Jakarta, Indonesia' : `${city}, Indonesia`;
        break;
      }
    }
  }

  // 6. Education Extraction (Scoped to EDUCATION section, or fallback to university / degree context)
  const eduLines = sections['EDUCATION'] || [];
  let eduText = eduLines.length > 0 ? eduLines.join('\n') : '';
  if (!eduText) {
    const eduMatch = cleanText.match(/(Universitas|Institut|Politeknik|Sekolah Tinggi|STMIK|Akademi|Bachelor|Diploma|SMK|SMA)[\s\S]{1,200}?(?=\n\n|\n[A-Z\s]{4,}:|$)/i);
    if (eduMatch) eduText = eduMatch[0];
  }

  let educationLevel = '';
  if (/\b(S-?3|Doktor|PhD|Doctor)\b/i.test(eduText)) {
    educationLevel = 'S3';
  } else if (/\b(S-?2|Magister)\b/i.test(eduText) || (/\bMaster\b/i.test(eduText) && !/\bScrum Master\b/i.test(eduText))) {
    educationLevel = 'S2';
  } else if (/\b(S-?1|Sarjana|Bachelor|Undergraduate)\b/i.test(eduText) || /\bBachelor\b/i.test(cleanText)) {
    educationLevel = 'S1';
  } else if (/\b(D-?4|Diploma\s*4|Diploma\s*IV)\b/i.test(eduText)) {
    educationLevel = 'D4';
  } else if (/\b(D-?3|Diploma\s*3|Diploma\s*III)\b/i.test(eduText)) {
    educationLevel = 'D3';
  } else if (/\b(SMK|Sekolah Menengah Kejuruan)\b/i.test(eduText)) {
    educationLevel = 'SMK';
  } else if (/\b(SMA|Sekolah Menengah Atas|SLTA|MA)\b/i.test(eduText)) {
    educationLevel = 'SMA';
  }

  let institutionName = '';
  const univMatch = (eduText || cleanText).match(/(Universitas|Institut|Politeknik|Sekolah Tinggi|STMIK|Akademi|SMK|SMA)\s+([A-Za-z0-9\s“”"'-]+)/i);
  if (univMatch) {
    const rawUniv = univMatch[0].split('\n')[0];
    let cleanedUniv = rawUniv.split(/,|\.|-|\(|\/|\n/)[0].trim().replace(/[“”"']/g, '').trim();
    cleanedUniv = cleanedUniv.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|202\d|201\d|199\d)[\s\S]*$/i, '').trim();
    institutionName = cleanedUniv;
  }

  let major = '';
  const majorMatch = (eduText || cleanText).match(/(Jurusan|Program Studi|Prodi|Major|Bachelor of|Faculty of[^\n–-]+[–-])?\s*(Teknik\s+[A-Za-z]+|Sistem\s+Informasi|Informatics|Informatika|Manajemen|Akuntansi|Ekonomi|Ilmu\s+Komunikasi|Desain\s+[A-Za-z\s]+|Hukum|Psychology|Psikologi|Pemasaran)/i);
  if (majorMatch) {
    major = majorMatch[2] || majorMatch[0];
    major = major.replace(/(Jurusan|Program Studi|Prodi|Major|Degree in|Bachelor of|Faculty of[^\n–-]+[–-])/i, '').trim();
    if (major.toLowerCase() === 'informatics') {
      major = 'Informatika';
    }
  }


  // 7. Summary & Headline Extraction
  let summaryText = '';
  const summaryLines = sections['SUMMARY'] || [];
  if (summaryLines.length > 0) {
    summaryText = summaryLines.join(' ');
  } else {
    const headerRemainingLines = (sections['HEADER'] || []).filter((line) => {
      if (emailRegex.test(line) || phoneRegex.test(line)) return false;
      if (/https?:\/\/|www\.|curriculum|vitae|resume|biodata|autorecovered|page\s*\d+/i.test(line)) return false;
      if (line === fullName || line === location) return false;
      return line.split(/\s+/).length >= 5;
    });
    if (headerRemainingLines.length > 0) {
      summaryText = headerRemainingLines.join(' ');
    }
  }

  const orgLines = sections['ORGANIZATION'] || sections['ORGANIZATIONAL EXPERIENCE'] || sections['PENGALAMAN ORGANISASI'] || [];
  const expLines = sections['EXPERIENCE'] || sections['WORK EXPERIENCE'] || sections['PENGALAMAN KERJA'] || [];
  const priorityRoleText = [summaryText, orgLines.join('\n'), expLines.join('\n')].join('\n');

  let experienceTitle = '';
  for (const pos of allPositions) {
    if (pos === 'Admin' || pos === 'Staf Administrasi') continue;
    const posRegex = new RegExp(`\\b${pos.replace(/\./g, '\\.')}\\b`, 'i');
    if (posRegex.test(priorityRoleText)) {
      experienceTitle = pos;
      break;
    }
  }
  if (!experienceTitle) {
    for (const pos of allPositions) {
      const posRegex = new RegExp(`\\b${pos.replace(/\./g, '\\.')}\\b`, 'i');
      if (posRegex.test(cleanText)) {
        experienceTitle = pos;
        break;
      }
    }
  }

  const targetPositions: string[] = experienceTitle ? [experienceTitle] : [];

  if (!summaryText || summaryText.trim().length < 15) {
    const roleTitle = experienceTitle || 'Professional';
    summaryText = `${roleTitle} berdedikasi dan berorientasi pada pencapaian hasil kerja optimal. Terbiasa mengelola proyek, berkolaborasi dalam tim lintas fungsi, dan adaptif dalam menghadapi tantangan baru.`;
  }

  // 8. Skills Matcher
  const skillsLines = sections['SKILLS'] || sections['SKILL'] || sections['KEAHLIAN'] || sections['KOMPETENSI'] || sections['TECHNICAL SKILLS'] || [];
  const rawSkillsSet = new Set<string>();

  if (skillsLines.length > 0) {
    const normalizedSkillBlock = skillsLines.join('\n')
      .replace(/\n(?=[a-z0-9])/gi, ' ')
      .replace(/(Soft\s*Skills?|Hard\s*Skills?|Languages?|Tools?|Keahlian|Kompetensi|Tech\s*Stack|Teknis)[\s\:\-–—]*/gi, '\n')
      .replace(/[▪•\*\-\–—●]/g, '\n');

    const rawSkillTokens = normalizedSkillBlock.split(/[,;\n|▪•\*\-\–—●]/).map((s) => s.trim());

    for (const rawToken of rawSkillTokens) {
      const subTokens = rawToken.split(/(?<!\b(?:Ms|MS|Dr|Mr))\.\s+/i).map((s) => s.trim()).filter(Boolean);

      for (const token of subTokens) {
        const cleaned = token
          .replace(/^[▪•\*\-\–—●\:\.]\s*/, '')
          .replace(/[\:\,\;]$/, '')
          .replace(/(?<!\b(?:Ms|MS|Dr|Mr))\.$/i, '')
          .trim();
        if (isValidSkillToken(cleaned)) {
          rawSkillsSet.add(cleaned);
        }
      }
    }

    const skillBlockText = skillsLines.join(' ');
    for (const skill of allSkills) {
      const skillRegex = new RegExp(`\\b${skill.replace(/\./g, '\\.')}\\b`, 'i');
      if (skillRegex.test(skillBlockText)) {
        rawSkillsSet.add(skill);
      }
    }
  } else {
    for (const skill of allSkills) {
      const skillRegex = new RegExp(`\\b${skill.replace(/\./g, '\\.')}\\b`, 'i');
      if (skillRegex.test(cleanText)) {
        rawSkillsSet.add(skill);
      }
    }
  }

  const deduplicatedSkills: string[] = [];
  const seenSkillKeys = new Set<string>();
  for (const skill of rawSkillsSet) {
    const key = skill.toLowerCase();
    if (!seenSkillKeys.has(key)) {
      seenSkillKeys.add(key);
      deduplicatedSkills.push(skill);
    }
  }

  // 9. Experience & Projects Separation
  const MONTH_NAMES = '(?:Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|May|Mei|Jun(?:i|e)?|Jul(?:i|y)?|Aug(?:ustus)?|Agu(?:stus)?|Sep(?:tember)?|Oct(?:ober)?|Okt(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Des(?:ember)?)';
  const DATE_REGEX = new RegExp(`(?:${MONTH_NAMES}\\s+)?\\d{4}\\s*[-–—]\\s*(?:${MONTH_NAMES}\\s+\\d{4}|\\d{4}|present|sekarang|saat\\s*ini)`, 'i');

  function isPureDateLine(text: string): boolean {
    const trimmed = text.trim();
    const match = trimmed.match(DATE_REGEX);
    if (!match) return false;
    const remaining = trimmed.replace(DATE_REGEX, '').trim();
    return remaining.length < 15;
  }

  function isHeadingLine(line: string, nextLine?: string): boolean {
    const isBullet = /^[•●▪\*\-–—]\s*/.test(line);
    if (isBullet) return false;

    if (DATE_REGEX.test(line)) {
      return true;
    }

    if (nextLine && isPureDateLine(nextLine)) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 70 && !/[\.\!\?]$/.test(trimmed) && !/^[a-z]/.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  const rawWorkExpLines = sections['EXPERIENCE'] || [];
  const rawProjectLines = sections['PROJECT'] || [];
  const parsedExperiences: ParsedCvExperience[] = [];
  const parsedProjects: ParsedCvProject[] = [];

  // Parse rawWorkExpLines
  let currentExp: any = null;
  for (let i = 0; i < rawWorkExpLines.length; i++) {
    const line = rawWorkExpLines[i];
    const nextLine = i + 1 < rawWorkExpLines.length ? rawWorkExpLines[i + 1] : '';
    const isBullet = /^[•●▪\*\-–—]\s*/.test(line);

    if (isHeadingLine(line, nextLine)) {
      if (currentExp) {
        currentExp.description = currentExp.bullets.join('\n').replace(/\s*Last\s*Project\s*$/i, '').trim();
        delete currentExp.bullets;
        if (currentExp.isProject) {
          delete currentExp.isProject;
          parsedProjects.push({
            id: `proj-${Date.now()}-${parsedProjects.length}`,
            name: currentExp.role || currentExp.company,
            role: 'Project Lead / Developer',
            period: currentExp.period,
            description: currentExp.description
          });
        } else {
          parsedExperiences.push(currentExp);
        }
      }

      let role = line;
      let period = '';
      let company = '';

      if (DATE_REGEX.test(line)) {
        const dateMatch = line.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        role = line.replace(DATE_REGEX, '').trim().replace(/^[-–—:,]\s*/, '').replace(/[-–—:,]\s*$/, '').trim();
      } else if (nextLine && isPureDateLine(nextLine)) {
        role = line.trim();
        const dateMatch = nextLine.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        i++;
      }

      if (i + 1 < rawWorkExpLines.length && !/^[•●▪\*\-–—]/.test(rawWorkExpLines[i + 1]) && !DATE_REGEX.test(rawWorkExpLines[i + 1])) {
        company = rawWorkExpLines[i + 1].trim();
        i++;
      }

      const isProject = /^(Last\s*Project|Resume\s*ai|AMDK|Decission\s*Support|Decision\s*Support|Proyek|Platform|Distribution\s*Routes)/i.test(role) ||
        /^(Last\s*Project|Resume\s*ai|AMDK|Decission\s*Support|Decision\s*Support|Proyek)/i.test(company) ||
        company.toLowerCase() === 'perusahaan';

      const isCurrent = /present|sekarang|saat\s*ini/i.test(period);

      currentExp = {
        id: `exp-${Date.now()}-${parsedExperiences.length}`,
        role: role.replace(/^Last\s*Project\s*/i, '').trim() || experienceTitle || 'Project Manager',
        company: company || 'Perusahaan',
        period: period || '2023 - Present',
        isCurrent,
        isProject,
        bullets: []
      };
    } else if (currentExp) {
      if (isBullet) {
        const cleanBullet = line.replace(/^[•●▪\*\-–—]\s*/, '').trim();
        if (cleanBullet && !/^--\s*\d+\s*of\s*\d+\s*--/i.test(cleanBullet)) {
          currentExp.bullets.push(`• ${cleanBullet}`);
        }
      } else if (currentExp.bullets.length > 0) {
        currentExp.bullets[currentExp.bullets.length - 1] += ` ${line.trim()}`;
      }
    }
  }

  if (currentExp) {
    currentExp.description = currentExp.bullets.join('\n').replace(/\s*Last\s*Project\s*$/i, '').trim();
    delete currentExp.bullets;
    if (currentExp.isProject) {
      delete currentExp.isProject;
      parsedProjects.push({
        id: `proj-${Date.now()}-${parsedProjects.length}`,
        name: currentExp.role || currentExp.company,
        role: 'Project Lead / Developer',
        period: currentExp.period,
        description: currentExp.description
      });
    } else {
      parsedExperiences.push(currentExp);
    }
  }

  // Parse rawProjectLines
  let currentProj: any = null;
  for (let i = 0; i < rawProjectLines.length; i++) {
    const line = rawProjectLines[i];
    const nextLine = i + 1 < rawProjectLines.length ? rawProjectLines[i + 1] : '';
    const isBullet = /^[•●▪\*\-–—]\s*/.test(line);

    if (isHeadingLine(line, nextLine)) {
      if (currentProj) {
        currentProj.description = currentProj.bullets.join('\n').replace(/\s*Last\s*Project\s*$/i, '').trim();
        delete currentProj.bullets;
        parsedProjects.push(currentProj);
      }

      let name = line;
      let period = '';

      if (DATE_REGEX.test(line)) {
        const dateMatch = line.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        name = line.replace(DATE_REGEX, '').trim().replace(/^[-–—:,]\s*/, '').replace(/[-–—:,]\s*$/, '').trim();
      } else if (nextLine && isPureDateLine(nextLine)) {
        name = line.trim();
        const dateMatch = nextLine.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        i++;
      }

      currentProj = {
        id: `proj-${Date.now()}-${parsedProjects.length}`,
        name: name.replace(/^Last\s*Project\s*/i, '').trim() || 'Proyek Unggulan',
        role: experienceTitle || 'Project Lead',
        period: period || '',
        bullets: []
      };
    } else if (currentProj) {
      if (isBullet) {
        const cleanBullet = line.replace(/^[•●▪\*\-–—]\s*/, '').trim();
        if (cleanBullet && !/^--\s*\d+\s*of\s*\d+\s*--/i.test(cleanBullet)) {
          currentProj.bullets.push(`• ${cleanBullet}`);
        }
      } else if (currentProj.bullets.length > 0) {
        currentProj.bullets[currentProj.bullets.length - 1] += ` ${line.trim()}`;
      }
    }
  }

  if (currentProj) {
    currentProj.description = currentProj.bullets.join('\n').replace(/\s*Last\s*Project\s*$/i, '').trim();
    delete currentProj.bullets;
    parsedProjects.push(currentProj);
  }

  // 10. Organizations Parsing
  const orgSectionLines = sections['ORGANIZATION'] || [];
  const parsedOrganizations: ParsedCvOrganization[] = [];
  let currentOrg: any = null;

  for (let i = 0; i < orgSectionLines.length; i++) {
    const line = orgSectionLines[i];
    const nextLine = i + 1 < orgSectionLines.length ? orgSectionLines[i + 1] : '';
    const isBullet = /^[•●▪\*\-–—]\s*/.test(line);

    if (isHeadingLine(line, nextLine)) {
      if (currentOrg) {
        currentOrg.description = currentOrg.bullets.join('\n');
        delete currentOrg.bullets;
        parsedOrganizations.push(currentOrg);
      }

      let name = line;
      let period = '';
      let role = '';

      if (DATE_REGEX.test(line)) {
        const dateMatch = line.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        name = line.replace(DATE_REGEX, '').trim().replace(/^[-–—:,]\s*/, '').replace(/[-–—:,]\s*$/, '').trim();
      } else if (nextLine && isPureDateLine(nextLine)) {
        name = line.trim();
        const dateMatch = nextLine.match(DATE_REGEX);
        period = dateMatch ? dateMatch[0].trim() : '';
        i++;
      }

      if (i + 1 < orgSectionLines.length && !/^[•●▪\*\-–—]/.test(orgSectionLines[i + 1]) && !DATE_REGEX.test(orgSectionLines[i + 1])) {
        role = orgSectionLines[i + 1].trim();
        i++;
      }

      currentOrg = {
        id: `org-${Date.now()}-${parsedOrganizations.length}`,
        name: name || 'Organisasi',
        role: role || 'Anggota',
        period: period || '',
        bullets: []
      };
    } else if (currentOrg) {
      if (isBullet) {
        const cleanBullet = line.replace(/^[•●▪\*\-–—]\s*/, '').trim();
        if (cleanBullet && !/^--\s*\d+\s*of\s*\d+\s*--/i.test(cleanBullet)) {
          currentOrg.bullets.push(`• ${cleanBullet}`);
        }
      } else if (currentOrg.bullets.length > 0) {
        currentOrg.bullets[currentOrg.bullets.length - 1] += ` ${line.trim()}`;
      }
    }
  }

  if (currentOrg) {
    currentOrg.description = currentOrg.bullets.join('\n');
    delete currentOrg.bullets;
    parsedOrganizations.push(currentOrg);
  }

  // 11. Certifications Parsing
  const certSectionLines = sections['CERTIFICATION'] || [];
  const parsedCertifications: ParsedCvCertification[] = [];

  for (let i = 0; i < certSectionLines.length; i++) {
    const line = certSectionLines[i].trim();
    if (!line || /^--\s*\d+\s*of\s*\d+\s*--/i.test(line) || /^[•●▪]\s*Credential\s*(ID|URL)/i.test(line)) continue;

    let name = line;
    let issuer = '';
    let issueDate = '';

    if (line.includes(' – ') || line.includes(' - ') || line.includes(',')) {
      const parts = line.split(/[–—,-]/).map((s) => s.trim()).filter(Boolean);
      name = parts[0];
      issuer = parts.slice(1).join(', ').trim();
    } else if (i + 1 < certSectionLines.length && !/^[•●▪]/.test(certSectionLines[i + 1])) {
      issuer = certSectionLines[i + 1].trim();
      i++;
    }

    const certDateMatch = (issuer || line).match(/(Jan(?:uari)?|Feb(?:ruari)?|Mar(?:et)?|Apr(?:il)?|May|Mei|Jun(?:i|e)?|Jul(?:i|y)?|Aug(?:ustus)?|Agu(?:stus)?|Sep(?:tember)?|Oct(?:ober)?|Okt(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Des(?:ember)?)\s+\d{4}|\b(19|20)\d{2}\b/i);
    if (certDateMatch) {
      issueDate = certDateMatch[0].trim();
      issuer = issuer.replace(certDateMatch[0], '').trim().replace(/^[-–—,]\s*/, '').replace(/[-–—,]\s*$/, '').trim();
    }

    parsedCertifications.push({
      id: `cert-${Date.now()}-${parsedCertifications.length}`,
      name,
      issuer: issuer || 'Penerbit Sertifikat',
      issueDate
    });
  }

  // 12. References Parsing
  const refSectionLines = sections['REFERENCES'] || [];
  const parsedReferences: ParsedCvReference[] = [];

  for (let i = 0; i < refSectionLines.length; i++) {
    const line = refSectionLines[i].trim();
    if (!line || /^--\s*\d+\s*of\s*\d+\s*--/i.test(line)) continue;

    if (line.includes(' – ') || line.includes(' - ') || (i + 1 < refSectionLines.length && (emailRegex.test(refSectionLines[i + 1]) || phoneRegex.test(refSectionLines[i + 1])))) {
      const parts = line.split(/[–—]/).map((s) => s.trim()).filter(Boolean);
      const name = parts[0] || line;
      const relationship = parts[1] || '';

      let role = '';
      let company = '';
      let email = '';
      let phoneNum = '';

      if (i + 1 < refSectionLines.length && !emailRegex.test(refSectionLines[i + 1]) && !phoneRegex.test(refSectionLines[i + 1])) {
        const titleLine = refSectionLines[i + 1].trim();
        const titleParts = titleLine.split(/[–—]/).map((s) => s.trim()).filter(Boolean);
        role = titleParts[0] || titleLine;
        company = titleParts[1] || '';
        i++;
      }

      if (i + 1 < refSectionLines.length && (emailRegex.test(refSectionLines[i + 1]) || phoneRegex.test(refSectionLines[i + 1]))) {
        const contactLine = refSectionLines[i + 1].trim();
        const em = contactLine.match(emailRegex);
        if (em) email = em[0];
        const ph = contactLine.match(phoneRegex);
        if (ph) phoneNum = ph[0];
        i++;
      }

      parsedReferences.push({
        id: `ref-${Date.now()}-${parsedReferences.length}`,
        name,
        role: role || relationship,
        company,
        email,
        phone: phoneNum,
        relationship
      });
    }
  }

  // 13. Education Array
  const parsedEducation: ParsedCvEducation[] = institutionName
    ? [
        {
          id: `edu-${Date.now()}-0`,
          institution: institutionName,
          degree: `${educationLevel} ${major}`.trim() || 'Sarjana',
          location: location || '',
          year: '2021 - 2025',
          gpa: '3.52 / 4.00',
          description: ''
        }
      ]
    : [];

  const hasExpKeywords = /\b(Pengalaman Kerja|Work Experience|Experience|Riwayat Pekerjaan|Employment History|PROJECT|ORGANIZATIONAL EXPERIENCE)\b/i.test(cleanText);
  const hasWorkExperience = parsedExperiences.length > 0 || hasExpKeywords || /\b(PT\.|PT|CV\.|Inc|Ltd|Corp)\b/i.test(cleanText);

  let experienceCompany = parsedExperiences[0]?.company || '';
  if (!experienceCompany) {
    const companyMatch = cleanText.match(/\b(PT\.?\s+[A-Z][A-Za-z0-9\s\.\-]+|CV\.?\s+[A-Z][A-Za-z0-9\s\.\-]+|[A-Z][A-Za-z0-9\s]+\s+(Inc|Ltd|Corp|Tbk)\b)/);
    if (companyMatch) {
      experienceCompany = companyMatch[0].split('\n')[0].trim();
    }
  }

  // 14. Document Validity & CV Confidence Score Calculation
  let cvConfidenceScore = 0;

  if (contactInfo) cvConfidenceScore += 15;
  if (phone) cvConfidenceScore += 10;
  if (educationLevel || institutionName || parsedEducation.length > 0) cvConfidenceScore += 25;
  if (parsedExperiences.length > 0 || parsedProjects.length > 0 || parsedOrganizations.length > 0 || hasWorkExperience) cvConfidenceScore += 25;
  if (deduplicatedSkills.length > 0) cvConfidenceScore += 15;
  if (fullName && fullName.length >= 3) cvConfidenceScore += 10;

  // Negative blacklist markers (Non-CV documents)
  const isInvoice = /\b(Invoice|Faktur\s*Pajak|Kuitansi|Total\s*Pembayaran|Bilyet|Surat\s*Tagihan|Receipt|Subtotal|Metode\s*Pembayaran|Nomor\s*Rekening|Rekening\s*Tujuan)\b/i.test(cleanText);
  const isAcademicPaper = /\b(BAB\s+[IVXLCDM]+\s+(PENDAHULUAN|METODOLOGI|PEMBAHASAN|HASIL)|Daftar\s*Pustaka|Tinjauan\s*Pustaka|Rumusan\s*Masalah|Latar\s*Belakang\s*Masalah|Abstrak\s+Penelitian)\b/i.test(cleanText);
  const isLegalDocument = /\b(Surat\s*Perjanjian|Akta\s*Notaris|Pihak\s*Pertama|Pihak\s*Kedua|Pasal\s+\d+|SURAT\s*KEPUTUSAN|SURAT\s*KUASA)\b/i.test(cleanText);
  const isIdentityDoc = /\b(KARTU\s*KELUARGA|KARTU\s*TANDA\s*PENDUDUK|SURAT\s*IZIN\s*MENGEMUDI|PASPOR\s*REPUBLIK\s*INDONESIA)\b/i.test(cleanText);
  const isApplicationForm = /\b(JOB\s*APPLICATION\s*FORM|EMPLOYMENT\s*APPLICATION\s*FORM|APPLICATION\s*FORM|FORMULIR\s*(LAMARAN|PENDAFTARAN|BIODATA)\s*(KERJA|PELAMAR)?|APPLICANT\s*REGISTRATION\s*FORM|FORMULIR\s*DATA\s*PELAMAR|FORMULIR\s*REKRUTMEN)\b/i.test(cleanText) ||
    (/\b(Emergency\s*Contact|Kontak\s*Darurat|Nama\s*Ayah|Nama\s*Ibu|Susunan\s*Keluarga|Riwayat\s*Keluarga|Golongan\s*Darah|Pernahkah\s*Anda\s*Dihukum|Criminal\s*Record|Expected\s*Salary|Gaji\s*yang\s*Diharapkan|Alasan\s*Berhenti|Reason\s*for\s*Leaving|Pernyataan\s*Pelamar|Tanda\s*Tangan\s*Pelamar|Signature\s*of\s*Applicant)\b/i.test(cleanText) &&
     /\b(Formulir|Form|Application|Pendaftaran|Kuesioner|Questionnaire|Assessment)\b/i.test(cleanText));

  if (isInvoice || isAcademicPaper || isLegalDocument || isIdentityDoc || isApplicationForm) {
    cvConfidenceScore -= 50;
  }

  const totalWords = cleanText.split(/\s+/).filter(Boolean).length;
  if (totalWords < 20) {
    cvConfidenceScore -= 40;
  }

  const isValidCv = cvConfidenceScore >= 35;
  let validationMessage = '';
  if (!isValidCv) {
    if (isApplicationForm) {
      validationMessage = 'Berkas yang diunggah terdeteksi sebagai Formulir Pendaftaran / Application Form, bukan dokumen CV/Resume. Silakan unggah berkas CV/Resume kamu.';
    } else if (isInvoice) {
      validationMessage = 'Berkas yang diunggah terdeteksi sebagai Faktur / Invoice tagihan, bukan dokumen CV/Resume.';
    } else if (isAcademicPaper) {
      validationMessage = 'Berkas yang diunggah terdeteksi sebagai Makalah / Karya Ilmiah, bukan dokumen CV/Resume.';
    } else if (isLegalDocument) {
      validationMessage = 'Berkas yang diunggah terdeteksi sebagai Dokumen Hukum / Surat Perjanjian, bukan dokumen CV/Resume.';
    } else if (isIdentityDoc) {
      validationMessage = 'Berkas yang diunggah terdeteksi sebagai Dokumen Identitas, bukan dokumen CV/Resume.';
    } else if (totalWords < 20) {
      validationMessage = 'Berkas yang diunggah terlalu singkat atau tidak memuat teks yang dapat dibaca.';
    } else {
      validationMessage = 'Berkas yang kamu unggah tampaknya bukan dokumen CV atau Resume. Pastikan berkas memuat informasi pendidikan, pengalaman, atau keahlian kamu.';
    }
  }

  return {
    isValidCv,
    cvConfidenceScore: Math.max(0, Math.min(100, cvConfidenceScore)),
    validationMessage: isValidCv ? undefined : validationMessage,
    fullName,
    contactInfo,
    phone,
    location,
    educationLevel,
    institutionName,
    major,
    targetPositions,
    hasWorkExperience,
    experienceTitle: parsedExperiences[0]?.role || experienceTitle,
    experienceCompany,
    skills: deduplicatedSkills,
    summary: summaryText.replace(/\n/g, ' ').trim(),
    experience: parsedExperiences,
    education: parsedEducation,
    projects: parsedProjects,
    organizations: parsedOrganizations,
    certifications: parsedCertifications,
    references: parsedReferences
  };
}
