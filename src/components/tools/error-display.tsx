import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ErrorDisplayProps {
  error: string;
  onClear: () => void;
}

export function ErrorDisplay({ error, onClear }: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorTip = (errorMessage: string) => {
    if (errorMessage.includes('ScraperAPI')) {
      return (
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
      );
    }
    if (errorMessage.includes('timeout')) {
      return (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          💡 Tip: Try a simpler website or check if the URL is accessible in your browser
        </div>
      );
    }
    if (errorMessage.includes('blocked')) {
      return (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          💡 Tip: Some websites block automated requests. Try a different website or check robots.txt
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-red-500 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <div className="text-red-800 dark:text-red-400 font-medium mb-1">Scraping Error</div>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
            {getErrorTip(error)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 p-1 h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 