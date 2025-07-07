import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface LoadingIndicatorProps {
  isRunning: boolean;
  progress: number;
  loadingStage: string;
  timeElapsed: number;
  targetUrl?: string;
}

export function LoadingIndicator({ 
  isRunning, 
  progress, 
  loadingStage, 
  timeElapsed, 
  targetUrl 
}: LoadingIndicatorProps) {
  if (!isRunning) return null;

  return (
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
              Target: {targetUrl ? (() => {
                try {
                  return new URL(targetUrl).hostname;
                } catch {
                  return targetUrl;
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
  )
} 