"use client";

import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import MainLayout from './MainLayout';

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, notifications, logout } = useApp();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <MainLayout
      userName={user?.fullName.split(' ')[0] || 'User'}
      unreadCount={unreadCount}
      onLogout={logout}
    >
      {children}
    </MainLayout>
  );
}