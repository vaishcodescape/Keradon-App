"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, Bell, User, Shield, Palette, Github } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors duration-200">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Settings</span>
        </div>

        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your application preferences</p>
          </div>
        </div>

        <Separator className="animate-fade-in" />

        <div className="grid gap-8">
          {/* Profile Settings */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your personal information and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">
                        Developer
                      </SelectItem>
                      <SelectItem value="designer">
                        Data Scientist
                      </SelectItem>
                      <SelectItem value="manager">
                        Data Analyst
                      </SelectItem>
                      <SelectItem value="manager">
                        Business Analyst
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200">
                  <Github className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>GitHub Integration</CardTitle>
                  <CardDescription className="mt-1">
                    Connect your GitHub account to enable repository access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Status</Label>
                  <p className="text-sm text-muted-foreground">Not connected to GitHub</p>
                </div>
                <Button variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Connecting your GitHub account allows you to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li className="hover:text-foreground transition-colors duration-200">Access your repositories</li>
                  <li className="hover:text-foreground transition-colors duration-200">Import existing projects</li>
                  <li className="hover:text-foreground transition-colors duration-200">Enable automated workflows</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription className="mt-1">
                    Customize how the application looks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription className="mt-1">
                    Configure your notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your security preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4 animate-fade-in">
            <Button 
              variant="outline" 
            >
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 