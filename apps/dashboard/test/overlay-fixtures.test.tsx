import * as React from 'react';
import { axe } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ApplicationItem } from '@/components/TrackerView';
import type { DynamicATSResult } from '@/lib/ats-score-types';
import { OfferingPreparationModal } from '@/components/OfferingPreparationModal';
import { InterviewScheduleModal } from '@/components/InterviewScheduleModal';
import { PostInterviewReviewModal } from '@/components/PostInterviewReviewModal';
import { CvHrdDialog } from '@/components/CvHrdModal';
import { ATSAnalysisDrawer } from '@/components/ats/ATSAnalysisDrawer';
import { BulletOptimizePopover } from '@/components/ai/BulletOptimizePopover';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const appFixture: ApplicationItem = {
  id: 'app-fixture-1',
  company: 'PT Maju Bersama',
  position: 'Staf Administrasi',
  location: 'Jakarta Selatan',
  appliedDate: '2026-09-20',
  status: 'Interview',
  salary: 'Rp5.000.000',
  notes: 'Catatan contoh lamaran.',
  portal: 'LinkedIn',
  interviewDate: '2026-10-01',
  interviewTime: '10:00',
  interviewTimezone: 'WIB',
  interviewChecklist: [],
  interviewResult: 'waiting',
  offeringChecklist: [],
};

const engine = (score: number) => ({ score, weight: 0.25, weightedScore: score * 0.25, issuesCount: 1 });

const atsFixture: DynamicATSResult = {
  totalScore: 62,
  state: 'fair',
  stateLabel: 'Cukup',
  stateDescription: 'CV kamu sudah cukup terbaca, masih ada ruang perbaikan.',
  potentialScore: 80,
  engines: {
    contentQuality: engine(60),
    atsReadability: engine(70),
    completeness: engine(55),
    contentIntegrity: engine(65),
  },
  issues: [
    {
      id: 'issue-1',
      category: 'contentQuality',
      severity: 'major',
      section: 'experience',
      message: 'Poin pengalaman belum punya angka terukur.',
      recommendation: 'Tambahkan metrik seperti persentase atau jumlah.',
      penalty: 8,
      potentialGain: 8,
    },
  ],
  penaltiesApplied: [],
  isEmptyOrDefault: false,
  calculatedAt: '2026-10-03T08:00:00.000Z',
};

type RenderOverlay = (open: boolean, onClose: () => void) => React.ReactNode;

interface OverlayCase {
  name: string;
  role: 'dialog' | 'alertdialog';
  accessibleName: RegExp;
  renderOverlay: RenderOverlay;
}

const noopAsync = async () => {};

const overlayCases: OverlayCase[] = [
  {
    name: 'Persiapan Offering (OfferingPreparationModal)',
    role: 'dialog',
    accessibleName: /offering/i,
    renderOverlay: (open, onClose) => (
      <OfferingPreparationModal
        isOpen={open}
        app={{ ...appFixture, status: 'Offering' }}
        onClose={onClose}
        onSave={vi.fn()}
      />
    ),
  },
  {
    name: 'Jadwal Interview (InterviewScheduleModal)',
    role: 'dialog',
    accessibleName: /interview/i,
    renderOverlay: (open, onClose) => (
      <InterviewScheduleModal
        isOpen={open}
        app={appFixture}
        onClose={onClose}
        onSave={vi.fn()}
        onIgnore={vi.fn()}
      />
    ),
  },
  {
    name: 'Review Pasca Interview (PostInterviewReviewModal)',
    role: 'dialog',
    accessibleName: /.+/,
    renderOverlay: (open, onClose) => (
      <PostInterviewReviewModal
        isOpen={open}
        app={appFixture}
        onClose={onClose}
        onUpdateStatus={noopAsync}
        onScheduleNextRound={noopAsync}
        onSaveNotesOnly={noopAsync}
      />
    ),
  },
  {
    name: 'CV Dibuatkan HRD (CvHrdDialog)',
    role: 'dialog',
    accessibleName: /cv dibuatkan oleh hrd/i,
    renderOverlay: (open, onClose) => (
      <CvHrdDialog isOpen={open} onClose={onClose} onSelectService={vi.fn()} />
    ),
  },
  {
    name: 'Editor CV: Analisis ATS (ATSAnalysisDrawer)',
    role: 'dialog',
    accessibleName: /ats/i,
    renderOverlay: (open, onClose) => (
      <ATSAnalysisDrawer isOpen={open} onClose={onClose} atsResult={atsFixture} onFixIssue={vi.fn()} />
    ),
  },
  {
    name: 'Editor CV: Optimasi Poin (BulletOptimizePopover)',
    role: 'dialog',
    accessibleName: /optimalkan poin/i,
    renderOverlay: (open, onClose) => (
      <BulletOptimizePopover
        isOpen={open}
        onClose={onClose}
        bulletText="Mengelola arsip dokumen kantor"
        onApplyRewrite={vi.fn()}
      />
    ),
  },
];

const OPENER_LABEL = 'Buka overlay fixture';

function OverlayHarness({
  renderOverlay,
  onCloseSpy,
}: {
  renderOverlay: RenderOverlay;
  onCloseSpy: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const handleClose = React.useCallback(() => {
    onCloseSpy();
    setOpen(false);
  }, [onCloseSpy]);

  return (
    <main>
      <button type="button" onClick={() => setOpen(true)}>
        {OPENER_LABEL}
      </button>
      {renderOverlay(open, handleClose)}
    </main>
  );
}

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

async function openOverlay(testCase: OverlayCase) {
  const user = userEvent.setup();
  const onCloseSpy = vi.fn();
  render(<OverlayHarness renderOverlay={testCase.renderOverlay} onCloseSpy={onCloseSpy} />);
  const opener = screen.getByRole('button', { name: OPENER_LABEL });
  await user.click(opener);
  const dialog = await screen.findByRole(testCase.role);
  return { user, onCloseSpy, opener, dialog };
}

describe.each(overlayCases)('overlay fixture: $name', (testCase) => {
  it('punya role dialog dengan accessible name', async () => {
    const { dialog } = await openOverlay(testCase);
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAccessibleName(testCase.accessibleName);
  });

  it('memindahkan fokus ke dalam overlay saat dibuka', async () => {
    const { dialog } = await openOverlay(testCase);
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it('menahan fokus Tab dan Shift+Tab di dalam overlay', async () => {
    const { user, dialog } = await openOverlay(testCase);
    const tabbableCount = dialog.querySelectorAll(TABBABLE_SELECTOR).length;
    expect(tabbableCount).toBeGreaterThan(0);

    for (let i = 0; i < tabbableCount + 2; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 3; i += 1) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('menutup overlay dengan Escape lalu mengembalikan fokus ke tombol pembuka', async () => {
    const { user, onCloseSpy, opener } = await openOverlay(testCase);
    await user.keyboard('{Escape}');

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole(testCase.role)).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it('lolos pemeriksaan axe', async () => {
    const { dialog } = await openOverlay(testCase);
    const results = await axe(dialog, { rules: { 'color-contrast': { enabled: false } } });
    (expect(results) as any).toHaveNoViolations();
  });
});
