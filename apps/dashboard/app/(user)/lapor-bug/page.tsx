import type { Metadata } from 'next';
import { BugReportView } from '@/components/BugReportView';

export const metadata: Metadata = {
  title: 'Lapor Kendala & Bug',
  description:
    'Formulir pelaporan kendala teknis dan bug sistem Employr. Sampaikan masalah yang kamu temukan agar segera diperiksa dan diperbaiki tim pengembang.',
};

export default function LaporBugPage() {
  return <BugReportView />;
}
