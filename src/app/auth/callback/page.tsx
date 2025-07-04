"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirebaseAuth } from "@/lib/config/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, CheckCircle } from "lucide-react";

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Callback page loaded, processing authentication...');
        console.log('Current URL:', window.location.href);
        
        // Try to get session with retry logic for OAuth
        let session = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!session && attempts < maxAttempts) {
          try {
            const auth = await getFirebaseAuth();
            const user = auth.currentUser;
            
            if (user) {
              session = { user };
              console.log('Session found on attempt', attempts + 1, 'for user:', user.email);
              break;
            }
          } catch (error: any) {
            console.error('Auth callback error:', error);
            setError(error.message);
            setStatus('error');
            return;
          }
          
          attempts++;
          console.log(`Attempt ${attempts}/${maxAttempts}: No session found, retrying...`);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Increase wait time to 500ms
          }
        }

        if (session?.user) {
          console.log('OAuth session established for user:', session.user.email);
          
          setStatus('success');
          
          // Get redirect destination from session storage or default to dashboard
          const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
          sessionStorage.removeItem('authRedirectTo'); // Clean up
          
          console.log('Redirecting to:', redirectTo);
          
          // Use router.push with a longer delay to ensure session is properly set
          setTimeout(() => {
            router.push(redirectTo);
            router.refresh(); // Force a refresh to ensure session state is updated
          }, 1000);
          
          // User record will be created automatically when session is fetched
          
        } else {
          console.error('No session found after OAuth callback after all attempts');
          setError('Authentication session could not be established. Please try signing in again.');
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Callback handling error:', err);
        setError(err.message || 'An unexpected error occurred');
        setStatus('error');
      }
    };

    // Check for error in URL params first
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      console.error('OAuth error in URL:', errorParam, errorDescription);
      setError(errorDescription || errorParam);
      setStatus('error');
      return;
    }

    // Add a small delay to ensure URL processing is complete
    const timer = setTimeout(() => {
      handleAuthCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <CardTitle>Completing Sign In</CardTitle>
            <CardDescription>Please wait while we sign you in...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loading size={32} />
            <p className="text-sm text-muted-foreground">
              This should only take a moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-600 dark:text-green-400">Sign In Successful!</CardTitle>
            <CardDescription>
              You have been successfully signed in. Taking you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-600 dark:text-red-400">Authentication Error</CardTitle>
          <CardDescription>
            {error || "An error occurred during authentication"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t worry, you can try signing in again.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/sign-in">
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Processing authentication...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loading size={32} />
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 