import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_PREFIX = "watchful_dig_guard_user_";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400));
        const normalizedEmail = email.toLowerCase().trim();
        const storageKey = STORAGE_PREFIX + normalizedEmail;
        
        // Preload default supervisor account for prototype testing
        if (normalizedEmail === "supervisor@site.local" && localStorage.getItem(storageKey) === null) {
          localStorage.setItem(storageKey, "demo1234");
        }

        const storedPassword = localStorage.getItem(storageKey);
        
        if (storedPassword === null || storedPassword !== password) {
          throw new Error("Invalid email or password");
        }

        const namePart = normalizedEmail.split("@")[0] || "Supervisor";
        const user: AuthUser = {
          id: "USR-001",
          name: namePart.replace(/\b\w/g, (c) => c.toUpperCase()),
          email: normalizedEmail,
          role: "supervisor",
        };
        set({ user });
        return user;
      },
      signup: async (email, password) => {
        await new Promise((r) => setTimeout(r, 400));
        const normalizedEmail = email.toLowerCase().trim();
        const storageKey = STORAGE_PREFIX + normalizedEmail;
        
        if (localStorage.getItem(storageKey) !== null) {
          throw new Error("Email already registered");
        }
        
        localStorage.setItem(storageKey, password);
      },
      logout: () => set({ user: null }),
    }),
    { name: "ssh.auth" },
  ),
);
