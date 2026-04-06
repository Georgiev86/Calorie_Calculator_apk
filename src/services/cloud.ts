import type { AuthPayload, CloudSyncPayload, Profile, ProgressEntry, Session } from "../types";

const backendUrl = process.env.EXPO_PUBLIC_AI_BACKEND_URL;

function buildUrl(path: string) {
  if (!backendUrl) {
    throw new Error("missing_backend_url");
  }

  return `${backendUrl}${path}`;
}

async function parseJson<T>(response: Response) {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `request_failed_${response.status}`);
  }

  return data;
}

export function hasCloudBackend() {
  return Boolean(backendUrl);
}

export async function registerWithCloud(payload: AuthPayload) {
  const response = await fetch(buildUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<Session>(response);
}

export async function loginWithCloud(payload: AuthPayload) {
  const response = await fetch(buildUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<Session>(response);
}

export async function fetchCloudData(token: string) {
  const response = await fetch(buildUrl("/api/cloud"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJson<{ profile: Profile | null; progress: ProgressEntry[] }>(response);
}

export async function syncCloudData(payload: CloudSyncPayload, token: string) {
  const response = await fetch(buildUrl("/api/cloud"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseJson<{ ok: true }>(response);
}
