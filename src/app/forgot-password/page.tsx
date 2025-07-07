"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, CheckCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

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
    
    setIsLoading(true);
    
    try {
      const auth = await getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      
      setIsSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Provide user-friendly error messages
      let userFriendlyError = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          userFriendlyError = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
          userFriendlyError = 'No account found with this email address.';
          break;
        case 'auth/too-many-requests':
          userFriendlyError = 'Too many requests. Please try again later.';
          break;
        case 'auth/network-request-failed':
          userFriendlyError = 'Network error. Please check your connection and try again.';
          break;
        default:
          userFriendlyError = error.message || 'Failed to send reset email. Please try again.';
      }
      
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-600 dark:text-green-400">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Try Again
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-in">
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div 
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm"
              role="alert"
              aria-live="polite"
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
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loading size={16} />
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in">
              Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 