"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95 animate-gradient-x"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black animate-pulse"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Floating Home Button */}
      <Button
        onClick={handleHomeClick}
        variant="ghost"
        className="fixed bottom-8 right-8 p-4 hover:bg-white text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-float z-50"
      >
        <Home className="w-6 h-6" />
      </Button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-black/90 backdrop-blur-xl border-r border-gray-800/30 p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>
        <div className={`mb-8 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} flex items-center space-x-3`}>
          <Image
            src="/logo.png"
            alt="Keradon Logo"
            width={40}
            height={40}
            className="rounded-lg brightness-0 invert"
          />
          <h2 className="text-2xl font-bold text-white">Keradon</h2>
        </div>
        <nav className="space-y-2">
          {['overview', 'analytics', 'projects','tools', 'settings'].map((tab, index) => (
            <Button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'projects') {
                  router.push('/projects');
                }
                if (tab === 'tools') {
                  router.push('/tools');
                }
                if (tab === 'settings') {
                  router.push('/settings');
                }
                if (tab === 'analytics') {
                  router.push('/analytics');
                }
              }}
              variant="ghost"
              className={`w-full justify-start px-4 py-2 transition-all duration-200 text-white hover:bg-white/20 hover:text-white ${
                activeTab === tab ? 'bg-white/20 text-white' : 'text-gray-400'
              } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64 p-8 relative">
        {/* Header */}
        <header className={`flex justify-between items-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button className={`bg-white text-black hover:bg-white/90 transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.3)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              New Project
            </Button>
            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold hover:bg-white/90 transition-all duration-1000 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              U
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Projects', value: '0', change: '0' },
            { label: 'Active Scrapes', value: '0', change: '0' },
            { label: 'Data Points', value: '0', change: '0' },
            { label: 'Success Rate', value: '0%', change: '0%' },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`bg-black/90 backdrop-blur-xl border-gray-800/30 hover:border-gray-700/50 transition-all duration-1000 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <p className="text-gray-400 mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-green-500 text-sm">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className={`lg:col-span-2 bg-black/90 backdrop-blur-xl border-gray-800/30 transition-all duration-1000 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardHeader>
              <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'No recent activity', time: '' }
                ].map((activity, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg bg-white/5 transition-all duration-1000 hover:bg-white/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <span className="text-gray-300">{activity.action}</span>
                    <span className="text-gray-500 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={`bg-black/90 backdrop-blur-xl border-gray-800/30 transition-all duration-1000 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardHeader>
              <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Start New Scrape',
                  'Export Data',
                  'Create Visualization',
                  'Schedule Task',
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start px-4 py-3 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-1000 hover:scale-[1.02] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decorative Floating Blobs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-24 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
      </div>
    </main>
  );
}