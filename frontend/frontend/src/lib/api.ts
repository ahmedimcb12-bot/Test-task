// Thin typed API client for the FastAPI backend.
// Auth: POST /auth/send-otp -> { string }
//       POST /auth/verify-otp -> { message, "X-OTP-Token" }
// All /rows and /orgdata calls require header X-OTP-Token.

const TOKEN_KEY = "otp_token";

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["X-OTP-Token"] = token;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
  } catch (err) {
    throw new ApiError(
      `Network error contacting ${API_BASE}. Is the backend running?`,
      0,
    );
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const d = (data ?? {}) as { detail?: unknown; message?: unknown };
    const detail = d.detail ?? d.message ?? res.statusText ?? "Request failed";
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), res.status);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------- Types ----------
export interface SendOtpResponse {
  string: string;
}
export interface VerifyOtpResponse {
  message: string;
  "X-OTP-Token": string;
}

export interface OrganizationData {
  id: number;
  organization_id: number;
  field_1: string;
  field_2: string;
  field_3: string;
}

export interface Transference {
  id: number;
  sender_org_id: number;
  receiver_org_id: number;
  message: string;
  transferred_at: string; // ISO datetime
}

// ---------- Auth ----------
export const authApi = {
  sendOtp: (email: string) =>
    request<SendOtpResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyOtp: (otp: string) =>
    request<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),
};

// ---------- Org data ----------
export const orgDataApi = {
  getAll: (organizationId: number) =>
    request<OrganizationData[]>(`/orgdata/get_all_data/${organizationId}`, {
      auth: true,
    }),
  add: (payload: OrganizationData) =>
    request<OrganizationData>("/orgdata/Add_Data", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  update: (recordId: number, payload: OrganizationData) =>
    request<{ message: string; updated_record: OrganizationData }>(
      `/orgdata/update-data/${recordId}`,
      { method: "PUT", auth: true, body: JSON.stringify(payload) },
    ),
  remove: (recordId: number) =>
    request<{ status: string; message: string }>(
      `/orgdata/delete-data/${recordId}`,
      { method: "DELETE", auth: true },
    ),
};

// ---------- Rows / Transfers ----------
export const rowsApi = {
  list: () => request<Transference[]>("/rows/read-record", { auth: true }),
  add: (payload: Transference) =>
    request<{ message: string; data: Transference }>("/rows/add-record", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
  remove: (recordId: number) =>
    request<{ status: string; message: string }>(
      `/rows/delete-record/${recordId}`,
      { method: "DELETE", auth: true },
    ),
};
