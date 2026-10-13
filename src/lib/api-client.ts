import { apiUrl, healthUrl } from './env';
import type { Envelope, NetworkListener, RequestOptions } from '@/types/requests';

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
let sessionEpoch = 0;
let signedOut = false;

export const tokenStore = {
  set: (token: string | null) => {
    accessToken = token;
    if (token) signedOut = false;
  },
  get: () => accessToken,
  revoke: () => {
    sessionEpoch += 1;
    signedOut = true;
    accessToken = null;
    refreshing = null;
  },
};

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = new URL(`${apiUrl()}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
};

async function refreshAccessToken(): Promise<string | null> {
  if (signedOut) return null;
  if (!refreshing) {
    const epoch = sessionEpoch;
    refreshing = guardedFetch(buildUrl('/auth/refresh'), { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as Envelope<{ accessToken: string }>;
        if (epoch !== sessionEpoch) return null;
        accessToken = data.payload.accessToken;
        return accessToken;
      })
      .finally(() => {
        if (epoch === sessionEpoch) refreshing = null;
      });
  }
  return refreshing;
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined && !options.form) headers['Content-Type'] = 'application/json';
  if (token && options.authenticated !== false) headers.Authorization = `Bearer ${token}`;

  return guardedFetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
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

export { healthUrl };
