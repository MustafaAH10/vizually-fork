import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = ({ className, size = 'md' }: LoadingProps) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 