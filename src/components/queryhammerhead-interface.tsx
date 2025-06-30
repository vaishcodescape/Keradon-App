"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  HelpCircle, 
  Loader2, 
  Search,
  Upload,
  FileText,
  X
} from "lucide-react";
import { useQueryHammerhead, QueryMode, GroqModel } from "@/lib/queryhammerhead";

export function QueryHammerheadInterface() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<QueryMode>("analysis");
  const [model, setModel] = useState<GroqModel>("llama-3.3-70b-versatile");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [context, setContext] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { query: qhQuery } = useQueryHammerhead();

  // Dynamic placeholders and examples based on analysis type
  const getAnalysisTypeConfig = (mode: QueryMode) => {
    switch (mode) {
      case 'analysis':
        return {
          placeholder: "Perform statistical analysis on your data. e.g., 'Calculate correlation between sales and marketing spend', 'Identify customer segments based on purchase behavior', 'Analyze revenue trends by region'",
          examples: [
            "Perform customer segmentation analysis and identify high-value customer groups",
            "Calculate statistical significance of A/B test results",
            "Analyze seasonal patterns in sales data and forecast next quarter"
          ]
        };
      case 'research':
        return {
          placeholder: "Research insights and patterns in your data. e.g., 'What factors drive customer churn?', 'Research market trends in our industry', 'Investigate anomalies in user behavior'",
          examples: [
            "Research factors that influence customer retention rates",
            "Investigate correlations between product features and user satisfaction",
            "Analyze competitive landscape based on market data"
          ]
        };
      case 'code':
        return {
          placeholder: "Generate data processing code. e.g., 'Create Python script for data cleaning', 'Generate SQL queries for reporting', 'Build data transformation pipeline'",
          examples: [
            "Generate Python code for data cleaning and outlier detection",
            "Create SQL queries to extract customer lifetime value metrics",
            "Build a data preprocessing pipeline for machine learning"
          ]
        };
      case 'creative':
        return {
          placeholder: "Brainstorm visualization and presentation ideas. e.g., 'Design executive dashboard layout', 'Create compelling data story for board presentation', 'Suggest chart types for KPI tracking'",
          examples: [
            "Design compelling data visualization concepts for executive dashboard",
            "Create data storytelling framework for quarterly business review",
            "Suggest interactive chart types for customer analytics portal"
          ]
        };
      case 'debug':
        return {
          placeholder: "Identify data quality issues and problems. e.g., 'Find missing values and inconsistencies', 'Detect outliers and anomalies', 'Validate data integrity across systems'",
          examples: [
            "Identify data quality issues and missing value patterns",
            "Detect anomalies in transaction data that might indicate fraud",
            "Validate data consistency across multiple data sources"
          ]
        };
      case 'optimization':
        return {
          placeholder: "Optimize queries, processes, and performance. e.g., 'Improve database query performance', 'Optimize data pipeline efficiency', 'Reduce report generation time'",
          examples: [
            "Optimize SQL queries for faster reporting performance",
            "Improve data pipeline efficiency and reduce processing time",
            "Optimize dashboard loading speed and user experience"
          ]
        };
      default:
        return {
          placeholder: "What insights do you need from your data?",
          examples: []
        };
    }
  };

  const analysisConfig = getAnalysisTypeConfig(mode);

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    for (const file of files) {
      if (file.type.startsWith('text/') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        try {
          const content = await file.text();
          const fileContext = `\n\n--- File: ${file.name} ---\n${content.slice(0, 5000)}${content.length > 5000 ? '\n... (truncated)' : ''}`;
          setContext(prev => prev + fileContext);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileToRemove && context.includes(`--- File: ${fileToRemove.name} ---`)) {
      const fileContextPattern = new RegExp(`\\n\\n--- File: ${fileToRemove.name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')} ---[\\s\\S]*?(?=\\n\\n---|$)`, 'g');
      setContext(prev => prev.replace(fileContextPattern, '').trim());
    }
  };

  const handleClearAllFiles = () => {
    setUploadedFiles([]);
    setContext("");
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse("");
    try {
      let enhancedContext = context.trim();
      if (uploadedFiles.length > 0) {
        const fileInfo = uploadedFiles.map(f => `${f.name} (${f.type}, ${(f.size / 1024).toFixed(1)}KB)`).join(', ');
        enhancedContext = `Files uploaded: ${fileInfo}\n\n${enhancedContext}`;
      }
      const result = await qhQuery({
        query: query.trim(),
        mode,
        context: enhancedContext || undefined,
        model,
      });
      if (result.success) {
        setResponse(result.response || "");
      } else {
        setResponse(`Error: ${result.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* DataShark-style info header */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="h-4 w-4 text-purple-600" />
          <span className="font-medium text-purple-800 dark:text-purple-400">QueryHammerhead</span>
        </div>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Powerful AI-driven data analysis tool. Upload your datasets (CSV, JSON, TXT) and get statistical insights, patterns, and actionable recommendations.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Upload Data Files (Optional)</label>
          {uploadedFiles.length > 0 && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleClearAllFiles}
              className="text-xs h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              Clear All Files
            </Button>
          )}
        </div>
        <FileUpload 
          onChange={handleFileUpload} 
          onRemove={(fileIndex, file) => handleRemoveFile(fileIndex)}
        />
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded • Click × to remove individual files
            </p>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)}KB)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                  title={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Query Input Section */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">Your Query</label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={analysisConfig.placeholder}
          className="w-full min-h-[80px]"
        />
      </div>

      {/* Mode and Model Selection */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold">Analysis Type</label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="optimization">Optimization</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold">Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
              <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B</SelectItem>
              <SelectItem value="gemma2-9b-it">Gemma2 9B IT</SelectItem>
              <SelectItem value="llama3-70b-8192">Llama3 70B 8192</SelectItem>
              <SelectItem value="llama3-8b-8192">Llama3 8B 8192</SelectItem>
              <SelectItem value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill Llama 70B</SelectItem>
              <SelectItem value="qwen/qwen3-32b">Qwen3 32B</SelectItem>
              <SelectItem value="qwen-qwq-32b">Qwen QWQ 32B</SelectItem>
              <SelectItem value="mistral-saba-24b">Mistral Saba 24B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button onClick={handleSubmit} disabled={isLoading || !query.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Analyze
          </>
        )}
      </Button>

      {/* Response Section */}
      {response && (
        <div className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm">
          {response}
        </div>
      )}
    </div>
  );
} 