/**
 * QueryHammerhead Client Utility
 * Provides easy-to-use functions for interacting with the QueryHammerhead API (powered by Groq)
 */

import { toolsApi } from "@/lib/api-client";

export type QueryMode = 'analysis' | 'research' | 'code' | 'creative' | 'optimization';

export type GroqModel = 
  // Production models
  | 'llama-3.3-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'gemma2-9b-it'
  | 'llama3-70b-8192'
  | 'llama3-8b-8192'
  // Preview models
  | 'deepseek-r1-distill-llama-70b'
  | 'qwen/qwen3-32b'
  | 'qwen-qwq-32b'
  | 'mistral-saba-24b';

export interface QueryRequest {
  query: string;
  mode: QueryMode;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  model?: GroqModel;
}

export interface QueryResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    mode: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  };
}

export interface QueryHammerheadInfo {
  name: string;
  description: string;
  version: string;
  provider: string;
  modes: QueryMode[];
  availableModels: GroqModel[];
  defaultModel: GroqModel;
  endpoints: {
    POST: {
      description: string;
      parameters: Record<string, string>;
    };
  };
  example: QueryRequest;
}

/**
 * QueryHammerhead API Client Class
 */
export class QueryHammerheadClient {
  private baseUrl: string;
  private defaultModel: GroqModel;

  constructor(baseUrl: string = '/api/tools/queryhammerhead', defaultModel: GroqModel = 'llama-3.3-70b-versatile') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Process a query using QueryHammerhead
   */
  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      const requestWithDefaults = {
        ...request,
        model: request.model || this.defaultModel,
      };

      const result = await toolsApi.queryhammerhead.query(requestWithDefaults);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          mode: 'error',
          model: 'unknown',
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Get QueryHammerhead API information
   */
  async getInfo(): Promise<QueryHammerheadInfo | null> {
    try {
      const result = await toolsApi.queryhammerhead.getInfo();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to get QueryHammerhead info:', error);
      return null;
    }
  }

  /**
   * Set the default model for all requests
   */
  setDefaultModel(model: GroqModel) {
    this.defaultModel = model;
  }

  /**
   * Analyze data or problems
   */
  async analyze(query: string, context?: string, model?: GroqModel): Promise<QueryResponse> {
    return this.query({
      query,
      mode: 'analysis',
      context,
      model: model || this.defaultModel,
    });
  }

  /**
   * Research a topic
   */
  async research(query: string, context?: string, model?: GroqModel): Promise<QueryResponse> {
    return this.query({
      query,
      mode: 'research',
      context,
      model: model || this.defaultModel,
    });
  }

  /**
   * Get code help and solutions
   */
  async code(query: string, context?: string, model?: GroqModel): Promise<QueryResponse> {
    return this.query({
      query,
      mode: 'code',
      context,
      model: model || this.defaultModel,
    });
  }

  /**
   * Generate creative solutions
   */
  async creative(query: string, context?: string, model?: GroqModel): Promise<QueryResponse> {
    return this.query({
      query,
      mode: 'creative',
      context,
      temperature: 0.9, // Higher temperature for more creativity
      model: model || this.defaultModel,
    });
  }



  /**
   * Optimize performance and processes
   */
  async optimize(query: string, context?: string, model?: GroqModel): Promise<QueryResponse> {
    return this.query({
      query,
      mode: 'optimization',
      context,
      model: model || this.defaultModel,
    });
  }
}

/**
 * Default QueryHammerhead client instance
 */
export const queryHammerhead = new QueryHammerheadClient();

/**
 * Convenience functions for direct usage
 */
export const qh = {
  analyze: (query: string, context?: string, model?: GroqModel) => queryHammerhead.analyze(query, context, model),
  research: (query: string, context?: string, model?: GroqModel) => queryHammerhead.research(query, context, model),
  code: (query: string, context?: string, model?: GroqModel) => queryHammerhead.code(query, context, model),
  creative: (query: string, context?: string, model?: GroqModel) => queryHammerhead.creative(query, context, model),

  optimize: (query: string, context?: string, model?: GroqModel) => queryHammerhead.optimize(query, context, model),
  query: (request: QueryRequest) => queryHammerhead.query(request),
  info: () => queryHammerhead.getInfo(),
  setModel: (model: GroqModel) => queryHammerhead.setDefaultModel(model),
};

/**
 * Hook for React components
 */
export function useQueryHammerhead() {
  return {
    client: queryHammerhead,
    ...qh,
  };
} 