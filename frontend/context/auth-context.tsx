"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, UserResponse } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = sessionStorage.getItem("access_token");
      if (accessToken) {
        try {
          // Since getMe isn't implemented in the backend yet,
          // we'll temporarily parse user info from JWT claims,
          // or load it from sessionStorage if we saved it on login.
          const storedUser = sessionStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // If none stored, logout
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await api.login(email, password);
      sessionStorage.setItem("access_token", tokens.access_token);
      sessionStorage.setItem("refresh_token", tokens.refresh_token);
      
      // Store in cookies for middleware route protection
      document.cookie = `access_token=${tokens.access_token}; path=/; max-age=1800; SameSite=Lax`;
      
      const userDetails = await api.getMe();
      
      sessionStorage.setItem("user", JSON.stringify(userDetails));
      setUser(userDetails);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await api.register(name, email, password, role || "Fleet Manager");
      await login(email, password, role);
    } catch (err: any) {
      setError(err.message || "Failed to register account");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    // Clear cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
