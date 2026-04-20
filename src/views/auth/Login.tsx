"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux"; // Updated
import { login, resetAuth } from "../../redux/slices/authSlice"; // Updated
import { RootState, AppDispatch } from "../../redux/store"; // Updated
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { LogIn } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get auth state from Redux
  const {
    user,
    loading,
    error: serverError,
  } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // Redirect on successful login
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Clean up errors when unmounting or starting fresh
  useEffect(() => {
    return () => {
      dispatch(resetAuth());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    // Dispatch the Redux thunk
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 sm:p-4 backdrop-blur-sm">
        <div className="text-center mb-7">
          <Image
            src="/leddar-logo.svg"
            alt="Leddar"
            width={180}
            height={56}
            className="mx-auto mb-2 h-14 w-auto"
            priority
          />
          <p className="text-surface-200">Artisan Dashboard</p>
        </div>

        <div className="bg-cream rounded-2xl border border-surface-500 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="text-leather" size={28} />
            <h2 className="text-2xl font-bold text-ink">Welcome Back</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {(localError || serverError) && (
              <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
                {localError || serverError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <Link
              href="/forgot-password"
              className="text-sm text-leather hover:text-espresso font-medium"
            >
              Forgot your password?
            </Link>

            <div className="pt-4 border-t border-surface-500 text-center">
              <span className="text-neutral-800">Don't have an account? </span>
              <Link
                href="/signup"
                className="text-leather hover:text-espresso font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
