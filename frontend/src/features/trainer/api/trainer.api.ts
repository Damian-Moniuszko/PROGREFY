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
    throw new Error(data?.message || "Wystąpił błąd trenera");
  }

  return data;
}

export function getTrainerProfile(token: string, trainerId?: string) {
  return request(`/api/trainers${trainerId ? `/${trainerId}` : "/me"}`, token);
}

export function getClients(token: string) {
  return request("/api/trainers/me/clients", token);
}

export function getClientDetails(token: string, clientId: string) {
  return request(`/api/trainers/me/clients/${clientId}`, token);
}

export function createTrainingPlan(token: string, clientId: string, payload: unknown) {
  return request(`/api/trainers/me/clients/${clientId}/training-plan`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTrainingPlan(token: string, clientId: string, payload: unknown) {
  return request(`/api/trainers/me/clients/${clientId}/training-plan`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getTrainerCalendar(token: string) {
  return request("/api/trainers/me/calendar", token);
}

export function getEarnings(token: string) {
  return request("/api/trainers/me/earnings", token);
}
