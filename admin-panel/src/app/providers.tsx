"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Providers({ children }: { children: React.ReactNode }) {
  // List of routes that should be public (not protected)
  const publicRoutes = ["/", "/login", "/signup"];
  const pathname = usePathname();
  const isProtected = !publicRoutes.includes(pathname);

  return isProtected ? <ProtectedRoute>{children}</ProtectedRoute> : <>{children}</>;
}
