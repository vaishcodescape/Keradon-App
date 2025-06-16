"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download, Filter, BarChart3, LineChart, PieChart, Home, Settings, Database } from "lucide-react";
import { format } from "date-fns";
import { Navigation } from "@/components/navigation";

export default function Analytics() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      
      <div className="p-8 relative">
        <Navigation />

        {/* Header */}
        <div className={cn(
          "flex justify-between items-center mb-8",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Scrapes', value: '0', change: '0%' },
            { label: 'Success Rate', value: '0%', change: '0%' },
            { label: 'Data Points', value: '0', change: '0%' },
            { label: 'Avg. Response Time', value: '0s', change: '0s' },
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
                    <span className={cn(
                      "text-sm",
                      stat.change.startsWith('+') ? "text-green-500" : "text-red-500"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className={cn(
            "lg:col-span-2 space-y-6",
            "transition-all duration-500 ease-out delay-200",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <Tabs defaultValue="daily" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <Select defaultValue="line">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Pie Chart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TabsContent value="daily" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-xl border-border">
                  <CardHeader>
                    <CardTitle>Scraping Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Chart visualization will be implemented here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="weekly" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-xl border-border">
                  <CardHeader>
                    <CardTitle>Weekly Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Chart visualization will be implemented here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="monthly" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-xl border-border">
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Chart visualization will be implemented here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className={cn(
            "space-y-6",
            "transition-all duration-500 ease-out delay-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            {/* Recent Activity */}
            <Card className="bg-card/80 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {([] as { action: string; time: string; status: 'success' | 'pending' | 'error' }[]).map((activity, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg bg-accent/5 transition-all duration-300 hover:bg-accent/10",
                        "transition-all duration-500 ease-out",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100 + 400}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.status === 'success' && "bg-green-500",
                          activity.status === 'pending' && "bg-yellow-500",
                          activity.status === 'error' && "bg-red-500"
                        )} />
                        <span className="text-foreground">{activity.action}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-card/80 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {([] as { label: string; value: string }[]).map((metric, index) => (
                    <div
                      key={index}
                      className={cn(
                        "transition-all duration-500 ease-out",
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${index * 100 + 800}ms` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="text-foreground font-medium">{metric.value}</span>
                      </div>
                      <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: metric.value,
                            transitionDelay: `${index * 100 + 800}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}