const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private isOnlineCache: boolean | null = null;
  private lastCheckTime: number = 0;

  constructor(baseUrl: string = DEFAULT_BASE_URL, timeoutMs: number = 2500) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async isBackendLive(): Promise<boolean> {
    const now = Date.now();
    if (this.isOnlineCache !== null && now - this.lastCheckTime < 10000) {
      return this.isOnlineCache;
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      this.isOnlineCache = res.ok;
    } catch {
      this.isOnlineCache = false;
    }
    this.lastCheckTime = now;
    return this.isOnlineCache;
  }

  public async get<T>(endpoint: string): Promise<{ data: T | null; isLive: boolean }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.ok) {
        const json = await response.json();
        const payload = json.data !== undefined ? json.data : json;
        return { data: payload as T, isLive: true };
      }
      return { data: null, isLive: false };
    } catch (err) {
      return { data: null, isLive: false };
    }
  }

  public async post<T, R>(endpoint: string, body: T): Promise<{ data: R | null; isLive: boolean }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.ok) {
        const json = await response.json();
        const payload = json.data !== undefined ? json.data : json;
        return { data: payload as R, isLive: true };
      }
      return { data: null, isLive: false };
    } catch (err) {
      return { data: null, isLive: false };
    }
  }
}

export const apiClient = new ApiClient();
