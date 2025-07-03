"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { ChevronRight, Home, Plus, ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectForm {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  tags: string[];
  selectedTools: string[];
}

const projectCategories = [
  "Web Scraping",
  "Data Analysis", 
  "Machine Learning",
  "Automation",
  "Other"
];

export default function NewProjects() {
  const router = useRouter();
  const { goBack } = useNavigation();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<ProjectForm>({
    name: "",
    description: "",
    category: "",
    isPublic: false,
    tags: [],
    selectedTools: []
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: keyof ProjectForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          is_public: formData.isPublic,
          tags: formData.tags,
          selected_tools: formData.selectedTools
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/projects/${result.project.id}`);
      } else {
        const errorMsg = result.error || 'Failed to create project';
        setError(errorMsg);
        console.error('Failed to create project:', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Network error - please check your connection and try again';
      setError(errorMsg);
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    goBack('/projects');
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      
      <div className="p-8 relative">
        {/* Breadcrumb Navigation */}
        <div className={cn(
          "flex items-center space-x-2 text-sm text-muted-foreground mb-6",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}>
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">New Project</span>
        </div>

        {/* Header */}
        <div className={cn(
          "flex items-center justify-between mb-8",
          "transition-all duration-500 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )} style={{ transitionDelay: '100ms' }}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up a new project with your preferred tools and settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim() || formData.selectedTools.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loading size={16} />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className={cn(
            "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '150ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <X className="h-5 w-5" />
                <span className="font-medium">Error creating project</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-1 text-sm">{error}</p>
              {error.includes("category") && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Database Schema Issue:</strong> It looks like your database is missing required columns. 
                    Please check your Firebase configuration or contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className={cn(
            "bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg",
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label htmlFor="public">Make project public</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className={cn(
            "bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg",
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Tags</CardTitle>
              <CardDescription>
                Add tags to help organize and categorize your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tools Section */}
          <Card className={cn(
            "bg-card/80 backdrop-blur-xl border-border transition-all duration-300 shadow-lg",
            "transition-all duration-500 ease-out",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )} style={{ transitionDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Available Tools</CardTitle>
              <CardDescription>
                Select the tools you want to use for this project (at least one required)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* DataShark Tool */}
                <Card 
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                    formData.selectedTools.includes('datashark') 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => {
                    const tools = formData.selectedTools.includes('datashark')
                      ? formData.selectedTools.filter(t => t !== 'datashark')
                      : [...formData.selectedTools, 'datashark'];
                    handleInputChange('selectedTools', tools);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">DataShark</h3>
                        <p className="text-sm text-muted-foreground">Smart Web Scraper</p>
                      </div>
                      {formData.selectedTools.includes('datashark') && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* QueryHammerhead Tool */}
                <Card 
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                    formData.selectedTools.includes('queryhammerhead') 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => {
                    const tools = formData.selectedTools.includes('queryhammerhead')
                      ? formData.selectedTools.filter(t => t !== 'queryhammerhead')
                      : [...formData.selectedTools, 'queryhammerhead'];
                    handleInputChange('selectedTools', tools);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">QueryHammerhead</h3>
                        <p className="text-sm text-muted-foreground">LLM-powered Data Q&A</p>
                      </div>
                      {formData.selectedTools.includes('queryhammerhead') && (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* VizFin Tool */}
                <Card 
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                    formData.selectedTools.includes('vizfin') 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => {
                    const tools = formData.selectedTools.includes('vizfin')
                      ? formData.selectedTools.filter(t => t !== 'vizfin')
                      : [...formData.selectedTools, 'vizfin'];
                    handleInputChange('selectedTools', tools);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">VizFin</h3>
                        <p className="text-sm text-muted-foreground">Data Visualizer</p>
                      </div>
                      {formData.selectedTools.includes('vizfin') && (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {formData.selectedTools.length > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Selected tools: {formData.selectedTools.map(tool => {
                      switch(tool) {
                        case 'datashark': return 'DataShark';
                        case 'queryhammerhead': return 'QueryHammerhead';
                        case 'vizfin': return 'VizFin';
                        default: return tool;
                      }
                    }).join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}

