"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/config/supabase";
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
        const maxAttempts = 5;
        
        while (!session && attempts < maxAttempts) {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            setError(error.message);
            setStatus('error');
            return;
          }
          
          if (currentSession?.user) {
            session = currentSession;
            break;
          }
          
          attempts++;
          console.log(`Attempt ${attempts}/${maxAttempts}: No session found, retrying...`);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between attempts
          }
        }

        if (session?.user) {
          console.log('OAuth session established for user:', session.user.email);
          
          setStatus('success');
          
          // Get redirect destination from session storage or default to dashboard
          const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
          sessionStorage.removeItem('authRedirectTo'); // Clean up
          
          console.log('Redirecting to:', redirectTo);
          
          // Immediate redirect - don't wait for user creation
          router.push(redirectTo);
          
          // Create user record in background (non-blocking)
          setTimeout(async () => {
            try {
              const response = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });

              if (!response.ok) {
                console.warn('Failed to create user record, but auth was successful');
              } else {
                console.log('User record created successfully');
              }
            } catch (userCreateError) {
              console.warn('Error creating user record:', userCreateError);
              // Don't fail the auth process if user creation fails
            }
          }, 500); // Small delay to ensure redirect happens first
          
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