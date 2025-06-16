"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavigation = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95 animate-gradient-x transition-all duration-1000"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black animate-pulse transition-all duration-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 transition-all duration-2000">
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 via-purple-400/20 to-pink-400/20 blur-3xl rounded-full -z-10 animate-gradient-shift transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 via-blue-400/20 to-purple-400/20 blur-3xl rounded-full -z-10 animate-gradient-shift-delay-1 transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 bg-gradient-to-r from-pink-400/20 via-orange-400/20 via-pink-400/20 to-orange-400/20 blur-3xl rounded-full -z-10 animate-gradient-shift-delay-2 transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 via-green-400/20 to-blue-400/20 blur-3xl rounded-full -z-10 animate-gradient-shift-delay-3 transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 bg-gradient-to-r from-orange-400/20 via-yellow-400/20 via-orange-400/20 to-yellow-400/20 blur-3xl rounded-full -z-10 animate-gradient-shift-delay-4 transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          <Card className={`bg-gradient-to-br from-black via-navy-900 to-black backdrop-blur-xl rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} max-w-5xl mx-auto p-12`}>
            <CardHeader className="text-center py-12">
              <div className="flex justify-center mb-8">
                <Image
                  src="/logo.png"
                  alt="Keradon Logo"
                  width={100}
                  height={100}
                  className="rounded-lg brightness-0 invert"
                />
              </div>
              <CardTitle className={`text-7xl font-bold mb-8 text-white transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Welcome to Keradon
              </CardTitle>
              <div className="h-12 overflow-hidden mb-12">
                <div className={`relative transition-all duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} flex justify-center`}>
                  <CardDescription className="absolute w-full text-2xl max-w-3xl mx-auto animate-text-slide bg-gradient-to-r from-purple-400 via-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-2000 ease-in-out">
                    Your AI-Powered Web Scraping Solution
                  </CardDescription>
                  <CardDescription className="absolute w-full text-2xl max-w-3xl mx-auto animate-text-slide-delay-1 bg-gradient-to-r from-blue-400 via-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent opacity-0">
                    Extract Data with Precision
                  </CardDescription>
                  <CardDescription className="absolute w-full text-2xl max-w-3xl mx-auto animate-text-slide-delay-2 bg-gradient-to-r from-pink-400 via-orange-400 via-pink-400 to-orange-400 bg-clip-text text-transparent opacity-0">
                    Transform Raw Data into Insights
                  </CardDescription>
                  <CardDescription className="absolute w-full text-2xl max-w-3xl mx-auto animate-text-slide-delay-3 bg-gradient-to-r from-green-400 via-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent opacity-0">
                    Automate Your Data Collection
                  </CardDescription>
                  <CardDescription className="absolute w-full text-2xl max-w-3xl mx-auto animate-text-slide-delay-4 bg-gradient-to-r from-orange-400 via-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent opacity-0">
                    No noise, no cloud, Just simple webscraping.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={handleNavigation}
                disabled={isLoading}
                className="bg-white text-black hover:bg-white/90 px-10 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Loading...
                  </div>
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}