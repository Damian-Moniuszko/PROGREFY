const API_URL = "http://localhost:3000";

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Wystąpił błąd profilu");
  }

  return data;
}

export interface UpdateAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
}

export function updateAccount(token: string, payload: UpdateAccountPayload) {
  return request("/api/me/account", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  token: string,
  payload: {
    currentPassword: string;
    newPassword: string;
  },
) {
  return request("/api/me/password", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadAvatar(token: string, formData: FormData) {
  return fetch(`${API_URL}/api/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then(async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Nie udało się przesłać zdjęcia");
    }

    return data;
  });
}
