"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FirebaseAuth } from "@/lib/auth/firebase-auth";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');
  const [emailMessage, setEmailMessage] = useState("");

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if user exists when email changes
  useEffect(() => {
    const checkUserExists = async () => {
      if (!email.trim() || !isValidEmail(email)) {
        setEmailStatus('idle');
        setEmailMessage("");
        return;
      }

      setEmailStatus('checking');
      setEmailMessage("Checking email availability...");

      try {
        const response = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.exists) {
            setEmailStatus('exists');
            setEmailMessage("An account with this email already exists. Please sign in instead.");
          } else {
            setEmailStatus('available');
            setEmailMessage("Email is available for registration");
          }
        } else {
          // If API fails, don't show error to user, just reset status
          setEmailStatus('idle');
          setEmailMessage("");
        }
      } catch (error) {
        // Network errors or other issues - don't show error to user
        setEmailStatus('idle');
        setEmailMessage("");
      }
    };

    // Debounce the check to avoid too many requests
    const timeoutId = setTimeout(checkUserExists, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    
    // Client-side validation
    if (!name.trim()) {
      toast.error("Name is required");
      setIsFormLoading(false);
      return;
    }
    
    if (!email.trim()) {
      toast.error("Email is required");
      setIsFormLoading(false);
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      setIsFormLoading(false);
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setIsFormLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsFormLoading(false);
      return;
    }
    
    // Check if user already exists (double-check)
    if (emailStatus === 'exists') {
      toast.error("An account with this email already exists. Please sign in instead.");
      setIsFormLoading(false);
      return;
    }
    
    try {
      const { data, error } = await FirebaseAuth.signUpWithEmail(email, password, name);

      if (error) {
        if (error.includes("auth/email-already-in-use") || error.includes("User already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.", {
            duration: 5000,
            action: {
              label: "Sign In",
              onClick: () => router.push("/sign-in")
            }
          });
          // Don't update email status - keep it clean
        } else if (error.includes("Password should be at least 6 characters")) {
          toast.error("Password must be at least 6 characters long");
        } else if (error.includes("Unable to validate email address")) {
          toast.error("Please enter a valid email address");
        } else if (error.includes("auth/weak-password")) {
          toast.error("Password is too weak. Please choose a stronger password.");
        } else if (error.includes("auth/invalid-email")) {
          toast.error("Please enter a valid email address");
        } else {
          toast.error("Sign up failed. Please try again.");
        }
      } else if (data?.user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        router.push("/sign-in");
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await FirebaseAuth.signInWithGoogle();

      if (error) {
        toast.error(error);
      } else if (data?.user) {
        toast.success("Account created successfully!");
        router.push('/dashboard');
      } else {
        toast.error("Failed to sign up with Google. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during Google sign up");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {(isFormLoading || isGoogleLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="size-8" />
            <span className="text-white text-lg font-medium">
              {isGoogleLoading ? "Redirecting to Google..." : "Creating your account..."}
            </span>
          </div>
        </div>
      )}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join us and start your journey today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailStatus === 'exists' ? 'border-red-500' : emailStatus === 'available' ? 'border-green-500' : ''}
              />
              {emailStatus !== 'idle' && emailMessage && (
                <div className={`flex items-center gap-2 text-sm ${
                  emailStatus === 'checking' ? 'text-blue-600' :
                  emailStatus === 'exists' ? 'text-red-600' :
                  emailStatus === 'available' ? 'text-green-600' : ''
                }`}>
                  {emailStatus === 'checking' && <Spinner className="size-3.5" />}
                  {emailStatus === 'exists' && <AlertCircle className="h-4 w-4" />}
                  {emailStatus === 'available' && <CheckCircle className="h-4 w-4" />}
                  <span>{emailMessage}</span>
                  {emailStatus === 'exists' && (
                    <Link href="/sign-in" className="text-primary hover:underline ml-1">
                      Sign in here
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isFormLoading || isGoogleLoading || emailStatus === 'exists'}
            >
              {isFormLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Creating account...
                </div>
              ) : emailStatus === 'exists' ? (
                "Account already exists"
              ) : (
                "Create account"
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
            onClick={handleGoogleSignUp}
            disabled={isFormLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="size-4" />
                Connecting...
              </div>
            ) : (
              <>
                <FcGoogle className="mr-2 h-5 w-5" />
                Sign up with Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}