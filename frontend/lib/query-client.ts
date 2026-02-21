import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401 or 403 as they are likely auth issues
        if (error?.statusCode === 401 || error?.statusCode === 403) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
