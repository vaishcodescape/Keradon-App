"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Briefcase, Users, Clock, ChevronRight, Home } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

export default function AnalyticsPage() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 bg-black text-white min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-4">
          <Link href="/dashboard" className="flex items-center hover:text-white transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Analytics</h2>
            <p className="text-sm text-zinc-400">Monitor your project and tool usage</p>
          </div>
        </div>
        <Separator className="bg-zinc-800" />
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 p-1 text-zinc-400">
              <TabsTrigger 
                value="overview" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Tools
              </TabsTrigger>
            </TabsList>
            <div className="text-sm text-zinc-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-zinc-400">
                    Active projects
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Tools</CardTitle>
                  <Activity className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-zinc-400">
                    Available tools
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-zinc-400">
                    Current users
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Usage Time</CardTitle>
                  <Clock className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0h</div>
                  <p className="text-xs text-zinc-400">
                    Total usage time
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="projects" className="space-y-4">
            <Card className="col-span-4 bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Project Analytics</CardTitle>
                <CardDescription className="text-zinc-400">
                  Detailed analytics for your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-zinc-400">
                  Project analytics content will go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tools" className="space-y-4">
            <Card className="col-span-4 bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Tool Analytics</CardTitle>
                <CardDescription className="text-zinc-400">
                  Detailed analytics for your tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-zinc-400">
                  Tool analytics content will go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
} 