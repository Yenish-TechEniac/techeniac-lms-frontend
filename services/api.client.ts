import { env } from '@/lib/config';
import { ApiError } from '@/lib/errors';

export { ApiError } from '@/lib/errors';

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

function buildRequestUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${env.NEXT_PUBLIC_API_BASE_URL}${normalizedPath}`;

  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}

function parseErrorPayload(response: Response, data: unknown): ApiError {
  const errData = data as ApiErrorResponse | null;
  const retryAfterHeader = response.headers.get('Retry-After');
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;

  // Never leak internal backend details or unhandled exceptions on 5xx responses
  if (response.status >= 500) {
    return new ApiError(
      response.status,
      'A server error occurred. Please try again later.',
      'SERVER_ERROR',
      undefined,
      retryAfter,
    );
  }

  let message =
    errData?.error?.message || errData?.message || response.statusText || 'An error occurred';

  if (response.status === 429 && retryAfter && !errData?.error?.message) {
    const minutes = Math.ceil(retryAfter / 60);
    message = `Too many requests. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
  }

  const code = errData?.error?.code || (response.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR');
  const details = errData?.error?.details;

  return new ApiError(response.status, message, code, details, retryAfter);
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: userSignal,
    ...customConfig
  } = options;

  const url = buildRequestUrl(endpoint, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  if (userSignal) {
    userSignal.addEventListener('abort', () => {
      controller.abort();
    });
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    signal: controller.signal,
    ...customConfig,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (fetchError) {
    if (controller.signal.aborted && !userSignal?.aborted) {
      throw new ApiError(408, 'Request timed out, please try again.', 'REQUEST_TIMEOUT');
    }
    if (fetchError instanceof ApiError) {
      throw fetchError;
    }
    throw new ApiError(
      0,
      'Unable to connect to server. Please check your internet connection.',
      'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw parseErrorPayload(response, data);
  }

  return data as T;
}
