export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      const message = (data && (data.error || data.message)) || '请求失败';
      throw new ApiError(message, response.status);
    }

    return data as T;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new ApiError('请求超时，请稍后重试', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
