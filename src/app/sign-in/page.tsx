"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FirebaseAuth } from "@/lib/auth/firebase-auth";
import { FcGoogle } from "react-icons/fc";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import { Loading } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";

export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect URL from query params or default to dashboard
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  // Check for error messages in URL params (e.g., from OAuth failures)
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Set initial error if present in URL
  useEffect(() => {
    if (errorParam) {
      setError(errorDescription || errorParam);
    }
  }, [errorParam, errorDescription]);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setIsFormLoading(true);
    
    try {
      const { data, error } = await FirebaseAuth.signInWithEmail(email, password);

      if (error) {
        console.error("Sign in error:", error);
        setError(error);
      } else if (data?.user) {
        toast.success("Signed in successfully! Redirecting...");
        
        // Check if Firebase user is available immediately
        const firebaseUser = await FirebaseAuth.getCurrentFirebaseUser();
        if (firebaseUser) {
          console.log('Firebase user confirmed after email sign-in:', firebaseUser.email);
          // Redirect immediately - no delay needed
          router.push(redirectTo);
          router.refresh();
        } else {
          console.warn('Firebase user not immediately available, redirecting anyway');
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setError("An error occurred during sign in");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Store redirect destination for OAuth callback
      sessionStorage.setItem('authRedirectTo', redirectTo);
      
      console.log('Starting Google OAuth, will redirect to:', redirectTo);
      
      const { data, error } = await FirebaseAuth.signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        setError(error);
        setIsGoogleLoading(false);
        return;
      }
      
      // Google OAuth always uses redirect now
      console.log('Google OAuth redirect initiated');
      // The page will redirect automatically, so we don't need to do anything
      return;
      
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {(isFormLoading || isGoogleLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center gap-4">
            <Loading size={32} />
            <span className="text-white text-lg font-medium">
              {isGoogleLoading ? "Redirecting to Google..." : "Signing you in..."}
            </span>
          </div>
        </div>
      )}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div 
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm"
              role="alert"
              aria-live="polite"
              id="error-message"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(''); // Clear error when user starts typing
                }}
                required
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(''); // Clear error when user starts typing
                }}
                required
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isFormLoading || isGoogleLoading || !email.trim() || !password.trim()}
              aria-describedby={error ? "error-message" : undefined}
            >
              {isFormLoading ? (
                <div className="flex items-center gap-2">
                  <Loading size={16} />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isFormLoading || isGoogleLoading}
            type="button"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <Loading size={16} />
                Connecting...
              </div>
            ) : (
              <>
                <FcGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 