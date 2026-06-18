import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // After mount, localStorage-persisted auth is available.
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [hydrated, user, navigate]);

  // While we wait for hydration, render Outlet so the layout doesn't flash blank.
  return <Outlet />;
}
