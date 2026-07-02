"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, resendVerification, resetAuth } from "../../redux/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { LogIn, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error: serverError } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const RESEND_COOLDOWN_SECONDS = 10 * 60;
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    return () => { dispatch(resetAuth()); };
  }, [dispatch]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isUnverifiedError =
    typeof serverError === "string" && /verify your email/i.test(serverError);

  const handleResend = async () => {
    setResendStatus("sending");
    setResendMessage("");
    try {
      const message = await dispatch(resendVerification(email)).unwrap();
      setResendMessage(message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setResendMessage(err || "Failed to resend verification email.");
    } finally {
      setResendStatus("idle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please enter both your email and password");
      return;
    }

    const result = await dispatch(login({ email, password, role: "ARTISAN" }));
    if (login.fulfilled.match(result)) {
      router.push("/dashboard");
    }
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
          <p className="text-surface-200">Artisan Dashboard Access</p>
        </div>

        <div className="bg-cream rounded-2xl border border-surface-500 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="text-leather" size={28} />
            <h2 className="text-2xl font-bold text-ink">Welcome Back</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <div className="space-y-1">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-neutral-500 hover:text-leather transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-leather hover:text-espresso font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {(localError || serverError) && (
              <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in duration-300">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <span>
                    {localError ||
                      (typeof serverError === "string"
                        ? serverError
                        : "Invalid email or password")}
                  </span>
                  {isUnverifiedError && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus === "sending" || cooldown > 0}
                        className="text-xs font-bold text-leather underline hover:text-espresso transition disabled:opacity-50 disabled:no-underline"
                      >
                        {cooldown > 0
                          ? `Resend available in ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`
                          : resendStatus === "sending"
                          ? "Sending..."
                          : "Resend verification email"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resendMessage && (
              <div className="bg-surface-400 text-neutral-800 text-xs px-3 py-2 rounded-lg text-center font-medium">
                {resendMessage}
              </div>
            )}

            {/* <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button> */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-500 text-center">
            <p className="text-neutral-800 text-sm">
              Don't have an account yet?{" "}
              <Link
                href="/signup"
                className="text-leather hover:text-espresso font-bold underline-offset-4 hover:underline transition-all"
              >
                Join as an Artisan
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
