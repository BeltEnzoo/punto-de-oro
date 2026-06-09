import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: 'default' | 'gold' | 'success' | 'warning' | 'destructive' }) {
  const variants = {
    default: 'bg-muted text-foreground',
    gold: 'bg-gold/20 text-gold-dark border border-gold/30',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
}
