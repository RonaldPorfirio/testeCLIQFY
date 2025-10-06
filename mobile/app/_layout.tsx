import { Stack } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </QueryClientProvider>
  );
}
