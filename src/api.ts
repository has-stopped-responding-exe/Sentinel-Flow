export const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const getToken = () => localStorage.getItem("sf_token") || "";
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });
  if (response.status === 401) {
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_user");
    if (window.location.pathname !== "/login") {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    }
    throw new Error("Your session expired. Sign in again to continue.");
  }
  if (!response.ok) {
    const e = await response
      .json()
      .catch(() => ({ message: "Backend unavailable" }));
    throw new Error(e.message || "Request failed");
  }
  return response.json();
}
export async function login(email: string, password: string) {
  return api<{
    access_token: string;
    user: { name: string; email: string; role: string };
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function fmt(n: number) {
  return Intl.NumberFormat("en", {
    notation: n > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
}
export function oneDecimal(value: number) {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
export function percent(value: number) {
  return oneDecimal(value <= 1 ? value * 100 : value);
}
export function when(s: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(s));
}

export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][],
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
