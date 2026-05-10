'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Ticket, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Gagal mendaftarkan akun');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background decoration - Spotlight Cards acting as atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-30">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-600 to-amber-500 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-800 to-blue-600 blur-[120px]" />
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
            <h1 className="display-md text-ink mb-2">Daftar Akun</h1>
            <p className="body text-ink-muted">
              Buat akun baru untuk menggunakan sistem
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
              <label htmlFor="name" className="caption text-ink-muted ml-1">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="caption text-ink-muted ml-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="caption text-ink-muted ml-1">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="caption text-ink-muted ml-1">Konfirmasi Password</label>
              <input
                id="password_confirmation"
                type="password"
                placeholder="Ulangi password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full input-framer placeholder:text-ink-muted/50"
                required
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
                  Mendaftarkan...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="body-sm text-ink-muted">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
