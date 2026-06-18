import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);

  // Prototype convenience: if no user exists after hydration, seed a demo
  // supervisor so users hitting any deep link without logging in still see the
  // dashboard. Real auth gating lives in src/store/auth.ts and login route.
  useEffect(() => {
    if (!user) {
      void login("supervisor@site.local", "demo");
    }
  }, [user, login]);

  return <Outlet />;
}
