'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Ticket, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(formData);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background decoration - Spotlight Cards acting as atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-800 to-blue-600 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-700 to-rose-500 blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Ticket className="h-5 w-5 text-on-primary" />
            </div>
            <span className="text-[24px] font-display font-medium tracking-[-0.01px] text-ink">HelpDesk</span>
          </div>
        </div>

        <div className="bg-surface-1 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_0.5px_0_rgba(255,255,255,0.08)] rounded-xl p-[32px]">
          <div className="mb-8 text-center">
            <h1 className="display-md text-ink mb-2">Masuk</h1>
            <p className="body text-ink-muted">
              Masukkan kredensial Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive-foreground body-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="caption text-ink-muted ml-1">Email</Label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="caption text-ink-muted ml-1">Password</Label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary h-[44px] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="body-sm text-ink-muted">
              Belum punya akun?{' '}
              <Link href="/register" className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
