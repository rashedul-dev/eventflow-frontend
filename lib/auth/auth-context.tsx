"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { authApi, setTokens, clearTokens, getAccessToken } from "@/lib/api";

// Auth state interface
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  clearError: () => void;
}

// Register data interface
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      // Set cookie with token for middleware to read
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      // Clear cookie
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Helper to update state
  const updateState = (updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Fetch current user
  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAuthCookie(null);
      updateState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.data) {
        setAuthCookie(token);
        updateState({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      clearTokens();
      setAuthCookie(null);
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // // Login
  // const login = async (email: string, password: string) => {
  //   updateState({ isLoading: true, error: null })
  //   try {
  //     const response = await authApi.login({ email, password })
  //     if (response.data) {
  //       setTokens(response.data.accessToken, response.data.refreshToken)
  //       setAuthCookie(response.data.accessToken)
  //       updateState({
  //         user: response.data.user,
  //         isAuthenticated: true,
  //         isLoading: false,
  //         error: null,
  //       })
  //     }
  //   } catch (error: any) {
  //     updateState({
  //       isLoading: false,
  //       error: error.message || "Login failed",
  //     })
  //     throw error
  //   }
  // }

  // In auth-context.tsx, update the login function:
  const login = async (email: string, password: string) => {
    updateState({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      if (response.data) {
        // FIX: Access tokens from nested structure
        const { tokens, user } = response.data;

        setTokens(tokens.accessToken, tokens.refreshToken);
        setAuthCookie(tokens.accessToken);
        updateState({
          user: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Login failed",
      });
      throw error;
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.register(data);
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Registration failed",
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    updateState({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with local logout even if API fails
    } finally {
      clearTokens();
      setAuthCookie(null);
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push("/login");
    }
  };

  // Logout all devices
  const logoutAll = async () => {
    updateState({ isLoading: true });
    try {
      await authApi.logoutAll();
    } catch (error) {
      // Continue with local logout even if API fails
    } finally {
      clearTokens();
      setAuthCookie(null);
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push("/login");
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.forgotPassword(email);
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Failed to send reset email",
      });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.resetPassword({ token, password });
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Failed to reset password",
      });
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Failed to change password",
      });
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token: string) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.verifyEmail(token);
      // Refresh user to get updated verification status
      await refreshUser();
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Failed to verify email",
      });
      throw error;
    }
  };

  // Resend verification email
  const resendVerification = async (email: string) => {
    updateState({ isLoading: true, error: null });
    try {
      await authApi.resendVerification(email);
      updateState({ isLoading: false });
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || "Failed to resend verification email",
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    updateState({ error: null });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    logoutAll,
    refreshUser,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerification,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export context for testing
export { AuthContext };
