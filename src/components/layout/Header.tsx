"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export default function Header({
  userName,
  onLogout,
  onMenuToggle,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.push("/login");
  };

  return (
    <header className="z-20 border-b border-surface-400/80 bg-white/75 backdrop-blur-md">
      <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-start gap-3 sm:gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2.5 bg-espresso text-white rounded-xl border border-white/10 flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-xl font-semibold text-ink leading-tight">
              Welcome back, {userName}
            </h2>
            <p className="text-[11px] sm:text-sm text-neutral-700 leading-snug hidden sm:block">
              Manage your jobs and track your earnings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-neutral-900 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
