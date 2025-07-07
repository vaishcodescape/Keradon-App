"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FirebaseAuth } from "@/lib/auth/firebase-auth";
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
        console.log('URL search params:', window.location.search);
        
        // Handle redirect result from OAuth
        const { data: redirectResult, error: redirectError } = await FirebaseAuth.handleRedirectResult();
        
        if (redirectError) {
          console.error('Redirect result error:', redirectError);
          setError(redirectError);
          setStatus('error');
          return;
        }
        
        if (redirectResult) {
          console.log('OAuth redirect successful for user:', redirectResult.user.email);
          setStatus('success');
          
          // Double-check that the user is actually authenticated
          const auth = await getFirebaseAuth();
          console.log('Current auth user after redirect:', auth.currentUser?.email || 'No user');
          
          // Get redirect destination from session storage or default to dashboard
          const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
          sessionStorage.removeItem('authRedirectTo'); // Clean up
          
          console.log('Redirecting to:', redirectTo);
          
          // Redirect immediately - no delay needed
          try {
            router.push(redirectTo);
            router.refresh(); // Force a refresh to ensure session state is updated
          } catch (routerError) {
            console.warn('Router push failed, using window.location:', routerError);
            // Fallback to window.location if router fails
            window.location.href = redirectTo;
          }
          
          // Force redirect after 2 seconds if still on this page
          setTimeout(() => {
            if (window.location.pathname === '/auth/callback') {
              console.log('Forcing redirect to:', redirectTo);
              window.location.href = redirectTo;
            }
          }, 2000);
          
          return;
        }
        
        // If no redirect result, try to get current Firebase user
        const firebaseUser = await FirebaseAuth.getCurrentFirebaseUser();
        
        if (firebaseUser) {
          console.log('Firebase user found after redirect:', firebaseUser.email);
          setStatus('success');
          
          // Get redirect destination from session storage or default to dashboard
          const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
          sessionStorage.removeItem('authRedirectTo'); // Clean up
          
          console.log('Redirecting to:', redirectTo);
          
          // Redirect immediately - no delay needed
          try {
            router.push(redirectTo);
            router.refresh();
          } catch (routerError) {
            console.warn('Router push failed, using window.location:', routerError);
            // Fallback to window.location if router fails
            window.location.href = redirectTo;
          }
          
          // Force redirect after 2 seconds if still on this page
          setTimeout(() => {
            if (window.location.pathname === '/auth/callback') {
              console.log('Forcing redirect to:', redirectTo);
              window.location.href = redirectTo;
            }
          }, 2000);
        } else {
          console.error('No Firebase user found after OAuth callback');
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

    // Process immediately - no delay needed
    handleAuthCallback();
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