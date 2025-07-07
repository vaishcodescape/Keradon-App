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
import { useAuthContext } from "@/components/session-provider";
import { DashboardData, RecentActivity } from "@/lib/types/dashboard";
import { dashboardApi } from "@/lib/api-client";

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
  const { user, loading: authLoading } = useAuthContext();

  const routes = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Projects', path: '/projects' },
    { name: 'Tools', path: '/tools' },
    { name: 'Settings', path: '/settings' }
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setError('');
      const response = await dashboardApi.getStats();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    // Immediate visibility for faster perceived loading
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (user?.uid && mounted) {
      // Start loading immediately when user is available
      fetchDashboardData();
    } else if (mounted && !authLoading && !user?.uid) {
      setLoading(false);
    }
  }, [user?.uid, mounted, authLoading, fetchDashboardData]);

  // Reduced auto-refresh interval for better performance
  useEffect(() => {
    if (!user?.uid || !dashboardData) return;
    
    const interval = setInterval(() => {
      if (user?.uid) {
        fetchDashboardData();
      }
    }, 600000); // 10 minutes instead of 5
    
    return () => clearInterval(interval);
  }, [user?.uid, dashboardData, fetchDashboardData]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((!user || !user.uid) && !authLoading) {
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

  if (loading || !dashboardData) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
        
        <div className="p-8 relative">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card/80 backdrop-blur-xl border border-border rounded-lg p-6">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card/80 backdrop-blur-xl border border-border rounded-lg p-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg p-6">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
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
            "transition-all duration-300 ease-out",
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
          "transition-all duration-300 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            {user && (
              <div>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user.displayName || user.email}!
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
                "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl",
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
          {[
            { 
              key: 'totalProjects', 
              label: 'Total Projects', 
              value: dashboardData?.stats?.totalProjects || 0, 
              change: 12 
            },
            { 
              key: 'activeProjects', 
              label: 'Active Projects', 
              value: dashboardData?.stats?.activeProjects || 0, 
              change: 8 
            },
            { 
              key: 'totalDataScraped', 
              label: 'Data Scraped', 
              value: (dashboardData?.stats?.totalDataScraped || 0).toLocaleString(), 
              change: 15 
            },
            { 
              key: 'toolsUsed', 
              label: 'Tools Used', 
              value: dashboardData?.stats?.toolsUsed || 0, 
              change: 5 
            }
          ].map((stat, index) => (
            <div
              key={stat.key}
              className={cn(
                "transition-all duration-300 ease-out",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Card className="bg-card/80 backdrop-blur-xl border-border hover:border-accent/30 transition-all duration-200 shadow-lg hover:shadow-xl">
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
          
          {/* Loading state overlay */}
          {loading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading dashboard data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Activity Chart */}
        {dashboardData?.projectsOverTime && dashboardData.projectsOverTime.length > 0 && (
          <div className={cn(
            "mb-8 transition-all duration-300 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '200ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-200 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Projects Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <div className="grid grid-cols-6 gap-2 h-full">
                    {dashboardData.projectsOverTime.map((month: { date: string; count?: number }, index: number) => {
                      const maxValue = Math.max(...dashboardData.projectsOverTime.map((d: { count?: number }) => d.count || 0));
                      const height = maxValue > 0 ? ((month.count || 0) / maxValue) * 100 : 0;
                      
                      return (
                        <div key={month.date} className="flex flex-col items-center justify-end h-full">
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary"
                            style={{ 
                              height: `${height}%`,
                              minHeight: (month.count || 0) > 0 ? '8px' : '2px',
                              transitionDelay: `${index * 50}ms`
                            }}
                          />
                          <div className="text-xs text-muted-foreground mt-2 text-center">
                            <div className="font-medium">{month.count}</div>
                            <div>{new Date(month.date).toLocaleDateString('en', { month: 'short' })}</div>
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
            "lg:col-span-2 transition-all duration-300 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '100ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-200 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity: any, index: number) => (
                      <div 
                        key={activity.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg bg-accent/5 transition-all duration-200 hover:bg-accent/10 cursor-pointer",
                          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        )}
                        style={{ transitionDelay: `${index * 50}ms` }}
                        onClick={() => router.push(`/projects`)}
                      >
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <span className="text-foreground">{activity.title}</span>
                            <div className="text-xs text-muted-foreground">
                              {activity.description}
                            </div>
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
                      ) : !dashboardData ? (
                        <div>
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Welcome to your dashboard!</p>
                          <p className="text-xs mb-4">Start by creating your first project</p>
                          <Button 
                            onClick={() => router.push('/new_projects')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Create Your First Project
                          </Button>
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
            "transition-all duration-300 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '150ms' }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border transition-all duration-200 shadow-lg hover:shadow-xl">
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
                        "w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200 hover:scale-[1.02]",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        {action.name}
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projects This Week</span>
                      <span className="font-medium">{dashboardData?.quickStats?.projectsThisWeek || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Scraped Today</span>
                      <span className="font-medium">{dashboardData?.quickStats?.dataScrapedToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tools Active</span>
                      <span className="font-medium">{dashboardData?.quickStats?.toolsActive || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Project Time</span>
                      <span className="font-medium">{dashboardData?.quickStats?.averageProjectTime || 'N/A'}</span>
                    </div>
                  </div>
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


    </main>
  );
}