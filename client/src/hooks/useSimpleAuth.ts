import { useCallback, useEffect, useState } from "react";

export interface SimpleUser {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
}

export function useSimpleAuth() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status
  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem("jaqyn-user");
    const token = localStorage.getItem("jaqyn-auth-token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("jaqyn-user");
        localStorage.removeItem("jaqyn-auth-token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for storage changes (from other tabs or programmatic updates)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuth]);

  const logout = useCallback(async () => {
    localStorage.removeItem("jaqyn-user");
    localStorage.removeItem("jaqyn-auth-token");
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    checkAuth, // Expose checkAuth for manual refresh if needed
  };
}
