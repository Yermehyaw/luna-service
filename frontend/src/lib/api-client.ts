export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getWsUrl(): string {
    return this.baseUrl.replace(/^http/, 'ws');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, token, headers, ...restOptions } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        headers: { ...defaultHeaders, ...headers },
        ...restOptions,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detailMsg = errorData.detail 
          ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
          : (errorData.message || `API Request failed with status ${response.status}`);
        throw new Error(detailMsg);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.warn(`[ApiClient] Request fallback mode active for ${endpoint}:`, error.message);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

