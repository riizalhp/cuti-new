import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackerView } from '@/components/TrackerView';
import { trackerApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  trackerApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/components/DotLottiePlayer', () => ({
  DotLottiePlayer: () => <div data-testid="lottie-mock" />,
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('TrackerView error vs empty regression (Item 3 audit-008)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders error alert and hides empty state + zero stats on load failure', async () => {
    vi.mocked(trackerApi.getAll).mockRejectedValue(new Error('Gagal memuat daftar lamaran'));

    render(<TrackerView />);

    // Wait for load to finish and alert to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Alert and retry button must be present
    expect(screen.getByRole('alert')).toHaveTextContent(/gagal memuat daftar lamaran/i);
    expect(screen.getByRole('button', { name: /coba lagi/i })).toBeInTheDocument();

    // False empty state must NOT be rendered
    expect(screen.queryByText('Belum Ada Lamaran, Yuk Mulai!')).not.toBeInTheDocument();

    // False reminder banner must NOT be rendered
    expect(screen.queryByText(/belum ada lamaran yang dicatat di tracker/i)).not.toBeInTheDocument();

    // Stats must show dash "–" instead of false "0"
    const dashes = screen.getAllByText('–');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders genuine empty state when load succeeds with empty array', async () => {
    vi.mocked(trackerApi.getAll).mockResolvedValue([]);

    render(<TrackerView />);

    await waitFor(() => {
      expect(screen.getByText('Belum Ada Lamaran, Yuk Mulai!')).toBeInTheDocument();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Mulai dari Sini')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tambah lamaran pertama/i })).toBeInTheDocument();
  });

  it('updates card status to destination column when dragged and dropped', async () => {
    // Mock PointerEvent in JSDOM if undefined
    class MockPointerEvent extends MouseEvent {
      pointerType: string;
      pointerId: number;
      constructor(type: string, props: any = {}) {
        super(type, { bubbles: true, cancelable: true, ...props });
        this.pointerType = props.pointerType || 'mouse';
        this.pointerId = props.pointerId || 1;
      }
    }
    // @ts-ignore
    global.PointerEvent = MockPointerEvent;
    // @ts-ignore
    window.PointerEvent = MockPointerEvent;

    const mockApp = {
      id: 'app-drag-1',
      company: 'Bukalapak',
      position: 'Frontend Engineer',
      location: 'Jakarta',
      appliedDate: '10 Oktober 2026',
      status: 'Terkirim' as const,
      salary: 'Rp 12.000.000',
      notes: '',
      portal: 'LinkedIn',
    };
    vi.mocked(trackerApi.getAll).mockResolvedValue([mockApp]);
    vi.mocked(trackerApi.updateStatus).mockResolvedValue({ id: 'app-drag-1', status: 'Screening' });

    render(<TrackerView />);

    await waitFor(() => {
      expect(screen.getByText('Bukalapak')).toBeInTheDocument();
    });

    const card = screen.getByText('Bukalapak').closest('[role="button"]')!;

    const screeningCol = document.querySelector('[data-column-status="Screening"]');
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(screeningCol);

    try {
      card.dispatchEvent(new MockPointerEvent('pointerdown', { clientX: 100, clientY: 200, pointerType: 'mouse', button: 0 }));
      window.dispatchEvent(new MockPointerEvent('pointermove', { clientX: 400, clientY: 200, pointerType: 'mouse' }));
      window.dispatchEvent(new MockPointerEvent('pointerup', { clientX: 400, clientY: 200, pointerType: 'mouse' }));

      await waitFor(() => {
        expect(trackerApi.updateStatus).toHaveBeenCalledWith('app-drag-1', 'Screening');
      });
    } finally {
      document.elementFromPoint = originalElementFromPoint;
    }
  });
});

