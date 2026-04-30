'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Settings, User, Bell, Shield, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola preferensi akun Anda</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Profil</CardTitle>
              <CardDescription>Informasi akun Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input defaultValue={user?.name ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
              {user?.roles?.map((r) => (
                <Badge key={r} variant="secondary">{r}</Badge>
              )) ?? <Badge variant="secondary">user</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Tampilan</CardTitle>
              <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Tema</Label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="capitalize"
                >
                  {t === 'light' ? 'Terang' : t === 'dark' ? 'Gelap' : 'Sistem'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Notifikasi</CardTitle>
              <CardDescription>Kelola preferensi notifikasi</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notifikasi Tiket</p>
              <p className="text-xs text-muted-foreground">Terima notifikasi saat tiket diperbarui</p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Aktif' : 'Nonaktif'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* System info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base">Informasi Sistem</CardTitle>
              <CardDescription>Detail teknis aplikasi</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versi</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Backend</span>
            <span className="font-medium">Laravel 12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frontend</span>
            <span className="font-medium">Next.js 16</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">PostgreSQL (Supabase)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
