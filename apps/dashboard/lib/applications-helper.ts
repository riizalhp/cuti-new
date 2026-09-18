import { ApplicationStatus } from '@employr/db';

export function mapDbToUiStatus(status: ApplicationStatus, displayStatus?: string): 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak' {
  if (displayStatus && ['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak'].includes(displayStatus)) {
    return displayStatus as any;
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
