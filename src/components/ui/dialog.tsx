/**
 * Radix Dialog — replaces all inline fixed-position modal divs.
 * Exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter.
 */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from './icons'
import { cn } from '../../lib/utils'

export const Dialog        = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose   = DialogPrimitive.Close

// ─── Overlay ─────────────────────────────────────────────────────────────────
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/55',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

// ─── Content ─────────────────────────────────────────────────────────────────
export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-[380px] max-w-[90vw]',
          'border border-border bg-card rounded-queai p-7',
          'shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:-translate-x-1/2 data-[state=closed]:-translate-y-1/2',
          'data-[state=open]:-translate-x-1/2 data-[state=open]:-translate-y-1/2',
          'focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-text-dim opacity-50 hover:opacity-100 hover:text-text transition-opacity focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// ─── Header / Footer / Title ──────────────────────────────────────────────────
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-5', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-2 mt-4', className)} {...props} />
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-[16px] font-semibold text-text tracking-[-0.3px]', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-[13px] text-text-dim mt-1', className)}
      {...props}
    />
  )
}
