// components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si ya terminó de cargar y no hay usuario, redirige a /login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Mientras se carga la información, puedes mostrar un spinner o simplemente retornar null
  if (loading) {
    return <div>Cargando...</div>;
  }

  return <>{children}</>;
}
