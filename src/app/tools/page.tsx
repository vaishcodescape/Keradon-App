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
import { ChevronRight, Home, Play, Settings, BarChart3, Globe, HelpCircle, Download, Upload, Search, Eye, FileText, Database } from "lucide-react"
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
    ],
    stats: {
      usage: "1,247 runs",
      success: "98.5%",
      time: "2.3s avg"
    }
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
    ],
    stats: {
      usage: "856 queries",
      success: "94.2%",
      time: "1.8s avg"
    }
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
    ],
    stats: {
      usage: "1,523 charts",
      success: "99.1%",
      time: "3.1s avg"
    }
  }
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunTool = async (toolId: string) => {
    setIsRunning(true);
    setActiveTool(toolId);
    
    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results based on tool
    const mockResults = {
      datashark: {
        status: "success",
        data: [
          { title: "Sample Product 1", price: "$29.99", rating: "4.5" },
          { title: "Sample Product 2", price: "$49.99", rating: "4.2" },
          { title: "Sample Product 3", price: "$19.99", rating: "4.8" }
        ],
        message: "Successfully scraped 3 items from the website"
      },
      queryhammerhead: {
        status: "success",
        answer: "Based on the data analysis, the top 3 products by sales are: Product A ($15,230), Product B ($12,450), and Product C ($9,870). The trend shows a 23% increase in sales over the last quarter.",
        confidence: "94.2%"
      },
      vizfin: {
        status: "success",
        chartUrl: "/api/charts/generated-chart-123.png",
        message: "Chart generated successfully! You can download it or embed it in your dashboard."
      }
    };
    
    setResults(mockResults[toolId as keyof typeof mockResults]);
    setIsRunning(false);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 bg-background text-foreground min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Tools</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Tools</h2>
            <p className="text-sm text-muted-foreground">Interactive GUI for your development tools</p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="datashark" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {tools.map((tool) => (
              <TabsTrigger key={tool.id} value={tool.id} className="flex items-center space-x-2">
                <tool.icon className="w-4 h-4" />
                <span>{tool.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tools.map((tool) => (
            <TabsContent key={tool.id} value={tool.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <tool.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {tool.status}
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border">
                        {tool.usage} Usage
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tool-specific GUI */}
                  {tool.id === "datashark" && (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Website URL</label>
                          <Input placeholder="https://example.com" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Output Format</label>
                          <Select>
                            <SelectTrigger>
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
                        <label className="text-sm font-medium">CSS Selectors (Optional)</label>
                        <Input placeholder=".title, .price, .description" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Advanced Options</label>
                        <Textarea placeholder="Additional scraping parameters..." rows={3} />
                      </div>
                      <Button 
                        onClick={() => handleRunTool(tool.id)}
                        disabled={isRunning}
                        className="w-full"
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
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Dataset</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Drag and drop your CSV, JSON, or Excel file here</p>
                          <Button variant="outline" className="mt-2">Browse Files</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ask a Question</label>
                        <Textarea 
                          placeholder="What insights would you like to discover from your data?" 
                          rows={4}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Analysis Type</label>
                          <Select>
                            <SelectTrigger>
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
                          <label className="text-sm font-medium">Confidence Level</label>
                          <Select>
                            <SelectTrigger>
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
                        className="w-full"
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
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Data</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Database className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload your dataset to create visualizations</p>
                          <Button variant="outline" className="mt-2">Browse Files</Button>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Chart Type</label>
                          <Select>
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Theme</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="colorful">Colorful</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">X-Axis Column</label>
                          <Input placeholder="e.g., date, category, name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Y-Axis Column</label>
                          <Input placeholder="e.g., value, count, amount" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chart Title</label>
                        <Input placeholder="Enter a descriptive title for your chart" />
                      </div>
                      <Button 
                        onClick={() => handleRunTool(tool.id)}
                        disabled={isRunning}
                        className="w-full"
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

                  {/* Results Section */}
                  {results && activeTool === tool.id && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium text-green-800 dark:text-green-400">Results</span>
                      </div>
                      
                      {tool.id === "datashark" && results.data && (
                        <div className="space-y-3">
                          <p className="text-sm text-green-700 dark:text-green-300">{results.message}</p>
                          <div className="bg-white dark:bg-gray-800 rounded border p-3">
                            <div className="grid gap-2">
                              {results.data.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                  <span className="font-medium">{item.title}</span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-green-600">{item.price}</span>
                                    <span className="text-yellow-600">★ {item.rating}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download Results
                          </Button>
                        </div>
                      )}

                      {tool.id === "queryhammerhead" && results.answer && (
                        <div className="space-y-3">
                          <div className="bg-white dark:bg-gray-800 rounded border p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{results.answer}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Confidence:</span>
                              <span className="text-xs font-medium text-green-600">{results.confidence}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Export Analysis
                          </Button>
                        </div>
                      )}

                      {tool.id === "vizfin" && results.chartUrl && (
                        <div className="space-y-3">
                          <p className="text-sm text-green-700 dark:text-green-300">{results.message}</p>
                          <div className="bg-white dark:bg-gray-800 rounded border p-4 text-center">
                            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <BarChart3 className="w-12 h-12 text-gray-400" />
                              <span className="ml-2 text-gray-500">Chart Preview</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download Chart
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ScrollArea>
  )
} 