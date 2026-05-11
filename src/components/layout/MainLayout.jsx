"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children, userName, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          userName={userName}
          onLogout={onLogout}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto px-4 py-4 sm:py-6 lg:px-8 lg:py-8">
          <div className="page-shell p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
