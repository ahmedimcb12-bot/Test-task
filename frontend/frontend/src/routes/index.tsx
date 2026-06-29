import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { useHydrated } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Org Console" },
      { name: "description", content: "Secure dashboard for organization data and transfers." },
    ],
  }),
  component: Index,
});

function Index() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  if (!hydrated) return null;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
