const API_URL = "http://localhost:3000/api/training";

interface RequestOptions {
  token: string;
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Błąd API treningu");
  }

  return data;
}

export function getWorkout(id: string, token: string) {
  return request(`/workout/${id}`, { token });
}

export function startWorkout(workoutId: number, token: string) {
  return request("/session/start", {
    token,
    method: "POST",
    body: { workoutId },
  });
}

export function saveWorkoutSet(
  sessionId: number,
  payload: {
    exerciseId: number;
    setNumber: number;
    weight: number;
    reps: number;
  },
  token: string
) {
  return request(`/session/${sessionId}/set`, {
    token,
    method: "POST",
    body: payload,
  });
}

export function endWorkout(sessionId: number, token: string) {
  return request(`/session/${sessionId}/end`, {
    token,
    method: "PATCH",
  });
}
