/**
 * Radix-based Select — fully custom dropdown, immune to OS/browser style overrides.
 * Theming via QueAI CSS variables + Tailwind token classes.
 */
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from './icons'
import { cn } from '../../lib/utils'

// ─── Root re-exports ──────────────────────────────────────────────────────────
export const Select        = SelectPrimitive.Root
export const SelectGroup   = SelectPrimitive.Group
export const SelectValue   = SelectPrimitive.Value

// ─── Trigger ─────────────────────────────────────────────────────────────────
export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-sm',
        'border border-border bg-surface px-3 py-[7px]',
        'text-[13.5px] text-text font-sans',
        'hover:border-text-dim focus:border-text-dim focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[placeholder]:text-text-dim',
        'transition-colors',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-3.5 w-3.5 text-text-dim shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// ─── Content (dropdown panel) ────────────────────────────────────────────────
export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={4}
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-sm',
          'border border-border bg-card shadow-lg',
          // animations
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          // popper width match
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 w-[var(--radix-select-trigger-width)] max-h-60',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

// ─── Scroll buttons ───────────────────────────────────────────────────────────
export function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('flex cursor-default items-center justify-center py-1 text-text-dim', className)}
      {...props}
    >
      <ChevronUp className="h-3.5 w-3.5" />
    </SelectPrimitive.ScrollUpButton>
  )
}

export function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('flex cursor-default items-center justify-center py-1 text-text-dim', className)}
      {...props}
    >
      <ChevronDown className="h-3.5 w-3.5" />
    </SelectPrimitive.ScrollDownButton>
  )
}

// ─── Item ────────────────────────────────────────────────────────────────────
export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-[5px]',
        'py-1.5 pl-2 pr-8 text-[13px] text-text-muted font-sans',
        'outline-none transition-colors',
        'focus:bg-surface focus:text-text',
        'data-[state=checked]:text-text',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {/* Checkmark for selected item */}
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-accent" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

// ─── Separator ───────────────────────────────────────────────────────────────
export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border-subtle', className)}
      {...props}
    />
  )
}

// ─── Label ───────────────────────────────────────────────────────────────────
export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2 py-1.5 text-[11px] font-mono text-text-dim tracking-[0.06em] uppercase', className)}
      {...props}
    />
  )
}

// ─── Convenience: SimpleSelect ────────────────────────────────────────────────
/**
 * Drop-in replacement for StyledSelect.
 * Props: value, onValueChange, options [{value, label?}], disabled?, placeholder?
 */
interface SimpleOption { value: string; label?: string }

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SimpleOption[]
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function SimpleSelect({
  value,
  onValueChange,
  options,
  disabled,
  placeholder,
  className,
}: SimpleSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? 'Seleccionar…'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label ?? opt.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
