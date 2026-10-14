import * as React from 'react';
import { axe } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function SheetWithTriggerFixture() {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <button type="button">Buka Sheet Drawer</button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Drawer Pengujian</SheetTitle>
            <SheetDescription>Deskripsi drawer pengujian fokus.</SheetDescription>
          </SheetHeader>
          <button type="button">Aksi di dalam Drawer</button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SheetWithControlledReturnRefFixture() {
  const [open, setOpen] = React.useState(false);
  const openerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
      >
        Buka Drawer Controlled
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" returnFocusRef={openerRef}>
          <SheetHeader>
            <SheetTitle>Drawer Controlled</SheetTitle>
            <SheetDescription>Pengujian returnFocusRef eksplisit.</SheetDescription>
          </SheetHeader>
          <button type="button" onClick={() => setOpen(false)}>
            Tutup Drawer Manual
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AlertDialogFixture() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button">Hapus Lamaran</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogDescription>Apakah kamu yakin ingin menghapus data ini?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction>Ya, Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe('overlay focus restoration & accessible semantics', () => {
  it('restores focus to SheetTrigger after Sheet is closed with Escape', async () => {
    const user = userEvent.setup();
    render(<SheetWithTriggerFixture />);

    const trigger = screen.getByRole('button', { name: 'Buka Sheet Drawer' });
    await user.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('restores focus to returnFocusRef when controlled Sheet is closed', async () => {
    const user = userEvent.setup();
    render(<SheetWithControlledReturnRefFixture />);

    const opener = screen.getByRole('button', { name: 'Buka Drawer Controlled' });
    await user.click(opener);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Tutup Drawer Manual' });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it('restores focus to trigger after AlertDialog cancellation', async () => {
    const user = userEvent.setup();
    render(<AlertDialogFixture />);

    const trigger = screen.getByRole('button', { name: 'Hapus Lamaran' });
    await user.click(trigger);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Batal' });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('passes axe accessibility checks for Sheet primitive', async () => {
    const { container } = render(<SheetWithTriggerFixture />);
    const trigger = screen.getByRole('button', { name: 'Buka Sheet Drawer' });
    await userEvent.click(trigger);

    (expect(await axe(container)) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });
});
