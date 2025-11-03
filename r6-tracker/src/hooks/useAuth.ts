'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useNextAuthSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session,
  };
}
