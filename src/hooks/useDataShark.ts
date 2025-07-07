import { useState, useEffect } from "react";
import { toolsApi } from "@/lib/api-client";

interface DataSharkState {
  url: string;
  format: string;
  isRunning: boolean;
  results: any;
  error: string;
  progress: number;
  loadingStage: string;
  timeElapsed: number;
  copyStatus: {[key: string]: 'idle' | 'copying' | 'success' | 'error'};
  dataRestored: boolean;
}

export function useDataShark() {
  const [state, setState] = useState<DataSharkState>({
    url: "",
    format: "text",
    isRunning: false,
    results: null,
    error: "",
    progress: 0,
    loadingStage: "",
    timeElapsed: 0,
    copyStatus: {},
    dataRestored: false
  });

  // Load saved state from localStorage on component mount
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('datashark-results');
      const savedUrl = localStorage.getItem('datashark-url');
      const savedFormat = localStorage.getItem('datashark-format');
      const savedError = localStorage.getItem('datashark-error');
      
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setState(prev => ({
          ...prev,
          results: parsedResults,
          dataRestored: true
        }));
    
        
        // Hide the restored indicator after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, dataRestored: false }));
        }, 5000);
      }
      
      if (savedUrl) {
        setState(prev => ({ ...prev, url: savedUrl }));
      }
      
      if (savedFormat) {
        setState(prev => ({ ...prev, format: savedFormat }));
      }
      
      if (savedError) {
        setState(prev => ({ ...prev, error: savedError }));
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
    if (state.results) {
      try {
        const dataToSave = {
          ...state.results,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('datashark-results', JSON.stringify(dataToSave));

      } catch (err) {
        console.error('❌ Failed to save results to localStorage:', err);
      }
    } else {
      localStorage.removeItem('datashark-results');
    }
  }, [state.results]);

  // Save form state to localStorage
  useEffect(() => {
    if (state.url) {
      localStorage.setItem('datashark-url', state.url);
    } else {
      localStorage.removeItem('datashark-url');
    }
  }, [state.url]);

  useEffect(() => {
    localStorage.setItem('datashark-format', state.format);
  }, [state.format]);

  // Save error state to localStorage
  useEffect(() => {
    if (state.error) {
      localStorage.setItem('datashark-error', state.error);
    } else {
      localStorage.removeItem('datashark-error');
    }
  }, [state.error]);

  const setUrl = (url: string) => setState(prev => ({ ...prev, url }));
  const setFormat = (format: string) => setState(prev => ({ ...prev, format }));
  const setError = (error: string) => setState(prev => ({ ...prev, error }));

  const copyToClipboard = async (text: string, buttonId: string) => {
    setState(prev => ({ 
      ...prev, 
      copyStatus: { ...prev.copyStatus, [buttonId]: 'copying' } 
    }));
    
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
      
      setState(prev => ({ 
        ...prev, 
        copyStatus: { ...prev.copyStatus, [buttonId]: 'success' } 
      }));
      
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          copyStatus: { ...prev.copyStatus, [buttonId]: 'idle' } 
        }));
      }, 2000);
      
    } catch (err) {
      console.error('❌ Failed to copy data:', err);
      setState(prev => ({ 
        ...prev, 
        copyStatus: { ...prev.copyStatus, [buttonId]: 'error' } 
      }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          copyStatus: { ...prev.copyStatus, [buttonId]: 'idle' } 
        }));
      }, 3000);
    }
  };

  const handleScrape = async () => {
    // Clear previous error state
    setState(prev => ({ ...prev, error: "" }));
    
    // Enhanced client-side validation
    if (!state.url.trim()) {
      setState(prev => ({ ...prev, error: "❌ Please enter a valid URL" }));
      return;
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(state.url.trim());
    } catch (urlError) {
      setState(prev => ({ 
        ...prev, 
        error: "❌ Invalid URL format. Please enter a valid URL (e.g., https://example.com)" 
      }));
      console.error('URL parsing error:', urlError);
      return;
    }

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setState(prev => ({ ...prev, error: "❌ Please use HTTP or HTTPS protocol" }));
      return;
    }

    // Check for valid hostname
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      setState(prev => ({ ...prev, error: "❌ Please enter a valid domain name" }));
      return;
    }

    // Check for localhost/private IPs (security measure)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.includes('0.0.0.0')) {
      setState(prev => ({ 
        ...prev, 
        error: "🔒 Cannot scrape localhost or private IP addresses for security reasons" 
      }));
      return;
    }

    // Validate format
    const validFormats = ['text', 'json', 'csv', 'xml'];
    if (!validFormats.includes(state.format)) {
      setState(prev => ({ ...prev, error: "❌ Invalid output format selected" }));
      return;
    }

    // Set loading state
    setState(prev => ({
      ...prev,
      isRunning: true,
      results: null,
      progress: 0,
      loadingStage: "Initializing...",
      timeElapsed: 0
    }));

    // Start timer for elapsed time
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeElapsed: Math.floor((Date.now() - startTime) / 1000)
      }));
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

    // Remove simulated progress delays in production
    const isDev = process.env.NODE_ENV === 'development';
    // Simulate progress stages
    const progressSimulation = async () => {
      for (const { stage, progress, delay } of progressStages) {
        if (!operationRunning) break;
        if (isDev) await new Promise(resolve => setTimeout(resolve, delay));
        if (operationRunning) {
          setState(prev => ({
            ...prev,
            loadingStage: stage,
            progress: progress
          }));
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
  
      
      const result = await toolsApi.datashark.scrape({
        url: state.url.trim(),
        format: state.format
      });

      clearTimeout(timeoutId);

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          loadingStage: "Completed successfully!",
          progress: 100
        }));
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            results: result.data
          }));
        }, isDev ? 500 : 0);
      } else {
        console.error('DataShark API error:', result.error);
        setState(prev => ({ ...prev, error: result.error || 'Unknown error occurred' }));
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('DataShark fetch error:', err);
      
      // Handle different types of errors
      let errorMessage = `❌ Network error: ${err.message || 'Unable to connect to the server'}`;
      
      if (err.name === 'AbortError') {
        errorMessage = '⏱️ Request timeout. The operation took too long to complete. Please try again.';
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.';
      } else if (err.message?.includes('Invalid response format')) {
        errorMessage = '🔧 Server error. Invalid response format received.';
      } else if (err.message?.includes('HTTP 500')) {
        errorMessage = '🔧 Server error. Please try again later.';
      } else if (err.message?.includes('HTTP 429')) {
        errorMessage = '🚦 Too many requests. Please wait a moment before trying again.';
      } else if (err.message?.includes('HTTP 403')) {
        errorMessage = '🚫 Access denied. The server rejected the request.';
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      operationRunning = false;
      clearInterval(timerInterval);
      clearTimeout(timeoutId);
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isRunning: false,
          progress: 0,
          loadingStage: "",
          timeElapsed: 0
        }));
      }, isDev ? 1000 : 0);
    }
  };

  const handleAdvancedAnalysis = async () => {
    if (!state.url) return;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      error: '',
      progress: 0,
      loadingStage: "Initializing advanced analysis...",
      timeElapsed: 0
    }));
    
    // Start timer for elapsed time
    const timerInterval = setInterval(() => {
      setState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
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
        setState(prev => ({
          ...prev,
          loadingStage: stage,
          progress: progress
        }));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Make the actual API call
      setState(prev => ({
        ...prev,
        loadingStage: "Processing advanced analysis...",
        progress: 98
      }));
      
      const response = await fetch('/api/tools/datashark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: state.url,
          format: 'json'
        }),
      });

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        progress: 100,
        loadingStage: "Analysis complete!"
      }));
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          results: result
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Advanced analysis failed'
        }));
      }
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Network error occurred during advanced analysis'
      }));
    } finally {
      clearInterval(timerInterval);
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isRunning: false,
          progress: 0,
          loadingStage: "",
          timeElapsed: 0
        }));
      }, 500);
    }
  };

  const handleClearResults = () => {
    setState(prev => ({
      ...prev,
      results: null,
      error: "",
      url: "",
      format: "text",
      progress: 0,
      loadingStage: "",
      timeElapsed: 0,
      copyStatus: {}
    }));
    
    // Clear localStorage data
    localStorage.removeItem('datashark-results');
    localStorage.removeItem('datashark-url');
    localStorage.removeItem('datashark-format');
    localStorage.removeItem('datashark-error');
    
  };

  return {
    ...state,
    setUrl,
    setFormat,
    setError,
    handleScrape,
    handleAdvancedAnalysis,
    handleClearResults,
    copyToClipboard
  };
} 