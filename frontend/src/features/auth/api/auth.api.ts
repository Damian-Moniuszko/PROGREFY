const API_URL = "http://localhost:3000/api/auth";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Błąd autoryzacji");
  }

  return data;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "CLIENT" | "TRAINER";
}

export function login(payload: LoginPayload) {
  return request("/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return request("/register", {
    method: "POST",
    body: payload,
  });
}

export function googleLogin() {
  window.location.href = `${API_URL}/google`;
}

export function verifyEmail(token: string) {
  return request("/verify-email", {
    method: "POST",
    body: { token },
  });
}
