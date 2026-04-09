"use client";

import type { ReactNode } from "react";
import { useApp } from "../../context/AppContext";
import MainLayout from "./MainLayout";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useApp();

  return (
    <MainLayout
      userName={user?.fullName.split(" ")[0] || "User"}
      onLogout={logout}
    >
      {children}
    </MainLayout>
  );
}
