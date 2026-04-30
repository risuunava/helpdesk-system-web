'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  created_at?: string;
}

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengguna</h1>
        <p className="text-muted-foreground mt-1">Manajemen pengguna sistem</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengguna</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : data?.data?.length ?? '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                data?.data?.filter((u: UserData) => u.roles?.includes('admin')).length ?? '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agent</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                data?.data?.filter((u: UserData) => u.roles?.includes('agent')).length ?? '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data?.data?.length ? (
            <div className="divide-y">
              {data.data.map((user: UserData) => (
                <div key={user.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {user.roles?.map((role: string) => (
                      <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Tidak ada data pengguna. Fitur ini membutuhkan endpoint /api/users.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
