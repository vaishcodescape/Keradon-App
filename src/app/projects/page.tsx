"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  lastUpdated: string;
  tools: number;
}

const projects: Project[] = []

export default function ProjectsPage() {
  const router = useRouter();

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
              className="pl-8 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="bg-card border-border hover:bg-accent/5 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">{project.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <CardDescription className="text-muted-foreground">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <span className="mr-2">Tools:</span>
                    <span className="text-foreground">{project.tools}</span>
                  </div>
                  <div>
                    Last updated: {project.lastUpdated}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}