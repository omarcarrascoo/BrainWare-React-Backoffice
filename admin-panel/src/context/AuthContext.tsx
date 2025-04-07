
// context/AuthContext.tsx
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface User {
  _id: string;
  username: string;
  companyCode: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  accessToken: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Recupera el usuario persistido al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al parsear el usuario de localStorage", error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("http://localhost:9090/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data: User = await res.json();

    // Solo se permite el login para admin o super admin
    if (data.isAdmin || data.isSuperAdmin) {
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      throw new Error("Unauthorized: Only admin or super admin can login");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
