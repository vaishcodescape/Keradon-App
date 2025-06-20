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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid credentials. Please try again.");
    } else {
      toast.success("Signed in successfully");
      router.push("/dashboard");
    }
    setIsFormLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const result = await signIn("google", {
      redirect: false,
    });

    if (!result?.error) {
      toast.success("Signed in with Google successfully");
      router.push("/dashboard");
    } else {
      toast.error("Failed to sign in with Google");
    }
    setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormLoading || isGoogleLoading}>
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
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 