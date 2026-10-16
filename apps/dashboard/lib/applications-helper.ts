import { ApplicationStatus } from '@employr/db';

export function mapDbToUiStatus(status: ApplicationStatus, displayStatus?: string): 'Tersimpan' | 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak' {
  if (displayStatus && ['Tersimpan', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak'].includes(displayStatus)) {
    return displayStatus as any;
  }
  if (displayStatus === 'WISHLIST') {
    return 'Tersimpan';
  }
  switch (status) {
    case ApplicationStatus.APPLIED:
      return 'Terkirim';
    case ApplicationStatus.INTERVIEW:
      return 'Interview';
    case ApplicationStatus.OFFERING:
      return 'Offering';
    case ApplicationStatus.REJECTED:
      return 'Ditolak';
    case ApplicationStatus.ACCEPTED:
      return 'Offering';
    default:
      return 'Terkirim';
  }
}

export function mapUiToDbStatus(uiStatus: string): ApplicationStatus {
  switch (uiStatus) {
    case 'Tersimpan':
    case 'WISHLIST':
    case 'Screening':
    case 'Terkirim':
      return ApplicationStatus.APPLIED;
    case 'Interview':
      return ApplicationStatus.INTERVIEW;
    case 'Offering':
      return ApplicationStatus.OFFERING;
    case 'Ditolak':
      return ApplicationStatus.REJECTED;
    case 'Diterima':
      return ApplicationStatus.ACCEPTED;
    default:
      return ApplicationStatus.APPLIED;
  }
}
