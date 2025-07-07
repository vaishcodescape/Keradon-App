import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

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
  shortcut: string;
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/25 to-primary/15 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
            <tool.icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold mb-1">{tool.name}</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              tool.status === 'active' 
                ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
                : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-semibold capitalize">{tool.status}</span>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border-blue-200/50">
            {tool.usage} Usage
          </Badge>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-muted/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted/60 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Last used</div>
              <div className="text-sm font-semibold text-foreground">{tool.lastUsed}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 