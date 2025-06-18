"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from "@/lib/utils";

const features = [
  "Your AI-Powered Web Scraping Solution",
  "Extract Data with Precision",
  "Transform Raw Data into Insights",
  "No Code. No Cloud. Just Smart Web Scraping."
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentText = features[currentFeature];
    
    if (!isDeleting && displayText === currentText) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText === '') {
      setCurrentFeature((prev) => (prev + 1) % features.length);
      setIsDeleting(false);
    } else {
      const delta = isDeleting ? -1 : 1;
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + delta));
      }, isDeleting ? 50 : 100);
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentFeature, isDeleting]);

  const handleNavigation = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/sign-in');
    }, 1000);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className={cn(
        "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]",
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Gradient Overlays */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background",
        "transition-all duration-500 ease-out delay-100",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Radial Gradient */}
      <div className={cn(
        "absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent",
        "transition-all duration-500 ease-out delay-200",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Animated Gradient Blobs */}
      <div className={cn(
        "absolute top-0 -left-4 w-72 h-72 bg-primary/40 rounded-full mix-blend-multiply filter blur-xl animate-blob",
        "transition-all duration-500 ease-out delay-300",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000",
        "transition-all duration-500 ease-out delay-400",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      <div className={cn(
        "absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000",
        "transition-all duration-500 ease-out delay-500",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Theme Toggle */}
      <div className={cn(
        "fixed top-4 right-4 z-50",
        "transition-all duration-500 ease-out delay-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}>
        <div className="flex items-center gap-2">
          <Label htmlFor="theme-toggle" className="sr-only">
            Toggle theme
          </Label>
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Toggle theme"
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen py-20 px-4 relative">
        <div className={cn(
          "w-full max-w-4xl",
          "transition-all duration-500 ease-out delay-400",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}>
          <Card className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2">
            <CardHeader className="space-y-6">
              <div className={cn(
                "flex justify-center",
                "transition-all duration-500 ease-out delay-500",
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              )}>
                <div className="relative w-28 h-28">
                  <Image
                    src="/logo.png"
                    alt="Keradon Logo"
                    fill
                    sizes="(max-width: 768px) 112px, 112px"
                    className="object-contain rounded-lg transition-all duration-300 hover:scale-105 hover:rotate-3"
                    style={{
                      filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none'
                    }}
                    priority
                    quality={100}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/logo.png';
                    }}
                  />
                </div>
              </div>
              <div className={cn(
                "transition-all duration-500 ease-out delay-600",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}>
                <CardTitle className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Welcome to Keradon
                </CardTitle>
              </div>
              <div className={cn(
                "h-12 flex justify-center items-center",
                "transition-all duration-500 ease-out delay-700",
                isVisible ? "opacity-100" : "opacity-0"
              )}>
                <CardDescription className="text-2xl text-center text-muted-foreground relative min-h-[2rem]">
                  <span className="inline-block">
                    {displayText}
                    <span className="inline-block w-[2px] h-6 bg-primary/50 ml-1 align-middle animate-pulse"></span>
                  </span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <div className={cn(
                "transition-all duration-500 ease-out delay-800",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}>
                <Button 
                  onClick={handleNavigation}
                  disabled={isLoading}
                  size="lg"
                  className="bg-primary text-primary-foreground px-12 py-6 text-xl rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
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
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}