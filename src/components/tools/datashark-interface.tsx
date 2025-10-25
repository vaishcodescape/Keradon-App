"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Globe, Search, BarChart3, Trash2, Download, FileDown } from "lucide-react"
import { ErrorDisplay } from "./error-display"
import { LoadingIndicator } from "./loading-indicator"
import { Spinner } from "@/components/ui/spinner"
import { useDataShark } from "@/hooks/useDataShark"

export function DataSharkInterface() {
  const {
    url,
    setUrl,
    format,
    setFormat,
    isRunning,
    results,
    error,
    setError,
    progress,
    loadingStage,
    timeElapsed,
    handleScrape,
    handleAdvancedAnalysis,
    handleClearResults,
    copyToClipboard,
    copyStatus,
    dataRestored
  } = useDataShark();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800 dark:text-blue-400">DataShark</span>
          <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
            Powered by ScraperAPI
          </Badge>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          DataShark can extract structured data from any website using ScraperAPI. Enter the URL and configure your scraping parameters.
        </p>
      </div>

      <ErrorDisplay error={error} onClear={() => setError("")} />

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Website URL</span>
          </label>
          <Input 
            placeholder="https://example.com" 
            className="h-11 text-base"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isRunning}
            type="url"
            aria-label="Website URL to scrape"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {['https://news.ycombinator.com', 'https://example.com', 'https://httpbin.org/html'].map((exampleUrl) => (
              <Button
                key={exampleUrl}
                variant="outline"
                size="sm"
                onClick={() => setUrl(exampleUrl)}
                disabled={isRunning}
                className="text-xs h-6 px-2 py-1"
              >
                {exampleUrl.replace('https://', '')}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center justify-between">
            <span>Output Format</span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <FileDown className="w-3 h-3 mr-1" />
              PDF Export Available
            </Badge>
          </label>
          <Select value={format} onValueChange={setFormat} disabled={isRunning} aria-label="Output format selection">
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <span>JSON</span>
                  <span className="text-xs text-muted-foreground">Structured data</span>
                </div>
              </SelectItem>
              <SelectItem value="text">
                <div className="flex items-center gap-2">
                  <span>Text</span>
                  <span className="text-xs text-muted-foreground">Human readable</span>
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <span>CSV</span>
                  <span className="text-xs text-muted-foreground">Spreadsheet ready</span>
                </div>
              </SelectItem>
              <SelectItem value="xml">
                <div className="flex items-center gap-2">
                  <span>XML</span>
                  <span className="text-xs text-muted-foreground">Markup format</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border">
            {format === 'json' && (
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Best for APIs and structured data processing</span>
              </div>
            )}
            {format === 'text' && (
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Best for reading and simple text analysis</span>
              </div>
            )}
            {format === 'csv' && (
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Best for Excel, Google Sheets, and data analysis</span>
              </div>
            )}
            {format === 'xml' && (
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Best for systems that require XML format</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
        <Button 
          onClick={handleScrape}
          disabled={isRunning || !url.trim()}
          className="px-8 h-11 text-base font-semibold"
        >
          {isRunning ? (
            <>
              <Spinner className="size-4 mr-2" />
              Scraping...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Start Scraping
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleAdvancedAnalysis}
          disabled={isRunning || !url.trim()}
          className="px-6 h-11 text-base border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
        >
          {isRunning ? (
            <>
              <Spinner className="size-4 mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analysis
            </>
          )}
        </Button>
        {(results || error || url) && (
          <Button 
            variant="outline"
            onClick={handleClearResults}
            disabled={isRunning}
            className="px-6 h-11 text-base"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <LoadingIndicator 
        isRunning={isRunning}
        progress={progress}
        loadingStage={loadingStage}
        timeElapsed={timeElapsed}
        targetUrl={url}
      />

      {/* Results display would go here - simplified for now */}
      {results && (
        <div className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700"
              onClick={() => {
                const blob = new Blob([JSON.stringify(results.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${results.data.page?.domain || 'scraped-data'}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Scraping Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 