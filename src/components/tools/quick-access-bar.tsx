import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Command } from "lucide-react"

interface Tool {
  id: string;
  name: string;
  icon: any;
  shortcut: string;
}

interface QuickAccessBarProps {
  tools: Tool[];
  activeTool: string;
  onToolSelect: (toolId: string) => void;
}

export function QuickAccessBar({ tools, activeTool, onToolSelect }: QuickAccessBarProps) {
  return (
    <Card className="bg-gradient-to-r from-muted/30 to-muted/20 border-muted/50">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Quick Access:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => onToolSelect(tool.id)}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <tool.icon className="w-3 h-3" />
                <span className="text-xs font-medium hidden sm:inline">{tool.name}</span>
                <span className="text-xs opacity-60 ml-1">
                  {tool.shortcut}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span className="hidden md:inline">Use keyboard shortcuts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 