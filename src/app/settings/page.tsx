"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, Bell, User, Shield, Palette, Github, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNavigation } from "@/lib/hooks/useNavigation"
import { toast } from "sonner"

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  compact_mode?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    compact_mode: false,
    email_notifications: false,
    push_notifications: false,
    two_factor_enabled: false,
    current_password: '',
    new_password: ''
  })
  const router = useRouter()
  const { goBack } = useNavigation()

  useEffect(() => {
    setMounted(true)
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        compact_mode: data.compact_mode || false,
        email_notifications: data.email_notifications || false,
        push_notifications: data.push_notifications || false,
        two_factor_enabled: data.two_factor_enabled || false,
        current_password: '',
        new_password: ''
      })
      toast.success('Settings loaded successfully')
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          compact_mode: formData.compact_mode,
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
          two_factor_enabled: formData.two_factor_enabled,
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      
      if (updatedProfile.is_guest) {
        toast.success('Settings saved successfully!')
      } else {
        toast.success('Profile updated successfully!')
      }
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: ''
      }))
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const promise = new Promise((resolve, reject) => {
      if (confirm('Are you sure you want to clear all settings? This action cannot be undone.')) {
        resolve(true)
      } else {
        reject(new Error('Cancelled'))
      }
    })

    try {
      await promise
      setClearing(true)
      
      // Clear the form and show success message
      setProfile(null)
      setFormData({
        name: '',
        email: '',
        role: '',
        compact_mode: false,
        email_notifications: false,
        push_notifications: false,
        two_factor_enabled: false,
        current_password: '',
        new_password: ''
      })
      toast.success('Settings cleared successfully')
    } catch (error: any) {
      if (error.message !== 'Cancelled') {
        console.error('Error clearing settings:', error)
        toast.error(error.message || 'Failed to clear settings')
        setClearing(false)
      }
    }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">
                        Developer
                      </SelectItem>
                      <SelectItem value="data_scientist">
                        Data Scientist
                      </SelectItem>
                      <SelectItem value="data_analyst">
                        Data Analyst
                      </SelectItem>
                      <SelectItem value="business_analyst">
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
                <Button 
                  variant="outline"
                  onClick={() => toast.info('GitHub integration coming soon!')}
                >
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
                <Switch 
                  checked={formData.compact_mode}
                  onCheckedChange={(checked) => handleInputChange('compact_mode', checked)}
                />
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
                <Switch 
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch 
                  checked={formData.push_notifications}
                  onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
                />
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
                  value={formData.current_password}
                  onChange={(e) => handleInputChange('current_password', e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={formData.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch 
                  checked={formData.two_factor_enabled}
                  onCheckedChange={(checked) => handleInputChange('two_factor_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between space-x-4 pt-4 animate-fade-in">
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={saving || clearing}
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Clear Settings
            </Button>
            <div className="flex space-x-4 ml-auto">
              <Button 
                variant="outline" 
                onClick={() => goBack('/dashboard')}
                disabled={saving || clearing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={saving || clearing}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
} 