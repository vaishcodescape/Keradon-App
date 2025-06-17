"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import { Loading } from "@/components/ui/loading";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const requirements = [
      { test: (p: string) => p.length >= 8, message: "At least 8 characters" },
      { test: (p: string) => /[A-Z]/.test(p), message: "One uppercase letter" },
      { test: (p: string) => /[a-z]/.test(p), message: "One lowercase letter" },
      { test: (p: string) => /[0-9]/.test(p), message: "One number" },
    ];

    const failedRequirements = requirements
      .filter(req => !req.test(password))
      .map(req => req.message);

    return failedRequirements.length > 0
      ? `Password must contain: ${failedRequirements.join(", ")}`
      : null;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsFormLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      setIsFormLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("An account with this email already exists");
        }
        throw new Error(data.message || "Registration failed");
      }

      // Show success message and instructions
      toast.success(
        "Registration successful! Please Sign in.",
        {
          duration: 5000,
        }
      );

      // Reset form and redirect to sign-in
      resetForm();
      router.push("/sign-in");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result?.error) {
        toast.success("Signed up with Google successfully");
        router.push("/dashboard");
        router.refresh();
      } else if (result.error === "OAuthAccountNotLinked") {
        toast.error("An account with this email already exists. Please sign in with your original method.");
        router.push("/sign-in");
      } else {
        toast.error("Google sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Google sign up error:", error);
      toast.error("An error occurred during Google sign up");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Sign up to get started with Keradon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isFormLoading || isGoogleLoading}
                minLength={2}
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
                disabled={isFormLoading || isGoogleLoading}
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isFormLoading || isGoogleLoading}
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormLoading || isGoogleLoading}>
              {isFormLoading ? (
                <div className="flex items-center gap-2">
                  <Loading size={16} />
                  Creating account...
                </div>
              ) : (
                "Sign up"
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
                <Loading size={16} />
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
            By signing up, you agree to our Terms of Service and Privacy Policy
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