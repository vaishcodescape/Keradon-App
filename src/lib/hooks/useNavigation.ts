import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface NavigationState {
  canGoBack: boolean;
  previousPath: string | null;
}

export function useNavigation() {
  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    canGoBack: false,
    previousPath: null,
  });

  // Track navigation history
  useEffect(() => {
    const handlePopState = () => {
      setNavigationState(prev => ({
        ...prev,
        canGoBack: window.history.length > 1,
      }));
    };

    // Set initial state
    setNavigationState({
      canGoBack: window.history.length > 1,
      previousPath: document.referrer ? new URL(document.referrer).pathname : null,
    });

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goBack = useCallback((fallbackPath?: string) => {
    if (navigationState.canGoBack && window.history.length > 1) {
      router.back();
    } else if (fallbackPath) {
      router.push(fallbackPath);
    } else {
      // Default fallback based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/projects/')) {
        router.push('/projects');
      } else if (currentPath.startsWith('/settings')) {
        router.push('/dashboard');
      } else if (currentPath.startsWith('/new_projects')) {
        router.push('/projects');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, navigationState.canGoBack]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const navigateWithReplace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  return {
    goBack,
    navigateTo,
    navigateWithReplace,
    canGoBack: navigationState.canGoBack,
    previousPath: navigationState.previousPath,
  };
} 