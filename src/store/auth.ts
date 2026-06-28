import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email) => {
        // Mock authentication for prototype phase. All logins are treated as
        // supervisor sessions until the real auth backend is wired in.
        await new Promise((r) => setTimeout(r, 400));
        const namePart = email.split("@")[0] || "Supervisor";
        const user: AuthUser = {
          id: "USR-001",
          name: namePart.replace(/\b\w/g, (c) => c.toUpperCase()),
          email,
          role: "supervisor",
        };
        set({ user });
        return user;
      },
      logout: () => set({ user: null }),
    }),
    { name: "ssh.auth" },
  ),
);
