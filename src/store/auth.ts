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
        // Mock authentication for prototype phase.
        await new Promise((r) => setTimeout(r, 400));
        const user: AuthUser = {
          id: "USR-001",
          name: email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()) || "Supervisor",
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
