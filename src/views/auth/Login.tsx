"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-leather to-espresso flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#FFFFFF22] bg-[#FFFFFF12] p-3 sm:p-4 backdrop-blur-sm">
        <div className="text-center mb-7">
          <h1 className="text-4xl font-bold text-gold mb-2">Leddar</h1>
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
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="bg-danger/10 text-danger border border-danger/30 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg">
              Sign In
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

        <div className="mt-5 text-center text-surface-300 text-sm">
          <p>Demo credentials: Any email and password will work</p>
        </div>
      </div>
    </div>
  );
}
