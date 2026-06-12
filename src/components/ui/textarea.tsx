import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-sm border border-border bg-surface px-3 py-2',
      'text-[14px] text-text font-sans leading-[1.5]',
      'placeholder:text-text-dim',
      'hover:border-text-dim focus:border-text-dim focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'resize-none transition-colors',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
