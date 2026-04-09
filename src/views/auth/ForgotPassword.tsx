"use client";

import { useState } from 'react';
import Link from 'next/link';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-600 mb-2">Leddar</h1>
          <p className="text-stone-300">Artisan Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="text-stone-700" size={28} />
            <h2 className="text-2xl font-bold text-stone-900">Reset Password</h2>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-stone-600 text-sm mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <Input
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" fullWidth size="lg">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                Password reset instructions have been sent to {email}
              </div>
              <p className="text-stone-600 text-sm">
                Please check your email and follow the instructions to reset your password.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-stone-200">
            <Link
              href="/login"
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
