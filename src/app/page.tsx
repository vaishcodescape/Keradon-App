"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black"></div>
        <div className="bg-black/90 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.15)] p-12 w-full max-w-4xl flex flex-col items-center relative z-10 border border-gray-800/30 animate-fade-in hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Keradon Logo"
              width={100}
              height={100}
              className="rounded-lg brightness-0 invert animate-in zoom-in duration-1000"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-slide-up text-white">
            Welcome to Keradon
          </h1>
          <div className="h-12 mb-12">
            <div className="flex justify-center">
              <CardDescription className="text-2xl max-w-3xl mx-auto text-white">
                Your AI-Powered Web Scraping Solution
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={handleNavigation}
            disabled={isLoading}
            className="bg-white text-black px-12 py-6 text-xl rounded-full font-semibold hover:bg-white/90 transition-all transform hover:scale-105 animate-bounce-subtle shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] relative"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Loading...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}