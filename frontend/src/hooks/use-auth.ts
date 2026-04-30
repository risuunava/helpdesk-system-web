'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Normalize roles dari Spatie (bisa array of objects atau array of strings)
function normalizeUser(raw: Record<string, unknown>): User {
  const roles = Array.isArray(raw.roles)
    ? raw.roles.map((r: unknown) =>
        typeof r === 'string' ? r : (r as { name: string }).name
      )
    : [];

  return {
    id: raw.id as number,
    name: raw.name as string,
    email: raw.email as string,
    roles,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore user dari localStorage saat pertama load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id && parsed?.email) {
          setUser(parsed);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { data } = await api.post('/login', credentials);
    const token = data.token as string;

    // Simpan token
    localStorage.setItem('auth_token', token);

    // User sudah ada di response login (dari AuthController)
    const userData = normalizeUser(data.user);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);

    // Redirect ke dashboard
    router.push('/dashboard');

    return data;
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await api.post('/register', registerData);
    const token = data.token as string;

    localStorage.setItem('auth_token', token);

    const userData = normalizeUser(data.user);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);

    // Redirect ke dashboard
    router.push('/dashboard');

    return data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Token mungkin sudah invalid
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !isLoading && !!user;
  const isAdmin = user?.roles?.includes('admin') ?? false;
  const isAgent = user?.roles?.includes('agent') ?? false;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isAgent,
    login,
    register,
    logout,
  };
}
