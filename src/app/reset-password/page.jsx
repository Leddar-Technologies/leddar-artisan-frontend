"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Lock, Loader2 } from "lucide-react";

/**
 * ResetPasswordContent handles the actual logic and UI.
 * It is separated so it can be wrapped in a Suspense boundary.
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${token}`,
        { password },
      );

      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.error ||
          "Failed to reset password. The link may be expired.",
      );
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-stone-600 mb-4">Invalid or missing reset token.</p>
          <Button onClick={() => router.push("/forgot-password")}>
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-amber-700" size={28} />
          <h2 className="text-2xl font-bold text-stone-900">New Password</h2>
        </div>

        {status === "success" ? (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200 text-sm text-left">
              Password reset successful! Redirecting to login...
            </div>
            <Loader2 className="animate-spin mx-auto text-green-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "error" && (
              <div className="bg-red-50 text-red-600 p-3 rounded border border-red-100 text-sm">
                {message}
              </div>
            )}

            <Input
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Main Page Export
 * Wraps the content in Suspense to satisfy Next.js build requirements.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
