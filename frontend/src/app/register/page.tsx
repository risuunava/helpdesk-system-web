'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">HelpDesk</span>
          </div>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Daftar Akun</CardTitle>
            <CardDescription className="text-slate-400">
              Buat akun baru untuk menggunakan sistem
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-slate-300">Konfirmasi Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
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
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-slate-400">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
