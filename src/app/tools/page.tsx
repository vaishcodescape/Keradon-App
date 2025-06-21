"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Home,BarChart3, Globe, HelpCircle, Upload, Search, Database,Activity,Clock  } from "lucide-react"
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
  examples: string[];
}

const tools: Tool[] = [
  {
    id: "datashark",
    name: "DataShark",
    description: "Smart web scraper that intelligently extracts data from websites with advanced parsing capabilities",
    type: "Web Scraping",
    status: 'active',
    lastUsed: "2 hours ago",
    usage: 'High',
    icon: Globe,
    command: "datashark scrape <url>",
    examples: [
      "datashark scrape https://example.com",
      "datashark scrape --format json https://api.example.com",
      "datashark scrape --selectors '.title,.price' https://store.example.com"
    ]
  },
  {
    id: "queryhammerhead",
    name: "QueryHammerhead",
    description: "LLM-powered data Q&A tool that answers questions about your datasets using natural language",
    type: "Data Analysis",
    status: 'active',
    lastUsed: "1 hour ago",
    usage: 'Medium',
    icon: HelpCircle,
    command: "queryhammerhead ask <question>",
    examples: [
      "queryhammerhead ask 'What are the top 10 products by sales?'",
      "queryhammerhead ask 'Show me trends in user engagement over time'",
      "queryhammerhead ask 'Which customers have the highest lifetime value?'"
    ]
  },
  {
    id: "vizfin",
    name: "VizFin",
    description: "Advanced data visualizer that creates beautiful charts and dashboards from your data",
    type: "Data Visualization",
    status: 'active',
    lastUsed: "30 minutes ago",
    usage: 'High',
    icon: BarChart3,
    command: "vizfin create <chart-type>",
    examples: [
      "vizfin create line --data sales.csv --x date --y revenue",
      "vizfin create bar --data users.csv --x country --y count",
      "vizfin create dashboard --config dashboard.json"
    ]
  }
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

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
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Development Tools
            </h2>
            <p className="text-base text-muted-foreground">Interactive GUI for your development tools</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">3 Active Tools</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="datashark" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 backdrop-blur-sm">
            {tools.map((tool) => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id} 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200"
              >
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <tool.icon className="w-3 h-3 text-primary" />
                </div>
                <span className="font-medium text-sm">{tool.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tools.map((tool) => (
            <TabsContent key={tool.id} value={tool.id} className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {/* Tool Info Card */}
                <Card className="md:col-span-1 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                        <tool.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold">{tool.name}</CardTitle>
                        <CardDescription className="text-sm mt-1 leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          tool.status === 'active' 
                            ? 'bg-green-500 animate-pulse' 
                            : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm font-medium capitalize">{tool.status}</span>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                        {tool.usage} Usage
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/30 rounded-lg border border-muted/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-muted/50 rounded-lg flex items-center justify-center">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Last used</div>
                          <div className="text-sm font-medium text-foreground">{tool.lastUsed}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tool Interface Card */}
                <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Tool Interface</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tool-specific GUI */}
                    {tool.id === "datashark" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800 dark:text-blue-400">DataShark</span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            DataShark can extract structured data from any website. Enter the URL and configure your scraping parameters.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <span>Website URL</span>
                            </label>
                            <Input 
                              placeholder="https://example.com" 
                              className="h-10 text-base"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Output Format</label>
                            <Select>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="xml">XML</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">CSS Selectors (Optional)</label>
                          <Input 
                            placeholder=".title, .price, .description" 
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Advanced Options</label>
                          <Textarea 
                            placeholder="Additional scraping parameters..." 
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="w-auto mx-auto px-6 h-10 text-base font-semibold"
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
                    )}

                    {tool.id === "queryhammerhead" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <HelpCircle className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-800 dark:text-purple-400">QueryHammerhead</span>
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            QueryHammerhead uses AI to analyze your data and answer questions in natural language. Upload your dataset and ask away!
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-green-500" />
                            <span>Upload Dataset</span>
                          </label>
                          <FileUpload />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold flex items-center space-x-2">
                            <HelpCircle className="w-4 h-4 text-purple-500" />
                            <span>Ask a Question</span>
                          </label>
                          <Textarea 
                            placeholder="What insights would you like to discover from your data?" 
                            rows={3}
                            className="resize-none text-base"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Analysis Type</label>
                            <Select>
                              <SelectTrigger className="h-10">
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
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Confidence Level</label>
                            <Select>
                              <SelectTrigger className="h-10">
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
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="w-auto mx-auto px-6 h-10 text-base font-semibold"
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
                    )}

                    {tool.id === "vizfin" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800 dark:text-orange-400">VizFin</span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            VizFin creates beautiful, interactive visualizations from your data. Choose your chart type and customize the appearance.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold flex items-center space-x-2">
                            <Database className="w-4 h-4 text-orange-500" />
                            <span>Upload Data</span>
                          </label>
                          <FileUpload />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Chart Type</label>
                            <Select>
                              <SelectTrigger className="h-10">
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
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">X-Axis Column</label>
                            <Input placeholder="e.g., date, category, name" className="h-10" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold">Y-Axis Column</label>
                            <Input placeholder="e.g., value, count, amount" className="h-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Chart Title</label>
                          <Input placeholder="Enter a descriptive title for your chart" className="h-10" />
                        </div>
                        <Button 
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning}
                          className="w-auto mx-auto px-6 h-10 text-base font-semibold"
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ScrollArea>
  )
} 