import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { JobTitleSearchSelect } from '@/components/ui/JobTitleSearchSelect';

describe('JobTitleSearchSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with placeholder on desktop', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const handleChange = vi.fn();
    render(<JobTitleSearchSelect value="" onChange={handleChange} placeholder="Pilih posisi target" />);

    const input = screen.getByPlaceholderText('Pilih posisi target');
    expect(input).toBeInTheDocument();
  });

  it('filters and selects option on desktop', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const handleChange = vi.fn();
    render(<JobTitleSearchSelect value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Frontend' } });

    await waitFor(() => {
      expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
    });

    const option = screen.getByText(/Frontend Developer/i);
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('Frontend Developer');
  });

  it('renders mobile bottom sheet when matchMedia matches mobile', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const handleChange = vi.fn();
    render(<JobTitleSearchSelect value="" onChange={handleChange} />);

    // Click trigger box to open mobile bottom sheet
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    // Verify dialog with title and search input appears
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Pilih Posisi Pekerjaan' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ketik nama posisi (misal: Admin, Barista)...')).toBeInTheDocument();
    });

    // Test searching in sheet
    const sheetInput = screen.getByPlaceholderText('Ketik nama posisi (misal: Admin, Barista)...');
    fireEvent.change(sheetInput, { target: { value: 'Barista' } });

    // Look for button option with Barista
    await waitFor(() => {
      const options = screen.getAllByRole('button');
      const baristaOption = options.find((btn) => btn.textContent?.includes('Barista'));
      expect(baristaOption).toBeDefined();
    });

    const options = screen.getAllByRole('button');
    const baristaOption = options.find((btn) => btn.textContent?.includes('Barista'));
    if (baristaOption) {
      fireEvent.click(baristaOption);
      expect(handleChange).toHaveBeenCalledWith('Barista');
    }
  });
});
