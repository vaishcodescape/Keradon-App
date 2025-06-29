'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, LineChart, PieChart, Download, AlertCircle, TrendingUp, Database, FileText, Sparkles, MessageSquare, Lightbulb, Target, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface VizFinData {
  data: any[];
  columns: string[];
  insights: any;
  metadata: any;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export function VizFinInterface() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [chartTitle, setChartTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<VizFinData | null>(null);
  const [error, setError] = useState<string>('');
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlResponse, setNlResponse] = useState<string>('');
  const [isNlLoading, setIsNlLoading] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    setResults(null);
    setError('');
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setResults(null);
    setError('');
  };

  const handleGenerateChart = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a file first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFiles[0]);
      formData.append('chartType', chartType);
      formData.append('xAxis', xAxis);
      formData.append('yAxis', yAxis);
      formData.append('chartTitle', chartTitle);

      const response = await fetch('/api/tools/vizfin', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setResults(data);
      
      // Auto-populate axis fields if they were auto-detected
      if (data.metadata?.xAxis && !xAxis) {
        setXAxis(data.metadata.xAxis);
      }
      if (data.metadata?.yAxis && !yAxis) {
        setYAxis(data.metadata.yAxis);
      }
      
      // Update chart type if LLM recommends a different one
      if (data.metadata?.recommendedChartType && data.metadata.recommendedChartType !== chartType) {
        setChartType(data.metadata.recommendedChartType);
      }
    } catch (err) {
      console.error('Error generating chart:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate chart');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!results) return null;

    const { data, metadata } = results;
    const { chartType: type, xAxis: xCol, yAxis: yCol } = metadata;

    // Validate data and axes
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="w-6 h-6 mr-2" />
          No data available for chart
        </div>
      );
    }

    if (!xCol || !yCol) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="w-6 h-6 mr-2" />
          Missing axis configuration
        </div>
      );
    }

    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yCol} stroke="#8884d8" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={yCol} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.slice(0, 10).map((item, index) => ({
          name: item[xCol] || `Item ${index + 1}`,
          value: parseFloat(item[yCol]) || 0,
          fill: CHART_COLORS[index % CHART_COLORS.length]
        })).filter(item => item.value > 0);
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xCol} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yCol} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const downloadChart = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vizfin-${results.metadata.fileName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNaturalLanguageQuery = async () => {
    if (!nlQuery.trim() || !results) return;

    setIsNlLoading(true);
    setNlResponse('');

    try {
      const response = await fetch('/api/tools/vizfin/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: nlQuery,
          chartData: results.data,
          metadata: results.metadata
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNlResponse(data.response);
      } else {
        setNlResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setNlResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsNlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Header */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <span className="font-medium text-orange-800 dark:text-orange-400">VizFin AI</span>
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </div>
        <p className="text-sm text-orange-700 dark:text-orange-300">
          Transform your data into beautiful, interactive visualizations with AI-powered insights. Upload CSV or JSON files and get intelligent chart recommendations, auto-generated insights, and natural language querying.
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onChange={handleFileUpload}
            onRemove={handleRemoveFile}
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-medium">{uploadedFiles[0].name}</span>
                <Badge variant="outline">
                  {(uploadedFiles[0].size / 1024).toFixed(1)}KB
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-4 h-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Area Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Title</label>
              <Input 
                placeholder="Enter chart title" 
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis Column <span className="text-xs text-muted-foreground">(optional - auto-detected)</span></label>
              <Input 
                placeholder="e.g., date, category, name" 
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis Column <span className="text-xs text-muted-foreground">(optional - auto-detected)</span></label>
              <Input 
                placeholder="e.g., value, count, amount" 
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <p><strong>Tip:</strong> You can leave X-Axis and Y-Axis empty - VizFin will automatically detect the best columns for your chart based on your data types.</p>
          </div>

          {/* AI Chart Recommendation */}
          {results && results.insights.llmInsights?.recommendedChartType && 
           results.insights.llmInsights.recommendedChartType !== chartType && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-400">
                    AI Recommendation: 
                  </span>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    {results.insights.llmInsights.recommendedChartType.charAt(0).toUpperCase() + 
                     results.insights.llmInsights.recommendedChartType.slice(1)} Chart
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setChartType(results.insights.llmInsights.recommendedChartType)}
                  className="text-purple-700 border-purple-300 hover:bg-purple-100"
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Based on your data structure, a {results.insights.llmInsights.recommendedChartType} chart might work better.
              </p>
            </div>
          )}

          {results && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Available Columns:</p>
              <div className="flex flex-wrap gap-1">
                                 {results.columns.map((col: string, index: number) => (
                   <Badge key={index} variant="secondary" className="text-xs">
                     {col}
                   </Badge>
                 ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerateChart}
            disabled={isLoading || uploadedFiles.length === 0}
            className="w-full"
          >
            {isLoading ? (
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
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Chart Display */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{results.metadata.title}</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadChart}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* AI-Powered Insights */}
          {results.insights.llmInsights && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Insights
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Powered by LLM</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Insights */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Key Insights
                  </h4>
                  <ul className="space-y-1">
                    {results.insights.llmInsights.keyInsights?.map((insight: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Story */}
                {results.insights.llmInsights.dataStory && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      Data Story
                    </h4>
                    <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      {results.insights.llmInsights.dataStory}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {results.insights.llmInsights.recommendations && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Target className="w-4 h-4 text-green-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {results.insights.llmInsights.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Business Implications */}
                {results.insights.llmInsights.businessImplications && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Business Impact
                    </h4>
                    <ul className="space-y-1">
                      {results.insights.llmInsights.businessImplications.map((impl: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-1">⚡</span>
                          {impl}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Natural Language Query */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Ask Questions About Your Data
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Natural Language</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ask questions about your data... e.g., 'What are the main trends?', 'Which category has the highest values?', 'Are there any outliers?'"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button 
                  onClick={handleNaturalLanguageQuery}
                  disabled={isNlLoading || !nlQuery.trim() || !results}
                  className="w-full"
                >
                  {isNlLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask AI About Data
                    </>
                  )}
                </Button>
              </div>

              {nlResponse && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-2">AI Response:</h5>
                  <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                    {nlResponse}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Traditional Data Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Technical Data Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Dataset Overview</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">{results.insights.totalRows}</span> rows</p>
                    <p><span className="font-medium">{results.insights.totalColumns}</span> columns</p>
                    <p><span className="font-medium">{results.metadata.fileSize}</span> bytes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Column Types</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">{results.insights.numericColumns.length}</span> numeric</p>
                    <p><span className="font-medium">{results.insights.textColumns.length}</span> text</p>
                    <p><span className="font-medium">{results.insights.dateColumns.length}</span> date</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Chart Compatibility</p>
                  <div className="space-y-1 text-sm">
                    {results.insights.numericColumns.length > 0 && (
                      <p>✓ Good for numeric charts</p>
                    )}
                    {results.insights.dateColumns.length > 0 && (
                      <p>✓ Time series ready</p>
                    )}
                    {results.insights.textColumns.length > 0 && (
                      <p>✓ Category data available</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <p className="text-sm font-medium">Suggested Columns:</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">For X-Axis (Categories):</p>
                    <div className="flex flex-wrap gap-1">
                                             {[...results.insights.textColumns, ...results.insights.dateColumns].map((col: string, index: number) => (
                         <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setXAxis(col)}>
                           {col}
                         </Badge>
                       ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">For Y-Axis (Values):</p>
                    <div className="flex flex-wrap gap-1">
                                             {results.insights.numericColumns.map((col: string, index: number) => (
                         <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-muted"
                                onClick={() => setYAxis(col)}>
                           {col}
                         </Badge>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 