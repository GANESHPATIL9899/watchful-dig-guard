import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";
import { env } from "@/config/environment";
import { http } from "@/services/api/httpClient";

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
        if (!env.USE_MOCK) {
          try {
            const user = await http.post<AuthUser>("/auth/login", { email, password });
            set({ user });
            return user;
          } catch (err: any) {
            throw new Error(err.message || "Invalid email or password");
          }
        } else {
          await new Promise((r) => setTimeout(r, 400));
          const normalizedEmail = email.toLowerCase().trim();
          const storageKey = STORAGE_PREFIX + normalizedEmail;
          
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
        }
      },
      signup: async (email, password) => {
        const normalizedEmail = email.toLowerCase().trim();
        const authorizedDomains = ["site.local", "authorized.com", "safety.gov", "gmail.com", "yahoo.com", "outlook.com"];
        const domain = normalizedEmail.split("@")[1];
        if (!domain || !authorizedDomains.includes(domain)) {
          throw new Error("Unauthorized email domain. Registration restricted to authorized personnel only.");
        }

        if (!env.USE_MOCK) {
          try {
            await http.post<void>("/auth/signup", { email, password });
          } catch (err: any) {
            throw new Error(err.message || "Registration failed");
          }
        } else {
          await new Promise((r) => setTimeout(r, 400));
          const storageKey = STORAGE_PREFIX + normalizedEmail;
          
          if (localStorage.getItem(storageKey) !== null) {
            throw new Error("Email already registered");
          }
          
          localStorage.setItem(storageKey, password);
        }
      },
      logout: () => set({ user: null }),
    }),
    { name: "ssh.auth" },
  ),
);
