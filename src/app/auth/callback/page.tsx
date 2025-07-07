"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FirebaseAuth } from "@/lib/auth/firebase-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, CheckCircle } from "lucide-react";

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'redirecting'>('loading');
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL params first
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          setError(errorDescription || errorParam);
          setStatus('error');
          return;
        }

        // Handle redirect result from OAuth
        const { data: redirectResult, error: redirectError } = await FirebaseAuth.handleRedirectResult();
        
        if (redirectError) {
          setError(redirectError);
          setStatus('error');
          return;
        }
        
        if (redirectResult) {
          setStatus('redirecting');
          // Redirect to dashboard or intended page after a short delay
          setTimeout(() => {
            const redirectTo = sessionStorage.getItem('authRedirectTo') || '/dashboard';
            sessionStorage.removeItem('authRedirectTo');
            window.location.replace(redirectTo);
          }, 800);
          return;
        }
        
        setError('No authentication result found. Please try signing in again.');
        setStatus('error');
        
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
        setStatus('error');
      }
    };

    // Process immediately
    handleAuthCallback();
  }, [searchParams]);

  if (status === 'loading' || status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <CardTitle>{status === 'redirecting' ? 'Redirecting...' : 'Completing Sign In'}</CardTitle>
            <CardDescription>
              {status === 'redirecting'
                ? 'You are being redirected to your dashboard...'
                : 'Please wait while we sign you in...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loading size={32} />
            <p className="text-sm text-muted-foreground">
              {status === 'redirecting'
                ? 'This should only take a moment'
                : 'This should only take a moment'}
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