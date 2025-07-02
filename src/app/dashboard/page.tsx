"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Moon, Sun, TrendingUp, TrendingDown, Activity, Clock, RefreshCw } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconSettings, IconChartBar, IconTools,IconFolder } from "@tabler/icons-react";
import { UserMenu } from "@/components/user-menu";
import { useSession } from "@/lib/hooks/useSession";
import { DashboardData, RecentActivity } from "@/lib/types/dashboard";

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { session, loading: sessionLoading, refreshSession } = useSession();

  const routes = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Projects', path: '/projects' },
    { name: 'Tools', path: '/tools' },
    { name: 'Settings', path: '/settings' }
  ];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (retry = false) => {
    if (!session?.user?.id) return;
    
    // Prevent multiple concurrent requests
    if (loading && !retry) return;
    
    try {
      setError('');
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        // Try to refresh session once if unauthorized
        if (!retry && refreshSession) {
          await refreshSession();
          await fetchDashboardData(true);
        } else {
          setError('You are not authenticated. Please sign in again.');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data);
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      if (dashboardData === null) {
        setError('Failed to load dashboard data');
      }
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id, dashboardData, refreshSession, loading]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get activity icon
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'project_created':
        return <Home className="h-4 w-4 text-blue-500" />;
      case 'data_scraped':
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    setMounted(true);
    // Add a small delay to ensure the initial state is rendered
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session?.user?.id && mounted) {
      // Fetch data immediately when session is available
      fetchDashboardData();
    }
  }, [session?.user?.id, mounted, fetchDashboardData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!session?.user?.id || !dashboardData) return;
    
    const interval = setInterval(() => {
      // Only refresh if we still have a valid session
      if (session?.user?.id) {
        fetchDashboardData();
      }
    }, 120000); // 2 minutes instead of 1 minute
    
    return () => clearInterval(interval);
  }, [session?.user?.id, dashboardData, fetchDashboardData]);



  if (!mounted || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((!session || !session.user?.id) && !sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">You are not signed in. Please sign in to view your dashboard.</p>
            <Button onClick={() => router.push('/sign-in')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      
      {/* Main Content */}
      <div className="p-8 relative">
        {/* Error Banner */}
        {error && dashboardData && (
          <div className={cn(
            "mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg",
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Unable to refresh data: {error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800"
              >
                {refreshing ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <header className={cn(
          "flex justify-between items-center mb-8",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            {session?.user && (
              <div>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {session.user.name || session.user.email}!
                </p>
                {dashboardData && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="hover:bg-accent/10"
            >
              <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
            </Button>
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
            <Button 
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              onClick={() => router.push('/new_projects')}
            >
              New Project
            </Button>
            <UserMenu />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData && Object.entries(dashboardData.stats).map(([key, stat], index) => (
            <div
              key={key}
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
                    <div className="flex items-center gap-1">
                      {stat.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : stat.change < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className={cn(
                        "text-sm",
                        stat.change > 0 ? "text-green-500" : stat.change < 0 ? "text-red-500" : "text-gray-500"
                      )}>
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Loading state */}
          {loading && !dashboardData && Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "transition-all duration-500 ease-out",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="bg-card/80 backdrop-blur-xl border-border">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Activity Chart */}
        {dashboardData?.chartData && dashboardData.chartData.length > 0 && (
          <div className={cn(
            "mb-8 transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '400ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Activity Overview (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <div className="grid grid-cols-7 gap-2 h-full">
                    {dashboardData.chartData.map((day, index) => {
                      const maxValue = Math.max(...dashboardData.chartData.map(d => d.scrapes));
                      const height = maxValue > 0 ? (day.scrapes / maxValue) * 100 : 0;
                      
                      return (
                        <div key={day.date} className="flex flex-col items-center justify-end h-full">
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all duration-500 hover:bg-primary"
                            style={{ 
                              height: `${height}%`,
                              minHeight: day.scrapes > 0 ? '8px' : '2px',
                              transitionDelay: `${index * 100}ms`
                            }}
                          />
                          <div className="text-xs text-muted-foreground mt-2 text-center">
                            <div className="font-medium">{day.scrapes}</div>
                            <div>{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <div 
                        key={activity.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg bg-accent/5 transition-all duration-300 hover:bg-accent/10 cursor-pointer",
                          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        )}
                        style={{ transitionDelay: `${index * 100}ms` }}
                        onClick={() => activity.project_id && router.push(`/projects/${activity.project_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <span className="text-foreground">{activity.message}</span>
                            {activity.tool_name && (
                              <div className="text-xs text-muted-foreground">
                                Tool: {activity.tool_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {loading ? (
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ) : (
                        <div>
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recent activity</p>
                          <p className="text-xs">Create a project to get started!</p>
                        </div>
                      )}
                    </div>
                  )}
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
                    { name: 'New Project', action: () => router.push('/new_projects'), icon: <Home className="h-4 w-4" /> },
                    { name: 'View Projects', action: () => router.push('/projects'), icon: <IconFolder className="h-4 w-4" /> },
                    { name: 'Analytics', action: () => router.push('/analytics'), icon: <IconChartBar className="h-4 w-4" /> },
                    { name: 'Tools', action: () => router.push('/tools'), icon: <IconTools className="h-4 w-4" /> },
                    { name: 'Settings', action: () => router.push('/settings'), icon: <IconSettings className="h-4 w-4" /> },
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={action.action}
                      className={cn(
                        "w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-300 hover:scale-[1.02]",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        {action.name}
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Dashboard Summary */}
                {dashboardData?.summary && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Projects</span>
                        <span className="font-medium">{dashboardData.summary.activeProjects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This Week</span>
                        <span className="font-medium">{dashboardData.summary.dataPointsThisWeek} scrapes</span>
                      </div>
                      {Object.entries(dashboardData.toolUsage).length > 0 && (
                        <div className="mt-3">
                          <div className="text-muted-foreground mb-2">Most Used Tools</div>
                          {Object.entries(dashboardData.toolUsage)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([tool, count]) => (
                              <div key={tool} className="flex justify-between text-xs">
                                <span className="capitalize">{tool}</span>
                                <span>{count}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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


    </main>
  );
}