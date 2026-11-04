import type { WorkspaceSnapshot } from '../types/workspace';

const API = 'http://localhost:5080';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function report(scope: string, message: string) {
  void fetch(`${API}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, message })
  }).catch(() => undefined);
}

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch {
    const message = 'The API is not running. Start it with npm run dev, then try again.';
    report('network', `${options.method ?? 'GET'} ${path} failed: API unreachable`);
    throw new ApiError(message);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? `The API returned ${response.status}.`;
    report(path, `${response.status} ${message}`);
    throw new ApiError(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const key = (app: 'employer' | 'employee') => `mzansi.${app}.token`;

export function saveToken(app: 'employer' | 'employee', token: string) {
  sessionStorage.setItem(key(app), token);
}

export function readToken(app: 'employer' | 'employee') {
  return sessionStorage.getItem(key(app));
}

export function clearToken(app: 'employer' | 'employee') {
  sessionStorage.removeItem(key(app));
}

export function openWorkspace(token: string) {
  return api<WorkspaceSnapshot>('/api/workspace', { token });
}
