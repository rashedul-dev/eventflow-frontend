"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ApiError } from "./client";

// Custom error handler for React Query
function handleQueryError(error: unknown) {
  const apiError = error as ApiError;

  // Don't show toast for 401 errors (handled by interceptor)
  if (apiError.status === 401) return;

  const message = apiError.message || "An unexpected error occurred";

  toast.error(message, {
    style: {
      background: "#0a0a0a",
      border: "1px solid #253900",
      color: "#EEEEEE",
    },
    className: "!bg-background !border-secondary/50",
  });
}

// Query client factory
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          // Don't retry on 4xx errors except 429
          if (apiError.status && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: handleQueryError,
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { getQueryClient };
