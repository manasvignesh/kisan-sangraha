import { Platform } from "react-native";
// On web, use the native browser fetch (avoids Expo dev server interception).
// On native mobile, fall back to expo/fetch.
const nativeFetch = typeof globalThis.fetch !== "undefined" ? globalThis.fetch.bind(globalThis) : require("expo/fetch").fetch;
export const apiFetch = Platform.OS === "web" ? nativeFetch : nativeFetch;
import { QueryClient, QueryFunction } from "@tanstack/react-query";

export function getApiUrl(): string {
  // If we are running locally in Expo Dev mode, bypass the browser origin
  // so the frontend (8081) directly talks to the backend (5000).
  if (__DEV__) {
    return "http://localhost:5000";
  }

  // If we're executing in the browser (e.g. Vercel deployed web output)
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin;
  }

  // Fallback for native mobile or server-side renders if environment provides it
  let host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) {
    // Graceful fallback for local
    return "http://localhost:5000";
  }

  let url = new URL(`https://${host}`);
  return url.href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await apiFetch(url.toString(), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseUrl = getApiUrl();
      const url = new URL(queryKey.join("/") as string, baseUrl);

      const res = await apiFetch(url.toString(), {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
