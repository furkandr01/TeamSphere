'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiMe } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me', accessToken],
    queryFn: () => apiMe(accessToken!),
    enabled: !!accessToken,
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Failed to load user info.</p>}

        {data && (
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Email:</span> {data.email}</p>
            <p><span className="font-medium">Role:</span> {data.role}</p>
          </div>
        )}

        <Button onClick={handleLogout} className="w-full">
          Log out
        </Button>
      </Card>
    </div>
  );
}
