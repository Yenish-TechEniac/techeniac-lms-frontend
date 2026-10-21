import { env } from '@/lib/config';

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;
  public readonly retryAfter?: number | undefined;

  constructor(
    status: number,
    message: string,
    code = 'REQUEST_ERROR',
    details?: unknown,
    retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${env.NEXT_PUBLIC_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
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
    ...customConfig,
  };

  const response = await fetch(url, config);

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
    const errData = data as ApiErrorResponse | null;
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    let message =
      errData?.error?.message || errData?.message || response.statusText || 'An error occurred';
    if (response.status === 429 && retryAfter && !errData?.error?.message) {
      const minutes = Math.ceil(retryAfter / 60);
      message = `Too many requests. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
    }

    const code = errData?.error?.code || (response.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR');
    const details = errData?.error?.details;
    throw new ApiError(response.status, message, code, details, retryAfter);
  }

  return data as T;
}
