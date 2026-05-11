"use client";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice"; // Adjusted path to match store/ folder
import MainLayout from "./MainLayout";

export default function AppShell({ children }) {
  const dispatch = useDispatch();

  // Accessing auth state from Redux
  const { user } = useSelector((state) => state.auth);

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
