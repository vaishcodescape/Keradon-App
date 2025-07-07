import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataSharkInterface } from "./datashark-interface"
import { QueryHammerheadInterface } from "@/components/queryhammerhead-interface"
import { VizFinInterface } from "@/components/vizfin-interface"

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

interface ToolInterfaceProps {
  tool: Tool;
}

export function ToolInterface({ tool }: ToolInterfaceProps) {
  const renderToolInterface = () => {
    switch (tool.id) {
      case "datashark":
        return <DataSharkInterface />;
      case "queryhammerhead":
        return <QueryHammerheadInterface />;
      case "vizfin":
        return <VizFinInterface />;
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>Interface for {tool.name} is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>Tool Interface</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderToolInterface()}
      </CardContent>
    </Card>
  )
} 