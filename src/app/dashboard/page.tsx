"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Moon, Sun } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconSettings, IconDatabase, IconChartBar, IconTools, IconBrandDocker, IconFolder } from "@tabler/icons-react";

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const routes = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Projects', path: '/projects' },
    { name: 'Tools', path: '/tools' },
    { name: 'Settings', path: '/settings' }
  ];

  useEffect(() => {
    setMounted(true);
    // Add a small delay to ensure the initial state is rendered
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleHomeClick = () => {
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      
      {/* Main Content */}
      <div className="p-8 relative">
        {/* Header */}
        <header className={cn(
          "flex justify-between items-center mb-8",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-accent/10"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button className={cn(
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
              New Project
            </Button>
            <div className={cn(
              "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold hover:bg-primary/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )} style={{ transitionDelay: '200ms' }}>
              U
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Projects', value: '0', change: '0' },
            { label: 'Active Scrapes', value: '0', change: '0' },
            { label: 'Data Points', value: '0', change: '0' },
            { label: 'Success Rate', value: '0%', change: '0%' },
          ].map((stat, index) => (
            <div
              key={index}
              className={cn(
                "transition-all duration-500 ease-out",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="bg-card/80 backdrop-blur-xl border-border hover:border-accent/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-green-500 text-sm">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className={cn(
            "lg:col-span-2 transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '200ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'No recent activity', time: '' }
                  ].map((activity, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg bg-accent/5 transition-all duration-300 hover:bg-accent/10",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <span className="text-foreground">{activity.action}</span>
                      <span className="text-muted-foreground text-sm">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '300ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Start New Scrape',
                    'Export Data',
                    'Create Visualization',
                    'Schedule Task',
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-300 hover:scale-[1.02]",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Floating Dock UI at the bottom center */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <FloatingDock
            items={[
              { title: "Dashboard", icon: <IconHome />, href: "/dashboard" },
              { title: "Analytics", icon: <IconChartBar />, href: "/analytics" },
              { title: "Projects", icon: <IconFolder />, href: "/projects" },
              { title: "Tools", icon: <IconTools />, href: "/tools" },
              { title: "Settings", icon: <IconSettings />, href: "/settings" },
            ]}
          />
        </div>
      </div>

      {/* Floating Home Button */}
      <div className={cn(
        "fixed bottom-8 right-8 transition-all duration-500 ease-out",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )} style={{ transitionDelay: '400ms' }}>
        <Button
          onClick={handleHomeClick}
          variant="ghost"
          className="p-4 hover:bg-accent text-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Home className="w-6 h-6" />
        </Button>
      </div>
    </main>
  );
}