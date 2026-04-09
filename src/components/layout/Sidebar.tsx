"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Wallet, Bell, User, FileCheck } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/kyc', label: 'KYC Verification', icon: FileCheck },
    { href: '/jobs', label: 'Assigned Jobs', icon: Briefcase },
    { href: '/payments', label: 'Payments', icon: Wallet },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-72 max-w-[85vw] h-screen bg-espresso text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/[0.05]">
            <h1 className="text-2xl font-bold text-gold tracking-wide">Leddar</h1>
            <p className="text-sm text-white/70 mt-1">Artisan Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-leather text-white shadow-lg shadow-black/20'
                      : 'text-white/80 hover:bg-white/[0.12] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 bg-white/[0.04]">
            <p className="text-xs text-white/60">© 2026 Leddar Platform</p>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
