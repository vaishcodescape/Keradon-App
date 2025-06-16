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

export default function SettingsPage() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-8 pt-6 bg-black text-white min-h-screen">
        <div className="flex items-center space-x-2 text-sm text-zinc-400 mb-6 animate-fade-in">
          <Link href="/dashboard" className="flex items-center hover:text-white transition-colors duration-200">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Settings</span>
        </div>

        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
            <p className="text-sm text-zinc-400 mt-1">Manage your application preferences</p>
          </div>
        </div>

        <Separator className="bg-zinc-800/50 animate-fade-in" />

        <div className="grid gap-8">
          {/* Profile Settings */}
          <Card className="bg-zinc-900/30 border-zinc-800/30 backdrop-blur-sm hover:bg-zinc-900/40 transition-all duration-300 animate-slide-up shadow-lg shadow-black/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-200">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Profile</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Manage your personal information and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-400">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    className="bg-zinc-800/30 border-zinc-700/30 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600 transition-all duration-200" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-zinc-400">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email" 
                    className="bg-zinc-800/30 border-zinc-700/30 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600 transition-all duration-200" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-zinc-400">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-zinc-800/30 border-zinc-700/30 text-white hover:bg-zinc-800/50 focus:ring-1 focus:ring-zinc-700 transition-all duration-200">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/95 border-zinc-800/50 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
                      <SelectItem value="developer" className="text-zinc-400 focus:bg-zinc-800/50 focus:text-white cursor-pointer transition-colors duration-200">
                        Developer
                      </SelectItem>
                      <SelectItem value="designer" className="text-zinc-400 focus:bg-zinc-800/50 focus:text-white cursor-pointer transition-colors duration-200">
                        Data Scientist
                      </SelectItem>
                      <SelectItem value="manager" className="text-zinc-400 focus:bg-zinc-800/50 focus:text-white cursor-pointer transition-colors duration-200">
                        Data Analyst
                      </SelectItem>
                      <SelectItem value="manager" className="text-zinc-400 focus:bg-zinc-800/50 focus:text-white cursor-pointer transition-colors duration-200">
                        Business Analyst
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="bg-zinc-900/30 border-zinc-800/30 backdrop-blur-sm hover:bg-zinc-900/40 transition-all duration-300 animate-slide-up shadow-lg shadow-black/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-200">
                  <Github className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-white">GitHub Integration</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Connect your GitHub account to enable repository access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Connection Status</Label>
                  <p className="text-sm text-zinc-500">Not connected to GitHub</p>
                </div>
                <Button className="bg-zinc-800/50 hover:bg-zinc-700/50 text-white transition-all duration-200 hover:scale-105">
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub
                </Button>
              </div>
              <div className="text-sm text-zinc-500">
                Connecting your GitHub account allows you to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li className="hover:text-zinc-400 transition-colors duration-200">Access your repositories</li>
                  <li className="hover:text-zinc-400 transition-colors duration-200">Import existing projects</li>
                  <li className="hover:text-zinc-400 transition-colors duration-200">Enable automated workflows</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-zinc-900/30 border-zinc-800/30 backdrop-blur-sm hover:bg-zinc-900/40 transition-all duration-300 animate-slide-up shadow-lg shadow-black/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-200">
                  <Palette className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Appearance</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Customize how the application looks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Dark Mode</Label>
                  <p className="text-sm text-zinc-500">Enable dark mode for the application</p>
                </div>
                <Switch className="data-[state=checked]:bg-green-600 transition-colors duration-200" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Compact Mode</Label>
                  <p className="text-sm text-zinc-500">Use a more compact layout</p>
                </div>
                <Switch className="data-[state=checked]:bg-green-600 transition-colors duration-200" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="bg-zinc-900/30 border-zinc-800/30 backdrop-blur-sm hover:bg-zinc-900/40 transition-all duration-300 animate-slide-up shadow-lg shadow-black/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-200">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Configure your notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Email Notifications</Label>
                  <p className="text-sm text-zinc-500">Receive notifications via email</p>
                </div>
                <Switch className="data-[state=checked]:bg-green-600 transition-colors duration-200" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Push Notifications</Label>
                  <p className="text-sm text-zinc-500">Receive push notifications</p>
                </div>
                <Switch className="data-[state=checked]:bg-green-600 transition-colors duration-200" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-zinc-900/30 border-zinc-800/30 backdrop-blur-sm hover:bg-zinc-900/40 transition-all duration-300 animate-slide-up shadow-lg shadow-black/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-200">
                  <Shield className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Security</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">
                    Manage your security preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="current-password" className="text-zinc-400">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  className="bg-zinc-800/30 border-zinc-700/30 text-white focus:border-zinc-600 focus:ring-zinc-600 transition-all duration-200" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password" className="text-zinc-400">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  className="bg-zinc-800/30 border-zinc-700/30 text-white focus:border-zinc-600 focus:ring-zinc-600 transition-all duration-200" 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-zinc-400">Two-Factor Authentication</Label>
                  <p className="text-sm text-zinc-500">Add an extra layer of security</p>
                </div>
                <Switch className="data-[state=checked]:bg-green-600 transition-colors duration-200" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4 animate-fade-in">
            <Button 
              variant="outline" 
              className="border-zinc-700/30 text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600/80 hover:bg-green-600 text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:scale-105"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 