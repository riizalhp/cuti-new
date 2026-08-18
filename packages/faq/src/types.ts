/**
 * Shared types for the Employr FAQ knowledge base.
 */

export interface FaqCategory {
  slug: string;
  label: string;
  description: string;
  icon?: string;
}

export interface FaqArticle {
  /** URL-safe unique id (also used as file name) */
  slug: string;
  title: string;
  description: string;
  /** category slug, see FAQ_CATEGORIES */
  category: string;
  /** sort order inside the category */
  order: number;
  /** ISO date, e.g. 2026-08-18 */
  updatedAt: string;
  /** extra search keywords (comma separated in frontmatter) */
  keywords: string[];
  /** raw markdown body */
  body: string;
}

export interface SearchHit {
  article: FaqArticle;
  /** cosine similarity score 0..1 */
  score: number;
  /** plain-text snippet around the query */
  snippet: string;
}

export interface FaqSearchResult {
  query: string;
  hits: SearchHit[];
  /** true when at least one hit passed the relevance threshold */
  answered: boolean;
  /** headline text for the best hit (chat friendly) */
  answerText: string;
  /** related article titles the user may also want to read */
  suggestions: string[];
}
