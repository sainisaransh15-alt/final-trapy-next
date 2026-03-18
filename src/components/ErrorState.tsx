import { AlertCircle, RefreshCw, WifiOff, ServerOff, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'default' | 'network' | 'server' | 'notFound';
  className?: string;
}

const errorConfig = {
  default: {
    icon: AlertCircle,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    title: 'Connection issue',
    message: 'Please check your internet connection and try again.',
  },
  server: {
    icon: ServerOff,
    title: 'Server error',
    message: 'Our servers are having issues. Please try again later.',
  },
  notFound: {
    icon: FileWarning,
    title: 'Not found',
    message: 'The resource you\'re looking for doesn\'t exist.',
  },
};

export function ErrorState({ 
  title, 
  message, 
  onRetry, 
  type = 'default',
  className = '' 
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message || config.message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

// Inline error for cards/sections
export function InlineError({ 
  message = 'Failed to load', 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">{message}</p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
