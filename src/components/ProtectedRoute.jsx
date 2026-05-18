"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const token = useSelector((state) => state.auth.token);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Fall back to localStorage in case the Redux store was wiped on refresh
    const storedToken = token || localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [token, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-atmosphere flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-leather" />
      </div>
    );
  }

  return children;
}
