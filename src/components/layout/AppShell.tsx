"use client";

import type { ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; 
import MainLayout from "./MainLayout";

export default function AppShell({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  const { user } = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <MainLayout
      userName={user?.fullName?.split(" ")[0] || "User"}
      onLogout={handleLogout}
    >
      {children}
    </MainLayout>
  );
}
