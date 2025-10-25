"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronRight, Home, Plus, Search, Calendar, Database, Users, Tag, Trash2, MoreVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProjectWithTools } from '@/lib/types/project'

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithTools[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      } else {
        console.error('Failed to fetch projects:', data.error);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeleting(projectId);
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        console.error('Failed to delete project:', data.error);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'archived': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'draft': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 bg-background text-foreground min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Projects</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground">Manage and monitor your projects</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push('/new_projects')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <Database className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {projects.length === 0 ? 'No projects yet' : 'No projects found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {projects.length === 0 
                  ? 'Create your first project to get started with our tools.'
                  : 'Try adjusting your search terms or create a new project.'
                }
              </p>
              <Button onClick={() => router.push('/new_projects')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-card border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">{project.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(project.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Database className="h-4 w-4 mr-1" />
                      <span>{project.data_count} data items</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{project.project_tools.length} tools</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.category}
                    </Badge>
                  </div>

                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
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
                {(() => {
                  const project = projects.find(p => p.id === deleteConfirm);
                  return project ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        &quot;{project.name}&quot;
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        This will delete {project.data_count} data items and {project.project_tools.length} tool configurations.
                      </p>
                    </div>
                  ) : null;
                })()}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting === deleteConfirm}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
                    disabled={deleting === deleteConfirm}
                  >
                    {deleting === deleteConfirm ? (
                      <>
                        <Spinner className="size-4 mr-2" />
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
    </ScrollArea>
  )
}