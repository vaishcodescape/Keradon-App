"use client";

import { useSession } from "@/lib/hooks/useSession";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AuthDebug() {
  const { user, session, loading, error, refreshSession } = useSession();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const isAuthenticated = !!user && !!session;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug Info</CardTitle>
        <CardDescription className="text-xs">
          Development only - Supabase Authentication status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Status:</span>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "authenticated" : "unauthenticated"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Loading:</span>
          <Badge variant={loading ? "destructive" : "secondary"}>
            {loading ? "Yes" : "No"}
          </Badge>
        </div>

        {error && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-red-600">Error:</span>
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
              {error}
            </p>
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <span className="text-xs font-medium">User Info:</span>
            <div className="text-xs bg-muted p-2 rounded space-y-1">
              <div><strong>ID:</strong> {user.id || "Missing"}</div>
              <div><strong>Email:</strong> {user.email || "Missing"}</div>
              <div><strong>Name:</strong> {user.name || "Missing"}</div>
              <div><strong>Provider:</strong> {user.provider || "Unknown"}</div>
              {user.avatar_url && (
                <div><strong>Avatar:</strong> {user.avatar_url}</div>
              )}
            </div>
          </div>
        )}

        {session?.access_token && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Access Token:</span>
            <p className="text-xs bg-muted p-2 rounded truncate">
              {session.access_token.substring(0, 20)}...
            </p>
          </div>
        )}

        {session?.expires_at && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Session Expires:</span>
            <p className="text-xs bg-muted p-2 rounded">
              {new Date(session.expires_at * 1000).toLocaleString()}
            </p>
          </div>
        )}

        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshSession}
          className="w-full text-xs"
        >
          Refresh Session
        </Button>
      </CardContent>
    </Card>
  );
} 