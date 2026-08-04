import { Injectable } from '@nestjs/common';

interface CVData {
  personalInfo?: any;
  summary?: string;
  experiences?: any[];
  education?: any[];
  skills?: any[];
  certifications?: any[];
  projects?: any[];
  languages?: any[];
}

@Injectable()
export class AtsCalculatorService {
  /**
   * Calculate ATS score based on CV completeness and content quality
   * Score breakdown:
   * - Keyword matching (filled sections): 40%
   * - Completeness (required fields): 30%
   * - Formatting (consistency): 20%
   * - Experience relevance: 10%
   */
  calculateScore(cvData: CVData): number {
    const keywordScore = this.calculateKeywordScore(cvData);
    const completenessScore = this.calculateCompletenessScore(cvData);
    const formattingScore = this.calculateFormattingScore(cvData);
    const experienceScore = this.calculateExperienceScore(cvData);

    const finalScore =
      keywordScore * 0.4 +
      completenessScore * 0.3 +
      formattingScore * 0.2 +
      experienceScore * 0.1;

    return Math.round(finalScore * 100) / 100;
  }

  /**
   * Keyword matching: Count filled sections
   * 8 possible sections: personalInfo, summary, experiences, education, skills, certifications, projects, languages
   */
  private calculateKeywordScore(cvData: CVData): number {
    let filledSections = 0;
    const totalSections = 8;

    if (cvData.personalInfo && Object.keys(cvData.personalInfo).length > 0) filledSections++;
    if (cvData.summary && cvData.summary.trim().length > 0) filledSections++;
    if (cvData.experiences && cvData.experiences.length > 0) filledSections++;
    if (cvData.education && cvData.education.length > 0) filledSections++;
    if (cvData.skills && cvData.skills.length > 0) filledSections++;
    if (cvData.certifications && cvData.certifications.length > 0) filledSections++;
    if (cvData.projects && cvData.projects.length > 0) filledSections++;
    if (cvData.languages && cvData.languages.length > 0) filledSections++;

    return (filledSections / totalSections) * 100;
  }

  /**
   * Completeness: Check if required fields are present
   * Required: personalInfo (name, email), education, experiences or projects
   */
  private calculateCompletenessScore(cvData: CVData): number {
    let score = 0;

    // Personal info with name and email (40 points)
    if (cvData.personalInfo) {
      const info = cvData.personalInfo;
      if (info.fullName && info.fullName.length > 0) score += 20;
      if (info.email && info.email.length > 0) score += 20;
    }

    // Education (30 points)
    if (cvData.education && cvData.education.length > 0) {
      score += 30;
    }

    // Experience or projects (30 points)
    if (
      (cvData.experiences && cvData.experiences.length > 0) ||
      (cvData.projects && cvData.projects.length > 0)
    ) {
      score += 30;
    }

    return score;
  }

  /**
   * Formatting: Check consistency and quality
   * - Has summary: 30 points
   * - Multiple experiences/education entries: 30 points
   * - Skills with proper structure: 20 points
   * - Contact info complete (phone, location): 20 points
   */
  private calculateFormattingScore(cvData: CVData): number {
    let score = 0;

    // Has summary
    if (cvData.summary && cvData.summary.trim().length >= 50) {
      score += 30;
    }

    // Multiple entries show consistency
    const experienceCount = cvData.experiences?.length || 0;
    const educationCount = cvData.education?.length || 0;
    if (experienceCount >= 2 || educationCount >= 2) {
      score += 30;
    } else if (experienceCount >= 1 || educationCount >= 1) {
      score += 15;
    }

    // Skills properly structured
    if (cvData.skills && cvData.skills.length >= 3) {
      score += 20;
    } else if (cvData.skills && cvData.skills.length >= 1) {
      score += 10;
    }

    // Complete contact info
    if (cvData.personalInfo) {
      const info = cvData.personalInfo;
      if (info.phone) score += 10;
      if (info.location) score += 10;
    }

    return score;
  }

  /**
   * Experience relevance: Has meaningful work experience
   * - Has experience entries: 60 points
   * - Experience descriptions: 40 points
   */
  private calculateExperienceScore(cvData: CVData): number {
    let score = 0;

    if (cvData.experiences && cvData.experiences.length > 0) {
      score += 60;

      // Check if experiences have descriptions
      const hasDescriptions = cvData.experiences.some(
        (exp: any) => exp.description && exp.description.length > 20
      );
      if (hasDescriptions) {
        score += 40;
      }
    } else if (cvData.projects && cvData.projects.length > 0) {
      // Projects can substitute for experience for fresh graduates
      score += 40;
    }

    return score;
  }
}
