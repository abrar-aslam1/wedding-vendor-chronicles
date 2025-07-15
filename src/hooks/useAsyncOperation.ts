import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: {
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
    showErrorToast?: boolean;
    errorMessage?: string;
  } = {}
) {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
  });
  
  const { toast } = useToast();
  const { onSuccess, onError, showErrorToast = true, errorMessage = 'An error occurred' } = options;

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setState({ isLoading: true, error: null });
    
    try {
      const result = await operation(...args);
      setState({ isLoading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ isLoading: false, error: errorObj });
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      onError?.(errorObj);
      return null;
    }
  }, [operation, onSuccess, onError, showErrorToast, errorMessage, toast]);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}