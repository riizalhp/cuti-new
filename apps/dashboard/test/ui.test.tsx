import { axe } from 'jest-axe';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';
import { IconButton } from '@/components/ui/icon-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function DialogFixture() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button">Buka dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Dialog audit</DialogTitle>
        <DialogDescription>Dialog untuk pengujian fokus.</DialogDescription>
        <button type="button">Aksi</button>
      </DialogContent>
    </Dialog>
  );
}

describe('dashboard UI primitives', () => {
  it('keeps button label visible and exposes busy state while loading', () => {
    render(<Button loading>Simpan</Button>);
    const button = screen.getByRole('button', { name: 'Simpan' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveClass('h-[40px]');
  });

  it('requires an accessible name for icon buttons', () => {
    render(<IconButton label="Tutup panel"><span aria-hidden="true">×</span></IconButton>);
    expect(screen.getByRole('button', { name: 'Tutup panel' })).toHaveAttribute('title', 'Tutup panel');
  });

  it('connects fields to labels and errors', () => {
    render(
      <Field label="Email" error="Email wajib diisi">
        <Input type="email" />
      </Field>
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toMatch(/-error/);
    expect(screen.getByRole('alert')).toHaveTextContent('Email wajib diisi');
  });

  it('supports Radix tab semantics and arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Satu</TabsTrigger>
          <TabsTrigger value="two">Dua</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const first = screen.getByRole('tab', { name: 'Satu' });
    const second = screen.getByRole('tab', { name: 'Dua' });
    expect(first).toHaveAttribute('aria-selected', 'true');
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
  });

  it('restores focus to the trigger after a dialog closes', async () => {
    const user = userEvent.setup();
    render(<DialogFixture />);
    const trigger = screen.getByRole('button', { name: 'Buka dialog' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('has no axe violations for the dialog primitive', async () => {
    const { container } = render(<DialogFixture />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Buka dialog' })[0]);
    (expect(await axe(container)) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });
});
