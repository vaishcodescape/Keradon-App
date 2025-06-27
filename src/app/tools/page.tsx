"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, BarChart3, Globe, HelpCircle, Upload, Search, Database, Activity, Clock, Zap, Command } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"

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

const tools: Tool[] = [
  {
    id: "datashark",
    name: "DataShark",
    description: "Smart web scraper that intelligently extracts data from websites with advanced parsing capabilities",
    type: "Web Scraping",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'High',
    icon: Globe,
    command: "datashark scrape <url>",
    shortcut: "⌘1"
  },
  {
    id: "queryhammerhead",
    name: "QueryHammerhead",
    description: "LLM-powered data Q&A tool that answers questions about your datasets using natural language",
    type: "Data Analysis",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'Medium',
    icon: HelpCircle,
    command: "queryhammerhead ask <question>",
    shortcut: "⌘2"
  },
  {
    id: "vizfin",
    name: "VizFin",
    description: "Advanced data visualizer that creates beautiful charts and dashboards from your data",
    type: "Data Visualization",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'High',
    icon: BarChart3,
    command: "vizfin create <chart-type>",
    shortcut: "⌘3"
  }
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string>("datashark");
  const [isRunning, setIsRunning] = useState(false);

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

  const handleRunTool = async (toolId: string) => {
    setIsRunning(true);
    setActiveTool(toolId);
    
    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRunning(false);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-6 pt-4 bg-gradient-to-br from-background via-background to-muted/20 text-foreground min-h-screen">
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
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{tools.length} Active Tools</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-muted/50">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Quick Access:</span>
          </div>
          <div className="flex items-center space-x-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool(tool.id)}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <tool.icon className="w-3 h-3" />
                <span className="text-xs font-medium">{tool.name}</span>
                <span className="text-xs opacity-60">{tool.shortcut}</span>
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>Use keyboard shortcuts</span>
          </div>
        </div>

        {tools.map((tool) => (
          <div key={tool.id} className={activeTool === tool.id ? 'block' : 'hidden'}>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-6">
              {/* Tool Info Card */}
              <Card className="md:col-span-1 border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
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
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 shadow-sm">
                      {tool.usage} Usage
                    </div>
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

              {/* Tool Interface Card */}
              <Card className="md:col-span-2 border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Tool Interface</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tool-specific GUI */}
                  {tool.id === "datashark" && (
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-400">DataShark</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          DataShark can extract structured data from any website. Enter the URL and configure your scraping parameters.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span>Website URL</span>
                          </label>
                          <Input 
                            placeholder="https://example.com" 
                            className="h-11 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Output Format</label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xml">XML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-center pt-2">
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="px-8 h-11 text-base font-semibold"
                        >
                          {isRunning && activeTool === tool.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Scraping...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4 mr-2" />
                              Start Scraping
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {tool.id === "queryhammerhead" && (
                    <div className="space-y-6">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <HelpCircle className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-800 dark:text-purple-400">QueryHammerhead</span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          QueryHammerhead uses AI to analyze your data and answer questions in natural language. Upload your dataset and ask away!
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-green-500" />
                          <span>Upload Dataset</span>
                        </label>
                        <FileUpload />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center space-x-2">
                          <HelpCircle className="w-4 h-4 text-purple-500" />
                          <span>Ask a Question</span>
                        </label>
                        <Textarea 
                          placeholder="What insights would you like to discover from your data?" 
                          rows={3}
                          className="resize-none text-base min-h-[84px]"
                        />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Analysis Type</label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select analysis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trends">Trend Analysis</SelectItem>
                              <SelectItem value="patterns">Pattern Recognition</SelectItem>
                              <SelectItem value="predictions">Predictions</SelectItem>
                              <SelectItem value="summary">Data Summary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Confidence Level</label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select confidence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High (90%+)</SelectItem>
                              <SelectItem value="medium">Medium (70-90%)</SelectItem>
                              <SelectItem value="low">Low (50-70%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-center pt-2">
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="px-8 h-11 text-base font-semibold"
                        >
                          {isRunning && activeTool === tool.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <HelpCircle className="w-4 h-4 mr-2" />
                              Ask Question
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {tool.id === "vizfin" && (
                    <div className="space-y-6">
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800 dark:text-orange-400">VizFin</span>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          VizFin creates beautiful, interactive visualizations from your data. Choose your chart type and customize the appearance.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center space-x-2">
                          <Database className="w-4 h-4 text-orange-500" />
                          <span>Upload Data</span>
                        </label>
                        <FileUpload />
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Chart Type</label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="line">Line Chart</SelectItem>
                              <SelectItem value="bar">Bar Chart</SelectItem>
                              <SelectItem value="pie">Pie Chart</SelectItem>
                              <SelectItem value="scatter">Scatter Plot</SelectItem>
                              <SelectItem value="area">Area Chart</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Theme</label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="auto">Auto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">X-Axis Column</label>
                          <Input placeholder="e.g., date, category, name" className="h-11 text-base" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Y-Axis Column</label>
                          <Input placeholder="e.g., value, count, amount" className="h-11 text-base" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-semibold">Chart Title</label>
                        <Input placeholder="Enter a descriptive title for your chart" className="h-11 text-base" />
                      </div>
                      
                      <div className="flex justify-center pt-2">
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="px-8 h-11 text-base font-semibold"
                        >
                          {isRunning && activeTool === tool.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating Chart...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Create Visualization
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 