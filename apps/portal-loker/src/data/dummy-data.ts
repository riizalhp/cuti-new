// ============================================================================
// Deprecated: Seluruh data portal kini langsung bersumber dari PostgreSQL
// File ini dipertahankan hanya agar kompatibel jika ada import historis.
// ============================================================================

import type {
  PortalJob,
  PortalCertification,
  PortalCourse,
  PortalEvent,
  PortalArticle,
} from '../lib/data';

export const DUMMY_JOBS: PortalJob[] = [];
export const DUMMY_CERTIFICATIONS: PortalCertification[] = [];
export const DUMMY_COURSES: PortalCourse[] = [];
export const DUMMY_EVENTS: PortalEvent[] = [];
export const DUMMY_ARTICLES: PortalArticle[] = [];
