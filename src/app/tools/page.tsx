"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Home, BarChart3, Globe, HelpCircle, Upload, Search, Database, Activity, Clock, Zap, Command, Download, ExternalLink, Mail, Phone, Calendar, DollarSign, Hash, AtSign, MapPin, FileText, Users, Link as LinkIcon, Trash2, FileDown, Copy, Check, X, AlertTriangle, CheckCircle, XCircle, Eye, Star, Target, TrendingDown, Briefcase, Cpu, LayoutGrid, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"
import { QueryHammerheadInterface } from "@/components/queryhammerhead-interface"
import { VizFinInterface } from "@/components/vizfin-interface"
import jsPDF from 'jspdf'

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
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [copyStatus, setCopyStatus] = useState<{[key: string]: 'idle' | 'copying' | 'success' | 'error'}>({});
  const [dataRestored, setDataRestored] = useState(false);
  
  // DataShark form state
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("text");
  
  // Advanced analysis state
  const [advancedData, setAdvancedData] = useState<any>(null);
  const [showAdvancedReport, setShowAdvancedReport] = useState(false);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('datashark-results');
      const savedUrl = localStorage.getItem('datashark-url');
      const savedFormat = localStorage.getItem('datashark-format');
      const savedError = localStorage.getItem('datashark-error');
      
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
        setDataRestored(true);
        console.log('🔄 Restored saved DataShark results from localStorage');
        
        // Hide the restored indicator after 5 seconds
        setTimeout(() => {
          setDataRestored(false);
        }, 5000);
      }
      
      if (savedUrl) {
        setUrl(savedUrl);
      }
      
      if (savedFormat) {
        setFormat(savedFormat);
      }
      
      if (savedError) {
        setError(savedError);
      }
    } catch (err) {
      console.error('❌ Failed to restore saved state:', err);
      // Clear corrupted data
      localStorage.removeItem('datashark-results');
      localStorage.removeItem('datashark-url');
      localStorage.removeItem('datashark-format');
      localStorage.removeItem('datashark-error');
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (results) {
      try {
        const dataToSave = {
          ...results,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('datashark-results', JSON.stringify(dataToSave));
        console.log('💾 Saved DataShark results to localStorage');
      } catch (err) {
        console.error('❌ Failed to save results to localStorage:', err);
      }
    } else {
      localStorage.removeItem('datashark-results');
    }
  }, [results]);

  // Save form state to localStorage
  useEffect(() => {
    if (url) {
      localStorage.setItem('datashark-url', url);
    } else {
      localStorage.removeItem('datashark-url');
    }
  }, [url]);

  useEffect(() => {
    localStorage.setItem('datashark-format', format);
  }, [format]);

  // Save error state to localStorage
  useEffect(() => {
    if (error) {
      localStorage.setItem('datashark-error', error);
    } else {
      localStorage.removeItem('datashark-error');
    }
  }, [error]);

  // Enhanced copy to clipboard function
  const copyToClipboard = async (text: string, buttonId: string) => {
    setCopyStatus(prev => ({ ...prev, [buttonId]: 'copying' }));
    
    try {
      // Check if the Clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Copy command failed');
        }
      }
      
      setCopyStatus(prev => ({ ...prev, [buttonId]: 'success' }));
      console.log('✅ Data copied to clipboard successfully');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [buttonId]: 'idle' }));
      }, 2000);
      
    } catch (err) {
      console.error('❌ Failed to copy data:', err);
      setCopyStatus(prev => ({ ...prev, [buttonId]: 'error' }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [buttonId]: 'idle' }));
      }, 3000);
    }
  };

  // PDF generation function
  const generatePDF = (data: any, metadata: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * (fontSize * 0.5) + 5;
    };

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      yPosition += 10;
      addText(title, 16, true);
      yPosition += 5;
    };

    try {
      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DataShark Scraping Report', margin, yPosition);
      yPosition += 30;

      // Metadata section
      addSectionHeader('Report Information');
      addText(`URL: ${metadata.url}`);
      addText(`Scraped: ${new Date(metadata.timestamp).toLocaleString()}`);
      addText(`Elements Found: ${metadata.elementsFound}`);
      addText(`Scraper: ${metadata.scraperUsed}`);
      addText(`Format: ${metadata.format}`);

      if (typeof data === 'object' && data !== null) {
        // Page Information
        if (data.page) {
          addSectionHeader('Page Information');
          addText(`Title: ${data.page.title || 'N/A'}`);
          addText(`Domain: ${data.page.domain || 'N/A'}`);
          addText(`Protocol: ${data.page.protocol || 'N/A'}`);
        }

        // SEO Information
        if (data.seo?.meta) {
          addSectionHeader('SEO Information');
          if (data.seo.meta.description) addText(`Description: ${data.seo.meta.description}`);
          if (data.seo.meta.keywords) addText(`Keywords: ${data.seo.meta.keywords}`);
          if (data.seo.meta.author) addText(`Author: ${data.seo.meta.author}`);
        }

        // Headings
        if (data.seo?.headings) {
          addSectionHeader('Page Structure');
          addText(`H1 Tags: ${data.seo.headings.h1?.length || 0}`);
          addText(`H2 Tags: ${data.seo.headings.h2?.length || 0}`);
          addText(`H3 Tags: ${data.seo.headings.h3?.length || 0}`);
          
          if (data.seo.headings.h1?.length > 0) {
            addText('H1 Headings:', 12, true);
            data.seo.headings.h1.slice(0, 5).forEach((h1: string) => {
              addText(`• ${h1}`);
            });
          }
        }

        // Contact Information
        if (data.contact) {
          addSectionHeader('Contact Information');
          if (data.contact.phones?.length > 0) {
            addText('Phone Numbers:', 12, true);
            data.contact.phones.slice(0, 5).forEach((phone: string) => {
              addText(`• ${phone}`);
            });
          }
          if (data.contact.emails?.length > 0) {
            addText('Email Addresses:', 12, true);
            data.contact.emails.slice(0, 5).forEach((email: string) => {
              addText(`• ${email}`);
            });
          }
          if (data.contact.addresses?.length > 0) {
            addText('Addresses:', 12, true);
            data.contact.addresses.slice(0, 3).forEach((address: string) => {
              addText(`• ${address}`);
            });
          }
        }

        // Business Information
        if (data.business) {
          addSectionHeader('Business Information');
          if (data.business.companyName) addText(`Company: ${data.business.companyName}`);
          if (data.business.services?.length > 0) {
            addText('Services:', 12, true);
            data.business.services.slice(0, 10).forEach((service: string) => {
              addText(`• ${service}`);
            });
          }
          if (data.business.products?.length > 0) {
            addText('Products:', 12, true);
            data.business.products.slice(0, 10).forEach((product: string) => {
              addText(`• ${product}`);
            });
          }
          if (data.business.pricing?.length > 0) {
            addText('Pricing Information:', 12, true);
            data.business.pricing.slice(0, 5).forEach((price: string) => {
              addText(`• ${price}`);
            });
          }
        }

        // Technical Information
        if (data.technical) {
          addSectionHeader('Technical Analysis');
          if (data.technical.technologies?.length > 0) {
            addText(`Technologies: ${data.technical.technologies.join(', ')}`);
          }
          if (data.technical.frameworks?.length > 0) {
            addText(`Frameworks: ${data.technical.frameworks.join(', ')}`);
          }
          if (data.technical.analytics?.length > 0) {
            addText(`Analytics: ${data.technical.analytics.join(', ')}`);
          }
        }

        // Links Analysis
        if (data.links) {
          addSectionHeader('Links Analysis');
          addText(`Total Links: ${data.links.all?.length || 0}`);
          addText(`External Links: ${data.links.external?.length || 0}`);
          addText(`Internal Links: ${data.links.internal?.length || 0}`);
          addText(`Social Media Links: ${data.links.social?.length || 0}`);
          addText(`Email Links: ${data.links.email?.length || 0}`);
          addText(`Phone Links: ${data.links.phone?.length || 0}`);
        }

        // Media Information
        if (data.media) {
          addSectionHeader('Media Analysis');
          addText(`Total Images: ${data.media.images?.count || 0}`);
          addText(`Images with Alt Text: ${data.media.images?.withAltText || 0}`);
          addText(`Accessibility Score: ${data.media.images?.accessibilityScore || 0}%`);
          if (data.media.multimedia?.length > 0) {
            addText(`Multimedia Elements: ${data.media.multimedia.length}`);
          }
          if (data.media.downloads?.length > 0) {
            addText(`Downloadable Files: ${data.media.downloads.length}`);
          }
        }

        // Interactive Content
        if (data.interactive) {
          addSectionHeader('Interactive Content');
          addText(`Forms: ${data.interactive.forms?.length || 0}`);
          addText(`Tables: ${data.interactive.tables?.length || 0}`);
          addText(`FAQs: ${data.interactive.faqs?.length || 0}`);
          addText(`Testimonials: ${data.interactive.testimonials?.length || 0}`);
        }

        // Summary
        if (data.summary) {
          addSectionHeader('Summary');
          addText(`Total Elements: ${data.summary.totalElements || 0}`);
          addText(`Content Richness: ${data.summary.contentRichness || 'N/A'}`);
          addText(`Data Quality: ${data.summary.dataQuality || 0}%`);
          addText(`Scraping Difficulty: ${data.summary.scrapingDifficulty || 'N/A'}`);
        }
      } else {
        // Handle text format data
        addSectionHeader('Scraped Content');
        if (typeof data === 'string') {
          const lines = data.split('\n');
          lines.forEach((line: string) => {
            if (line.trim()) {
              addText(line.trim());
            }
          });
        } else {
          addText(JSON.stringify(data, null, 2));
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated by DataShark on ${new Date().toLocaleString()}`, margin, pageHeight - 10);

      // Save the PDF
      const filename = `datashark-report-${Date.now()}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

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

  const handleDataSharkScrape = async () => {
    // Clear previous error state
    setError("");
    
    // Enhanced client-side validation
    if (!url.trim()) {
      setError("❌ Please enter a valid URL");
      return;
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch (urlError) {
      setError("❌ Invalid URL format. Please enter a valid URL (e.g., https://example.com)");
      console.error('URL parsing error:', urlError);
      return;
    }

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setError("❌ Please use HTTP or HTTPS protocol");
      return;
    }

    // Check for valid hostname
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      setError("❌ Please enter a valid domain name");
      return;
    }

    // Check for localhost/private IPs (security measure)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.includes('0.0.0.0')) {
      setError("🔒 Cannot scrape localhost or private IP addresses for security reasons");
      return;
    }

    // Validate format
    const validFormats = ['text', 'json', 'csv', 'xml'];
    if (!validFormats.includes(format)) {
      setError("❌ Invalid output format selected");
      return;
    }

    // Set loading state
    setIsRunning(true);
    setResults(null);
    setProgress(0);
    setLoadingStage("Initializing...");
    setTimeElapsed(0);

    // Start timer for elapsed time
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Progress simulation stages
    const progressStages = [
      { stage: "Initializing...", progress: 5, delay: 200 },
      { stage: "Connecting to ScraperAPI...", progress: 15, delay: 500 },
      { stage: "Sending request to target website...", progress: 25, delay: 800 },
      { stage: "Waiting for website response...", progress: 40, delay: 1000 },
      { stage: "Processing HTML content...", progress: 60, delay: 1200 },
      { stage: "Extracting data patterns...", progress: 75, delay: 1500 },
      { stage: "Analyzing business intelligence...", progress: 85, delay: 1800 },
      { stage: "Finalizing results...", progress: 95, delay: 2000 }
    ];

    // Track if operation is still running
    let operationRunning = true;

    // Simulate progress stages
    const progressSimulation = async () => {
      for (const { stage, progress, delay } of progressStages) {
        if (!operationRunning) break;
        await new Promise(resolve => setTimeout(resolve, delay));
        if (operationRunning) {
          setLoadingStage(stage);
          setProgress(progress);
        }
      }
    };

    // Start progress simulation
    progressSimulation();

    // Create abort controller for request timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 60000); // 60 second timeout

    try {
      console.log(`🚀 Starting DataShark scrape for: ${url.trim()}`);
      
      const response = await fetch('/api/tools/datashark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          format: format
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid response format from server');
      }

      if (data.success) {
        setLoadingStage("Completed successfully!");
        setProgress(100);
        setTimeout(() => {
          setResults(data);
          console.log('✅ DataShark scraping completed successfully');
        }, 500);
      } else {
        const errorMessage = data.error || 'Unknown error occurred';
        console.error('DataShark API error:', errorMessage);
        
        // Enhanced error handling with specific user-friendly messages
        if (errorMessage.includes('ScraperAPI key not configured') || errorMessage.includes('SCRAPER_API_KEY')) {
          setError('⚠️ ScraperAPI not configured. Please add your SCRAPER_API_KEY to .env.local file. Get your API key at scraperapi.com');
        } else if (errorMessage.includes('Invalid URL format')) {
          setError('❌ Invalid URL format. Please enter a valid website URL (e.g., https://example.com)');
        } else if (errorMessage.includes('URL must use HTTP or HTTPS')) {
          setError('❌ Please use a valid HTTP or HTTPS URL');
        } else if (errorMessage.includes('Request timeout') || errorMessage.includes('timeout')) {
          setError('⏱️ Request timeout. The website took too long to respond. Please try again.');
        } else if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('rate limit')) {
          setError('🚦 Rate limit exceeded. Please wait a moment before making another request.');
        } else if (errorMessage.includes('Access forbidden') || errorMessage.includes('403')) {
          setError('🚫 Access forbidden. The website may be blocking scraping requests.');
        } else if (errorMessage.includes('Website not found') || errorMessage.includes('404')) {
          setError('🔍 Website not found. Please check the URL and try again.');
        } else if (errorMessage.includes('Network error') || errorMessage.includes('ENOTFOUND')) {
          setError('🌐 Network error. Please check your internet connection and try again.');
        } else if (errorMessage.includes('Invalid ScraperAPI key') || errorMessage.includes('unauthorized')) {
          setError('🔑 Invalid ScraperAPI key. Please check your SCRAPER_API_KEY environment variable.');
        } else if (errorMessage.includes('website is currently unavailable') || errorMessage.includes('502') || errorMessage.includes('503')) {
          setError('🚧 The website is currently unavailable. Please try again later.');
        } else if (errorMessage.includes('empty content') || errorMessage.includes('no content')) {
          setError('📄 The website returned empty content. Please try a different URL.');
        } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
          setError('🔐 SSL certificate error. The website may have security issues.');
        } else if (errorMessage.includes('redirect') || errorMessage.includes('too many redirects')) {
          setError('🔄 Too many redirects. The website may have configuration issues.');
        } else if (errorMessage.includes('blocked') || errorMessage.includes('bot')) {
          setError('🤖 Request blocked. The website may be blocking automated requests.');
        } else {
          setError(`❌ ${errorMessage}`);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('DataShark fetch error:', err);
      
      // Handle different types of errors
      if (err.name === 'AbortError') {
        setError('⏱️ Request timeout. The operation took too long to complete. Please try again.');
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('🌐 Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('Invalid response format')) {
        setError('🔧 Server error. Invalid response format received.');
      } else if (err.message?.includes('HTTP 500')) {
        setError('🔧 Server error. Please try again later.');
      } else if (err.message?.includes('HTTP 429')) {
        setError('🚦 Too many requests. Please wait a moment before trying again.');
      } else if (err.message?.includes('HTTP 403')) {
        setError('🚫 Access denied. The server rejected the request.');
      } else {
        setError(`❌ Network error: ${err.message || 'Unable to connect to the server'}`);
      }
    } finally {
      operationRunning = false;
      clearInterval(timerInterval);
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsRunning(false);
        setProgress(0);
        setLoadingStage("");
        setTimeElapsed(0);
      }, 1000);
    }
  };

  const handleClearResults = () => {
    setResults(null);
    setError("");
    setUrl("");
    setFormat("text");
    setProgress(0);
    setLoadingStage("");
    setTimeElapsed(0);
    setCopyStatus({});
    
    // Clear localStorage data
    localStorage.removeItem('datashark-results');
    localStorage.removeItem('datashark-url');
    localStorage.removeItem('datashark-format');
    localStorage.removeItem('datashark-error');
    console.log('🗑️ Cleared saved DataShark data from localStorage');
  };

  const handleRunTool = async (toolId: string) => {
    if (toolId === 'datashark') {
      await handleDataSharkScrape();
    } else {
      setIsRunning(true);
      setActiveTool(toolId);
      setProgress(0);
      setLoadingStage("Initializing tool...");
      setTimeElapsed(0);

      // Start timer for other tools
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Simulate progress for other tools
      const otherToolProgress = [
        { stage: "Loading tool configuration...", progress: 20, delay: 400 },
        { stage: "Processing data...", progress: 60, delay: 800 },
        { stage: "Generating results...", progress: 90, delay: 600 },
        { stage: "Completed!", progress: 100, delay: 200 }
      ];

      try {
        for (const { stage, progress, delay } of otherToolProgress) {
          setLoadingStage(stage);
          setProgress(progress);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        clearInterval(timerInterval);
        setTimeout(() => {
          setIsRunning(false);
          setProgress(0);
          setLoadingStage("");
          setTimeElapsed(0);
        }, 500);
      }
    }
  };

  // Advanced analysis function
  const handleAdvancedAnalysis = async () => {
    if (!url) return;
    
    setIsRunning(true);
    setError('');
    setAdvancedData(null);
    setProgress(0);
    setLoadingStage("Initializing advanced analysis...");
    setTimeElapsed(0);
    
    // Start timer for elapsed time
    const timerInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    try {
      // Advanced analysis progress simulation
      const advancedProgressSteps = [
        { stage: "Connecting to website...", progress: 15, delay: 800 },
        { stage: "Fetching page content...", progress: 30, delay: 1200 },
        { stage: "Analyzing SEO factors...", progress: 50, delay: 1500 },
        { stage: "Scanning for pricing data...", progress: 65, delay: 1000 },
        { stage: "Evaluating content quality...", progress: 80, delay: 1200 },
        { stage: "Generating insights...", progress: 95, delay: 800 },
      ];
      
      // Run progress simulation
      for (const { stage, progress, delay } of advancedProgressSteps) {
        setLoadingStage(stage);
        setProgress(progress);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Make the actual API call
      setLoadingStage("Processing advanced analysis...");
      setProgress(98);
      
      const response = await fetch('/api/tools/datashark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format: 'json'
        }),
      });

      const result = await response.json();
      
      setProgress(100);
      setLoadingStage("Analysis complete!");
      
      if (result.success) {
        setAdvancedData(result.data);
        setShowAdvancedReport(true);
      } else {
        setError(result.error || 'Advanced analysis failed');
      }
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      setError('Network error occurred during advanced analysis');
    } finally {
      clearInterval(timerInterval);
      setTimeout(() => {
        setIsRunning(false);
        setProgress(0);
        setLoadingStage("");
        setTimeElapsed(0);
      }, 500);
    }
  };

  // Helper functions for advanced report
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
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
                            <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary">
                              <Activity className="w-4 h-4 mr-2" />
                              {tools.length} Active Tools
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                              All Systems Operational
                            </Badge>
                          </div>
        </div>

        <Card className="bg-gradient-to-r from-muted/30 to-muted/20 border-muted/50">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Quick Access:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTool(tool.id)}
                    className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                  >
                    <tool.icon className="w-3 h-3" />
                    <span className="text-xs font-medium hidden sm:inline">{tool.name}</span>
                    <span className="text-xs opacity-60 ml-1">
                      {tool.shortcut}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Command className="w-3 h-3" />
                <span className="hidden md:inline">Use keyboard shortcuts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {tools.map((tool) => (
          <div key={tool.id} className={activeTool === tool.id ? 'block' : 'hidden'}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-6">
              {/* Tool Info Card */}
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

              {/* Tool Interface Card */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
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
                          <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                            Powered by ScraperAPI
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          DataShark can extract structured data from any website using ScraperAPI. Enter the URL and configure your scraping parameters.
                        </p>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-5 h-5 bg-red-500 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">!</span>
                              </div>
                              <div className="flex-1">
                                <div className="text-red-800 dark:text-red-400 font-medium mb-1">Scraping Error</div>
                                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                                {error.includes('ScraperAPI') && (
                                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    💡 Tip: You can get a free ScraperAPI key at{' '}
                                    <a 
                                      href="https://scraperapi.com" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="underline hover:no-underline font-medium"
                                    >
                                      scraperapi.com
                                    </a>
                                  </div>
                                )}
                                {error.includes('timeout') && (
                                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    💡 Tip: Try a simpler website or check if the URL is accessible in your browser
                                  </div>
                                )}
                                {error.includes('blocked') && (
                                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    💡 Tip: Some websites block automated requests. Try a different website or check robots.txt
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setError("")}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 p-1 h-6 w-6"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      )}

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
                            disabled={isRunning && activeTool === tool.id}
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
                                disabled={isRunning && activeTool === tool.id}
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
                          <Select value={format} onValueChange={setFormat} disabled={isRunning && activeTool === tool.id} aria-label="Output format selection">
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
                          onClick={() => handleRunTool(tool.id)}
                          disabled={isRunning || !url.trim()}
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
                        <Button 
                          variant="outline" 
                          onClick={handleAdvancedAnalysis}
                          disabled={isRunning || !url.trim()}
                          className="px-6 h-11 text-base border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                        >
                          {isRunning && activeTool === tool.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
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

                      {/* Enhanced Loading State Indicator */}
                      {isRunning && activeTool === tool.id && (
                        <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                <div className="absolute inset-0 rounded-full h-6 w-6 border-2 border-blue-200 dark:border-blue-800"></div>
                              </div>
                              <div className="flex-1">
                                <div className="text-blue-800 dark:text-blue-400 font-semibold text-lg">DataShark Active</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                  Target: {url ? (() => {
                                    try {
                                      return new URL(url).hostname;
                                    } catch {
                                      return url;
                                    }
                                  })() : 'website'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress}%</div>
                              <div className="text-xs text-blue-500 dark:text-blue-400">{timeElapsed}s elapsed</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{loadingStage}</span>
                              <span className="text-xs text-blue-600 dark:text-blue-400">ETA: {Math.max(0, 60 - timeElapsed)}s</span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-sm relative"
                                style={{width: `${progress}%`}}
                              >
                                <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                                {progress > 0 && progress < 100 && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress Steps */}
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <Badge variant={progress >= 25 ? "default" : "secondary"} className={`flex items-center gap-1 justify-center ${progress >= 25 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              Connect
                            </Badge>
                            <Badge variant={progress >= 50 ? "default" : "secondary"} className={`flex items-center gap-1 justify-center ${progress >= 50 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              Fetch
                            </Badge>
                            <Badge variant={progress >= 75 ? "default" : "secondary"} className={`flex items-center gap-1 justify-center ${progress >= 75 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              Extract
                            </Badge>
                            <Badge variant={progress >= 100 ? "default" : "secondary"} className={`flex items-center gap-1 justify-center ${progress >= 100 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              Complete
                            </Badge>
                          </div>

                          {/* Additional Info */}
                          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                              <div className="flex items-center space-x-4">
                                <span>Aggressive extraction enabled</span>
                                <span>Enhanced ScraperAPI mode</span>
                              </div>
                              <span>Max timeout: 60s</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advanced Analysis Report */}
                      {showAdvancedReport && advancedData && (
                        <div className="mt-8 space-y-6 p-6 bg-background border rounded-lg shadow-lg">
                          <div className="flex items-center justify-between pb-4 border-b">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold">
                                  Advanced Website Analysis
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Comprehensive SEO, pricing, and content insights
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAdvancedReport(false)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Close Report
                            </Button>
                          </div>

                          {/* Header Summary */}
                          {advancedData.page && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <Globe className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-semibold">
                                        {advancedData.page.title || 'Website Analysis'}
                                      </h4>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <LinkIcon className="h-3 w-3" />
                                          {advancedData.page.domain}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {new Date(advancedData.page.lastScraped).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    Analysis Complete
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                            </Card>
                          )}

                          {/* Quick Metrics Overview */}
                          {advancedData.summary && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">SEO Health</p>
                                      <p className={`text-2xl font-bold ${getScoreColor(advancedData.summary.seoScore)}`}>
                                        {advancedData.summary.seoScore}<span className="text-sm text-muted-foreground">/100</span>
                                      </p>
                                      <Progress value={advancedData.summary.seoScore} className="h-2" />
                                    </div>
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <Search className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Content Quality</p>
                                      <p className={`text-2xl font-bold ${getScoreColor(advancedData.summary.contentScore)}`}>
                                        {advancedData.summary.contentScore}<span className="text-sm text-muted-foreground">/100</span>
                                      </p>
                                      <Progress value={advancedData.summary.contentScore} className="h-2" />
                                    </div>
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Price Alerts</p>
                                      <p className="text-xl font-bold">
                                        {advancedData.summary.priceAlertsActive ? (
                                          <span className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Active
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            None
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <TrendingDown className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Commercial Value</p>
                                      <p className="text-xl font-bold">
                                        {advancedData.summary.commercialValue ? (
                                          <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Detected
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            None
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <DollarSign className="h-4 w-4" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {/* Detailed Analysis Tabs */}
                          <Tabs defaultValue="seo" className="w-full">
                            <TabsList className="flex w-full justify-start">
                              <TabsTrigger value="seo" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                <span>SEO Health</span>
                              </TabsTrigger>
                              <TabsTrigger value="pricing" className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                <span>Price Tracking</span>
                              </TabsTrigger>
                              <TabsTrigger value="content" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Content Blueprint</span>
                              </TabsTrigger>
                            </TabsList>

                            {/* SEO Health Tab */}
                            <TabsContent value="seo" className="space-y-6 mt-6">
                              {advancedData?.seoHealth && (
                                <>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                            <span className="text-lg">🕸️</span>
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-semibold">SEO Health Score</h3>
                                            <p className="text-sm text-muted-foreground">
                                              Comprehensive analysis across 10 key factors
                                            </p>
                                          </div>
                                        </div>
                                        <Badge variant={getScoreBadgeVariant(advancedData.seoHealth.overallScore)}>
                                          {advancedData.seoHealth.healthLevel}
                                        </Badge>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <span className="text-base font-medium">Overall Score</span>
                                          <span className={`text-3xl font-bold ${getScoreColor(advancedData.seoHealth.overallScore)}`}>
                                            {advancedData.seoHealth.overallScore}<span className="text-lg text-muted-foreground">/100</span>
                                          </span>
                                        </div>
                                        <div className="space-y-2">
                                          <Progress value={advancedData.seoHealth.overallScore} className="h-3" />
                                          <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Poor (0-40)</span>
                                            <span>Fair (40-60)</span>
                                            <span>Good (60-80)</span>
                                            <span>Excellent (80+)</span>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* SEO Factors Breakdown */}
                                  {advancedData.seoHealth.breakdown && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4" />
                                          </div>
                                          SEO Factors Breakdown
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {Object.entries(advancedData.seoHealth.breakdown).map(([key, factor]: [string, any]) => (
                                            <div key={key} className="p-4 border rounded-lg">
                                              <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium capitalize">
                                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </h4>
                                                <Badge variant={factor.score >= factor.maxScore * 0.8 ? 'default' : 'secondary'}>
                                                  {factor.score}/{factor.maxScore}
                                                </Badge>
                                              </div>
                                              <div className="mb-3">
                                                <Progress value={(factor.score / factor.maxScore) * 100} className="h-2" />
                                              </div>
                                              {factor.issues?.length > 0 && (
                                                <div className="text-sm">
                                                  <p className="font-medium mb-2 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Issues Found:
                                                  </p>
                                                  <ul className="space-y-1">
                                                    {factor.issues.map((issue: string, idx: number) => (
                                                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                                                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                                                        {issue}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* SEO Recommendations */}
                                  {advancedData.seoHealth.recommendations?.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                                            <Target className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <h3 className="text-base font-semibold">SEO Recommendations</h3>
                                            <p className="text-sm text-muted-foreground">
                                              Actionable insights to improve your SEO score
                                            </p>
                                          </div>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3 max-h-80 overflow-auto">
                                          {advancedData.seoHealth.recommendations.map((rec: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                                              <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <AlertTriangle className="h-3 w-3" />
                                              </div>
                                              <div className="flex-1">
                                                <p className="text-sm leading-relaxed">{rec}</p>
                                              </div>
                                              <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                                <span className="font-medium text-xs">
                                                  {idx + 1}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </>
                              )}
                            </TabsContent>

                            {/* Price Tracking Tab */}
                            <TabsContent value="pricing" className="space-y-6 mt-6">
                              {advancedData?.priceTracking && (
                                <>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                            <span className="text-lg">📉</span>
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-semibold">Price Alert Tracker</h3>
                                            <p className="text-sm text-muted-foreground">
                                              Real-time price monitoring and discount detection
                                            </p>
                                          </div>
                                        </div>
                                        {advancedData.priceTracking.summary.hasPriceDrops && (
                                          <Badge variant="destructive">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Alerts Active
                                          </Badge>
                                        )}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">
                                            {advancedData.priceTracking.summary.totalPricesFound}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Prices Found</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">
                                            {advancedData.priceTracking.summary.totalDiscountsFound}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Discounts</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">
                                            {advancedData.priceTracking.summary.totalOffersFound}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Offers</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">
                                            {advancedData.priceTracking.summary.urgentOffers}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Urgent</p>
                                        </div>
                                      </div>

                                      {advancedData.priceTracking.summary.averagePrice > 0 && (
                                        <div className="mt-4 p-4 border rounded-lg">
                                          <p className="text-sm text-muted-foreground">Average Price</p>
                                          <p className="text-xl font-bold">
                                            ${advancedData.priceTracking.summary.averagePrice.toFixed(2)}
                                          </p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Price Alerts */}
                                  {advancedData.priceTracking.alertTriggers?.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-red-500" />
                                          Active Price Alerts
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          {advancedData.priceTracking.alertTriggers.map((alert: any, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                                              alert.alert_level === 'high' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                                            }`}>
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <p className="font-medium capitalize">{alert.type.replace('_', ' ')}</p>
                                                  {alert.discount_percentage && (
                                                    <p className="text-sm text-muted-foreground">
                                                      {alert.discount_percentage}% discount detected
                                                    </p>
                                                  )}
                                                  {alert.current_price && (
                                                    <p className="text-sm text-muted-foreground">
                                                      Current price: ${alert.current_price}
                                                    </p>
                                                  )}
                                                </div>
                                                <Badge variant={alert.alert_level === 'high' ? 'destructive' : 'secondary'}>
                                                  {alert.alert_level} priority
                                                </Badge>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Current Prices */}
                                  {advancedData.priceTracking.currentPrices?.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>Detected Prices</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2 max-h-64 overflow-auto">
                                          {advancedData.priceTracking.currentPrices.slice(0, 10).map((price: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                              <span className="text-sm">{price.original}</span>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline">{price.currency}</Badge>
                                                <span className="font-medium">${price.value}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </>
                              )}
                            </TabsContent>

                            {/* Content Blueprint Tab */}
                            <TabsContent value="content" className="space-y-6 mt-6">
                              {advancedData?.contentBlueprint && (
                                <>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                            <span className="text-lg">🧩</span>
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-semibold">Content Blueprint</h3>
                                            <p className="text-sm text-muted-foreground">
                                              Comprehensive content analysis and strategy insights
                                            </p>
                                          </div>
                                        </div>
                                        <Badge variant={getScoreBadgeVariant(advancedData.contentBlueprint.overallContentScore)}>
                                          {advancedData.contentBlueprint.overallContentScore}/100
                                        </Badge>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Content Volume */}
                                        <div className="space-y-2">
                                          <h4 className="font-medium flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4" />
                                            Content Volume
                                          </h4>
                                          <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">{advancedData.contentBlueprint.contentVolume.totalWords}</span> words</p>
                                            <p><span className="font-medium">{advancedData.contentBlueprint.contentVolume.readingTime}</span> min read</p>
                                            <Badge variant="outline">{advancedData.contentBlueprint.contentVolume.volumeRating}</Badge>
                                          </div>
                                        </div>

                                        {/* Content Quality */}
                                        <div className="space-y-2">
                                          <h4 className="font-medium flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            Content Quality
                                          </h4>
                                          <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">{advancedData.contentBlueprint.contentQuality.overallScore}/100</span></p>
                                            <Badge variant={getScoreBadgeVariant(advancedData.contentBlueprint.contentQuality.overallScore)}>
                                              {advancedData.contentBlueprint.contentQuality.rating}
                                            </Badge>
                                          </div>
                                        </div>

                                        {/* Readability */}
                                        <div className="space-y-2">
                                          <h4 className="font-medium flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Readability
                                          </h4>
                                          <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">{advancedData.contentBlueprint.readabilityAnalysis.fleschReadingEase}/100</span> Flesch</p>
                                            <Badge variant="outline">{advancedData.contentBlueprint.readabilityAnalysis.readingLevel}</Badge>
                                            <p className="text-muted-foreground">{advancedData.contentBlueprint.readabilityAnalysis.complexityRating}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Engagement Elements */}
                                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 dark:from-purple-900/20 dark:via-gray-900 dark:to-indigo-900/10">
                                    <CardHeader className="pb-6">
                                      <CardTitle className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                          <Users className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                          <h3 className="text-lg font-bold">Engagement Elements</h3>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            Interactive features that drive user engagement
                                          </p>
                                        </div>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-blue-600">
                                            {advancedData.contentBlueprint.engagementElements.callsToAction}
                                          </p>
                                          <p className="text-sm text-muted-foreground">CTAs</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-green-600">
                                            {advancedData.contentBlueprint.engagementElements.forms}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Forms</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-purple-600">
                                            {advancedData.contentBlueprint.engagementElements.multimedia}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Media</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-2xl font-bold text-orange-600">
                                            {advancedData.contentBlueprint.engagementElements.engagementScore}
                                          </p>
                                          <p className="text-sm text-muted-foreground">Score</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Content Quality Factors */}
                                  {advancedData.contentBlueprint.contentQuality.factors?.length > 0 && (
                                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-emerald-50/30 dark:from-green-900/20 dark:via-gray-900 dark:to-emerald-900/10">
                                      <CardHeader className="pb-6">
                                        <CardTitle className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                          </div>
                                          <div>
                                            <h3 className="text-lg font-bold">Quality Factors</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {advancedData.contentBlueprint.contentQuality.factors.length} positive quality indicators detected
                                            </p>
                                          </div>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {advancedData.contentBlueprint.contentQuality.factors.map((factor: string, idx: number) => (
                                            <div 
                                              key={idx} 
                                              className="group flex items-start gap-3 p-4 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-green-100 dark:border-green-800/30 hover:shadow-md hover:border-green-200 dark:hover:border-green-700/50 transition-all duration-200"
                                            >
                                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                                                  {factor}
                                                </p>
                                              </div>
                                              <div className="w-6 h-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                                  ✓
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* Summary Footer */}
                                        <div className="mt-6 pt-4 border-t border-green-100 dark:border-green-800/30">
                                          <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                              <span className="font-medium">All quality factors passed</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                              <Star className="h-3 w-3" />
                                              <span>High quality content detected</span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}

                      {activeTool === "datashark" && results && results.data && (
                        <div className="space-y-6">
                          {/* Download JSON Button */}
                          <div className="flex justify-end">
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
                          {/* AI Insights Card (already present) */}
                          {results.data.aiInsights && (
                            <Card className="border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/10">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-emerald-600" />
                                  AI Insights
                                </CardTitle>
                                <CardDescription>
                                  Executive summary and recommendations generated by DataShark AI
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* ...AI insights fields as before... */}
                              </CardContent>
                            </Card>
                          )}
                          {/* Refined Dashboard-style DataShark Output */}
                          {/* Header Summary Card */}
                          {results.data.page && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                      <Globe className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-semibold">
                                        {results.data.page.title || 'Website Scrape'}
                                      </h4>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <LinkIcon className="h-3 w-3" />
                                          {results.data.page.domain}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {new Date(results.data.page.lastScraped).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline">Scrape Complete</Badge>
                                </CardTitle>
                              </CardHeader>
                            </Card>
                          )}
                          {/* Quick Metrics Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* SEO Score */}
                            {results.data.seo && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">SEO Headings</p>
                                      <p className="text-2xl font-bold text-yellow-700">
                                        {results.data.seo.headings?.h1?.length || 0}
                                        <span className="text-sm text-muted-foreground"> H1</span>
                                      </p>
                                      <Progress value={Math.min((results.data.seo.headings?.h1?.length || 0) * 10, 100)} className="h-2" />
                                    </div>
                                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                      <Search className="h-4 w-4 text-yellow-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Content Quality */}
                            {results.data.content && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Content Words</p>
                                      <p className="text-2xl font-bold text-green-700">
                                        {results.data.content.paragraphs?.totalWords || 0}
                                        <span className="text-sm text-muted-foreground"> words</span>
                                      </p>
                                      <Progress value={Math.min((results.data.content.paragraphs?.totalWords || 0) / 10, 100)} className="h-2" />
                                    </div>
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                      <FileText className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Contact Count */}
                            {results.data.contact && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                                      <p className="text-2xl font-bold text-purple-700">
                                        {(results.data.contact.phones?.length || 0) + (results.data.contact.emails?.length || 0)}
                                        <span className="text-sm text-muted-foreground"> found</span>
                                      </p>
                                      <Progress value={Math.min(((results.data.contact.phones?.length || 0) + (results.data.contact.emails?.length || 0)) * 10, 100)} className="h-2" />
                                    </div>
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <Phone className="h-4 w-4 text-purple-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Business Info */}
                            {results.data.business && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Business</p>
                                      <p className="text-xl font-bold text-orange-700">
                                        {results.data.business.companyName || 'N/A'}
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                      <Briefcase className="h-4 w-4 text-orange-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Technical Info */}
                            {results.data.technical && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Technologies</p>
                                      <p className="text-xl font-bold text-cyan-700">
                                        {results.data.technical.technologies?.length || 0}
                                        <span className="text-sm text-muted-foreground"> used</span>
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                                      <Cpu className="h-4 w-4 text-cyan-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Media Count */}
                            {results.data.media && (
                              <Card>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Images</p>
                                      <p className="text-xl font-bold text-gray-700">
                                        {results.data.media.images?.count || 0}
                                        <span className="text-sm text-muted-foreground"> found</span>
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <ImageIcon className="h-4 w-4 text-gray-600" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                          {/* Sectioned Details (optional, can add tabs or expanders for more detail) */}
                          {/* ...existing card-based details can be kept or further refined... */}
                        </div>
                      )}
                    </div>
                  )}

                  {tool.id === "queryhammerhead" && (
                    <QueryHammerheadInterface />
                  )}

                  {tool.id === "vizfin" && (
                    <VizFinInterface />
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