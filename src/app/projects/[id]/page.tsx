"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";
import { 
  ChevronRight, 
  Home, 
  Settings, 
  ArrowLeft, 
  Database, 
  BarChart3, 
  Globe, 
  Calendar,
  Tag,
  Users,
  Activity,
  Trash2,
  Edit
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectWithTools } from '@/lib/types/project';
import { QueryHammerheadInterface } from '@/components/queryhammerhead-interface';
import { VizFinInterface } from '@/components/vizfin-interface';

// Tool Components
const DataSharkTool = ({ projectId, onDataUpdate }: { projectId: string; onDataUpdate: () => void }) => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('json');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [recentScrapes, setRecentScrapes] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load recent scrapes for this project
  const fetchRecentScrapes = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/data?tool=datashark&limit=5`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRecentScrapes(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch recent scrapes:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRecentScrapes();
  }, [projectId, fetchRecentScrapes]);

  const handleScrape = async () => {
    if (!url.trim()) return;
    
    setIsRunning(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/tools/datashark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), format }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        
        // Save result to project
        const saveResponse = await fetch(`/api/projects/${projectId}/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_name: 'datashark',
            data_type: 'scraping_result',
            data: data.data,
            metadata: data.metadata
          }),
          credentials: 'include'
        });

        if (saveResponse.ok) {
          // Refresh recent scrapes and notify parent
          fetchRecentScrapes();
          onDataUpdate();
        }
      } else {
        setError(data.error || 'Scraping failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scraping Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                DataShark Web Scraper
              </CardTitle>
              <CardDescription>
                Extract and analyze data from websites with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <input
                    type="url"
                    placeholder="Enter website URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={isRunning}
                    onKeyDown={(e) => e.key === 'Enter' && !isRunning && url.trim() && handleScrape()}
                  />
                </div>
                <div>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={isRunning}
                  >
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleScrape}
                disabled={isRunning || !url.trim()}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loading size={16} className="mr-2" />
                    Scraping...
                  </>
                ) : (
                  'Start Scraping'
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Scraping Results</CardTitle>
                <CardDescription>
                  Data extracted from {results.data?.page?.domain || 'website'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="data">Raw Data</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4">
                    {results.data?.summary && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Elements</p>
                          <p className="text-2xl font-bold">{results.data.summary.totalElements}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Quality</p>
                          <p className="text-2xl font-bold">{results.data.summary.dataQuality}/100</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Richness</p>
                          <p className="text-xl font-bold">{results.data.summary.contentRichness}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <p className="text-xl font-bold">{results.data.summary.scrapingDifficulty}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="data">
                    <ScrollArea className="h-96 w-full">
                      <pre className="bg-muted/50 p-4 rounded-md text-sm">
                        {JSON.stringify(results.data, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="insights" className="space-y-4">
                    {results.data?.insights && (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Content Type</h4>
                          <p className="text-sm text-muted-foreground">{results.data.insights.contentType}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Business Type</h4>
                          <p className="text-sm text-muted-foreground">{results.data.insights.businessType}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Technical Complexity</h4>
                          <p className="text-sm text-muted-foreground">{results.data.insights.technicalComplexity}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                {/* Download Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dataStr = JSON.stringify(results.data, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `datashark-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Export as CSV
                      const csvData = typeof results.data === 'string' ? results.data :
                        Object.entries(results.data).map(([key, value]) =>
                          `"${key}","${JSON.stringify(value).replace(/"/g, '""')}"`
                        ).join('\n');
                      const blob = new Blob([`"Section","Data"\n${csvData}`], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `datashark-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Export as XML
                      const xmlData = typeof results.data === 'string' ? results.data :
                        (results.metadata?.format === 'xml' ? results.data : '<root>' + JSON.stringify(results.data) + '</root>');
                      const blob = new Blob([xmlData], { type: 'application/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `datashark-${new Date().toISOString().split('T')[0]}.xml`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    XML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Export as Text
                      const textData = typeof results.data === 'string' ? results.data : JSON.stringify(results.data, null, 2);
                      const blob = new Blob([textData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `datashark-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Scrapes Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Scrapes
              </CardTitle>
              <CardDescription>
                Latest scraping results for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentScrapes.length > 0 ? (
                <div className="space-y-3">
                  {recentScrapes.map((scrape, index) => (
                    <div key={scrape.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {scrape.data?.page?.domain || 'Unknown domain'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scrape.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {scrape.data_type}
                        </Badge>
                      </div>
                      {scrape.data?.summary && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {scrape.data.summary.totalElements} elements • 
                          Quality: {scrape.data.summary.dataQuality}/100
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scrapes yet</p>
                  <p className="text-xs">Start scraping to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function ProjectWorkspace() {
  const params = useParams();
  const router = useRouter();
  const { goBack } = useNavigation();
  const [project, setProject] = useState<ProjectWithTools | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setProject(data.project);
        setError('');
      } else {
        setError(data.error || 'Failed to load project');
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProject();
  }, [params.id, fetchProject]);

  // Handle data updates from tools
  const handleDataUpdate = () => {
    fetchProject(true);
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        goBack('/projects');
      } else {
        setError(data.error || 'Failed to delete project');
      }
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'datashark': return <Globe className="w-4 h-4" />;
      case 'queryhammerhead': return <Database className="w-4 h-4" />;
      case 'vizfin': return <BarChart3 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getToolDisplayName = (toolName: string) => {
    switch (toolName) {
      case 'datashark': return 'DataShark';
      case 'queryhammerhead': return 'QueryHammerhead';
      case 'vizfin': return 'VizFin';
      default: return toolName;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size={32} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
            <Button onClick={() => goBack('/projects')}>
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="p-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goBack('/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                {refreshing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loading size={16} />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {project.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{project.data_count} data items</span>
                <span>•</span>
                <span>{project.project_tools.length} tools enabled</span>
                <span>•</span>
                <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDataUpdate()}
              disabled={refreshing}
            >
              <Activity className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {project.project_tools.map((tool) => (
              <TabsTrigger key={tool.id} value={tool.tool_name} className="flex items-center gap-2">
                {getToolIcon(tool.tool_name)}
                {getToolDisplayName(tool.tool_name)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Info Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data Items</p>
                      <p className="text-lg font-bold">{project.data_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Visibility</p>
                      <Badge variant={project.is_public ? 'default' : 'outline'}>
                        {project.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{project.description || 'No description provided'}</p>
                  </div>
                  {project.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Tools</CardTitle>
                  <CardDescription>
                    Tools configured for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.project_tools.map((tool) => (
                      <div 
                        key={tool.id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setActiveTab(tool.tool_name)}
                      >
                        <div className="flex items-center gap-3">
                          {getToolIcon(tool.tool_name)}
                          <div>
                            <p className="font-medium">{getToolDisplayName(tool.tool_name)}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(tool.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={tool.is_enabled ? 'default' : 'secondary'}>
                            {tool.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    
                    {project.project_tools.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tools configured</p>
                        <p className="text-xs">Add tools to get started with data processing</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tool Tabs */}
          {project.project_tools.map((tool) => (
            <TabsContent key={tool.id} value={tool.tool_name} className="space-y-6">
              {tool.tool_name === 'datashark' && (
                <DataSharkTool projectId={project.id} onDataUpdate={handleDataUpdate} />
              )}
              {tool.tool_name === 'queryhammerhead' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        QueryHammerhead
                      </CardTitle>
                      <CardDescription>
                        LLM-powered data analysis and querying
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QueryHammerheadInterface />
                    </CardContent>
                  </Card>
                </div>
              )}
              {tool.tool_name === 'vizfin' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        VizFin
                      </CardTitle>
                      <CardDescription>
                        Create beautiful visualizations from your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VizFinInterface />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Delete Project
                </CardTitle>
                <CardDescription>
                  This action cannot be undone. This will permanently delete the project and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    &quot;{project?.name}&quot;
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This will delete {project?.data_count} data items and {project?.project_tools.length} tool configurations.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProject}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loading size={16} className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 