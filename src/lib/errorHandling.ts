import { toast } from '@/hooks/use-toast';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, onRetry } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

const extractMessage = (error: unknown, fallback?: string) => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMsg = (error as { message?: unknown }).message;
    if (typeof maybeMsg === 'string') return maybeMsg;
  }
  return fallback || 'An unexpected error occurred';
};

export function handleError(error: unknown, customMessage?: string) {
  const message = extractMessage(error, customMessage);
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });

  // Still log to console for debugging
  console.error('Error:', error);
}

export function handleSuccess(title: string, description?: string) {
  toast({
    title,
    description,
  });
}

export function isNetworkError(error: unknown): boolean {
  const message = extractMessage(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    !navigator.onLine
  );
}

export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return extractMessage(error);
}
