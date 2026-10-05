const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface Envelope<T> {
  message?: string;
  payload: T;
  page?: number;
  limit?: number;
  total?: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  authenticated?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

export class NetworkError extends ApiError {
  constructor() {
    super(0, 'Sin conexión a internet');
  }
}

type NetworkListener = (reachable: boolean) => void;

const networkListeners = new Set<NetworkListener>();

export const networkEvents = {
  subscribe: (listener: NetworkListener) => {
    networkListeners.add(listener);
    return () => {
      networkListeners.delete(listener);
    };
  },
  emit: (reachable: boolean) => networkListeners.forEach((listener) => listener(reachable)),
};

const guardedFetch = async (input: string, init: RequestInit) => {
  try {
    const response = await fetch(input, init);
    networkEvents.emit(true);
    return response;
  } catch {
    networkEvents.emit(false);
    throw new NetworkError();
  }
};

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export const tokenStore = {
  set: (token: string | null) => {
    accessToken = token;
  },
  get: () => accessToken,
};

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
};

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = guardedFetch(buildUrl('/auth/refresh'), { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as Envelope<{ accessToken: string }>;
        accessToken = data.payload.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token && options.authenticated !== false) headers.Authorization = `Bearer ${token}`;

  return guardedFetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

async function execute(path: string, options: RequestOptions): Promise<Response> {
  let response = await send(path, options, accessToken);

  if (response.status === 401 && options.authenticated !== false) {
    const renewed = await refreshAccessToken();
    if (renewed) response = await send(path, options, renewed);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new ApiError(response.status, error.message ?? 'Error inesperado', error.details);
  }

  return response;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const response = await execute(path, options);
  return (await response.json()) as Envelope<T>;
}

export async function apiDownload(path: string, query?: RequestOptions['query']): Promise<Blob> {
  const response = await execute(path, { query });
  return response.blob();
}

export const refreshSession = refreshAccessToken;

export const healthUrl = new URL('/health', API_URL).toString();
