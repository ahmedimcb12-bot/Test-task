import { useEffect, useState } from "react";
import { clearToken, getToken, setToken as persistToken } from "./api";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function login(token: string) {
  persistToken(token);
  notify();
}

export function logout() {
  clearToken();
  notify();
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  useEffect(() => {
    const update = () => setTokenState(getToken());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return { token, isAuthenticated: Boolean(token), login, logout };
}
