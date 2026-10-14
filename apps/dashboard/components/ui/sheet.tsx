"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300 motion-reduce:animate-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-full max-w-md border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-lg",
        right:
          "inset-y-0 right-0 h-full w-full max-w-md border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-xl",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideCloseButton?: boolean;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      hideCloseButton = false,
      returnFocusRef,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref
  ) => {
    const focusOriginRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
      const rememberInteraction = (event: Event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const opener = target.closest<HTMLElement>('button, a, [role="button"], input, select, textarea');
        if (opener && !opener.closest('[role="dialog"], [data-radix-dialog-content]')) {
          focusOriginRef.current = opener;
        }
      };
      document.addEventListener('pointerdown', rememberInteraction, true);
      document.addEventListener('keydown', rememberInteraction, true);
      return () => {
        document.removeEventListener('pointerdown', rememberInteraction, true);
        document.removeEventListener('keydown', rememberInteraction, true);
      };
    }, []);

    return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        onOpenAutoFocus={(event) => {
          if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
            focusOriginRef.current = document.activeElement;
          }
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          const target = returnFocusRef?.current ?? focusOriginRef.current;
          if (target?.isConnected) {
            event.preventDefault();
            requestAnimationFrame(() => target.focus());
          }
        }}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Tutup drawer"
              size="sm"
              variant="ghost"
              className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="size-4" />
            </IconButton>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
    );
  }
);
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto p-5 sm:p-6", className)}
    {...props}
  />
);
SheetBody.displayName = "SheetBody";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 pr-8",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs sm:text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
