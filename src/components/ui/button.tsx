import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans',
    'transition-colors focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary — accent red fill (Crear, Guardar main actions)
        default:
          'bg-accent text-white rounded-sm hover:opacity-90',
        // Secondary — transparent with border (Cancelar, secondary Guardar)
        outline:
          'border border-border bg-transparent text-text-muted rounded-sm hover:border-[#444] hover:text-text',
        // Tertiary — no border/bg (Borrar key, ↺ Reiniciar, ghost icon)
        ghost:
          'bg-transparent text-text-dim rounded-sm hover:text-text-muted',
        // Ghost that highlights in red on hover (delete icon buttons)
        danger:
          'bg-transparent text-text-dim rounded-sm hover:text-accent hover:bg-accent-soft',
        // Solid red — for delete confirmation in dialogs
        destructive:
          'bg-accent text-white rounded-sm hover:bg-[#c4130a] active:bg-[#a81009]',
      },
      size: {
        default: 'h-9 px-4 text-[13.5px] font-medium',
        sm:      'h-7 px-3 text-[12px]',
        lg:      'h-10 px-6 text-[14px] font-medium',
        icon:    'h-8 w-8 text-[14px]',
        // Stretch full-width in forms (flex: 1 parent)
        full:    'w-full py-[9px] text-[13.5px] font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
