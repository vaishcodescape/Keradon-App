"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <Card className="bg-black/90 backdrop-blur-xl border-gray-800/30 max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white">Settings</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="text-black border-gray-700 hover:bg-gray-800 hover:text-white"
            >
              Back to Dashboard
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Settings content will go here */}
            <div className="text-gray-300">
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 