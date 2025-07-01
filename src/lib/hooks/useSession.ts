import { useAuthContext } from '@/components/session-provider';

// Export the auth context for compatibility with existing code
export const useSession = useAuthContext; 