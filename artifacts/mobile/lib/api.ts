const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error ?? "Request failed", res.status);
  return data as T;
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function apiGet<T>(path: string, token: string) {
  return request<T>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiPut<T>(path: string, body: unknown, token: string) {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiDelete(path: string, token: string) {
  return request<{ success: boolean }>(path, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { ApiError };
