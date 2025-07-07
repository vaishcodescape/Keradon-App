"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { tools } from "@/lib/tools-data"
import { 
  ToolsHeader, 
  QuickAccessBar, 
  ToolCard, 
  ToolInterface 
} from "@/components/tools"

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string>("datashark");

  // Keyboard shortcuts for quick tool switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTool('datashark');
            break;
          case '2':
            event.preventDefault();
            setActiveTool('queryhammerhead');
            break;
          case '3':
            event.preventDefault();
            setActiveTool('vizfin');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-6 pt-4 bg-gradient-to-br from-background via-background to-muted/20 text-foreground min-h-screen">
        <ToolsHeader toolsCount={tools.length} />

        <QuickAccessBar 
          tools={tools}
          activeTool={activeTool}
          onToolSelect={setActiveTool}
        />

        {tools.map((tool) => (
          <div key={tool.id} className={activeTool === tool.id ? 'block' : 'hidden'}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-6">
              <ToolCard tool={tool} />
              <ToolInterface tool={tool} />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 