"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Home, Code, Database, Terminal, Play, Square, Settings, History, Command, Sparkles, Zap, Activity } from "lucide-react"
import Link from "next/link"

interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  lastUsed: string;
  usage: 'High' | 'Medium' | 'Low';
  icon: any;
  command: string;
  examples: string[];
  stats: {
    usage: string;
    success: string;
    time: string;
  };
}

export default function ToolsPage() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 bg-black text-white min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-4">
          <Link href="/dashboard" className="flex items-center hover:text-white transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Tools</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Tools</h2>
            <p className="text-sm text-zinc-400">Run and manage your development tools</p>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="grid gap-6">
          {/* Tool cards will be rendered here when data is available */}
          <div className="text-center py-12 text-zinc-400">
            <p>No tools available</p>
            <p className="text-sm mt-2">Add your first tool to get started</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 