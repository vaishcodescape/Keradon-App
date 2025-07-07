import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Home, Activity } from "lucide-react"

interface ToolsHeaderProps {
  toolsCount: number;
}

export function ToolsHeader({ toolsCount }: ToolsHeaderProps) {
  return (
    <>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
          <Home className="h-4 w-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Tools</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Development Tools
          </h2>
          <p className="text-lg text-muted-foreground">Interactive GUI for your development tools</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary">
            <Activity className="w-4 h-4 mr-2" />
            {toolsCount} Active Tools
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            All Systems Operational
          </Badge>
        </div>
      </div>
    </>
  )
} 