import { useSession as useNextAuthSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  return {
    session,
    status,
    isLoading,
    isAuthenticated: !!session,
    signOut,
    refreshSession,
  };
} 