import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-sm border border-border bg-surface px-3 py-[7px]',
      'text-[13.5px] text-text font-sans',
      'placeholder:text-text-dim',
      'hover:border-text-dim focus:border-text-dim focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
