import { Config, ListParams, APIError } from './types.js';

export class Client {
  private baseURL: string;
  private token: string;
  private timeout: number = 60_000;

  constructor(config: Config) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  private buildURL(path: string, params?: URLSearchParams): string {
    const url = this.baseURL + path;
    if (params && params.toString()) {
      return url + '?' + params.toString();
    }
    return url;
  }

  async get<T>(path: string, params?: URLSearchParams): Promise<T> {
    const url = this.buildURL(path, params);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      const body = await response.text();

      if (response.status < 200 || response.status >= 300) {
        throw new APIError(response.status, body);
      }

      return JSON.parse(body) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getText(path: string, params?: URLSearchParams): Promise<string> {
    const url = this.buildURL(path, params);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'text/plain',
        },
        signal: controller.signal,
      });

      const body = await response.text();

      if (response.status < 200 || response.status >= 300) {
        throw new APIError(response.status, body);
      }

      return body;
    } finally {
      clearTimeout(timeout);
    }
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseURL + path, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const responseBody = await response.text();

      if (response.status < 200 || response.status >= 300) {
        throw new APIError(response.status, responseBody);
      }

      return responseBody ? (JSON.parse(responseBody) as T) : ({} as T);
    } finally {
      clearTimeout(timeout);
    }
  }

  static paramsToValues(params: ListParams): URLSearchParams {
    const values = new URLSearchParams();

    if (params.search) {
      values.set('search', params.search);
    }
    if (params.status) {
      values.set('status', params.status);
    }
    if (params.page && params.page > 0) {
      values.set('page', String(params.page));
    }
    if (params.pageSize && params.pageSize > 0) {
      values.set('page_size', String(params.pageSize));
    }
    if (params.orderBy) {
      values.set('order_by', params.orderBy);
    }
    if (params.extra) {
      for (const [k, v] of Object.entries(params.extra)) {
        values.append(k, String(v));
      }
    }

    return values;
  }
}
