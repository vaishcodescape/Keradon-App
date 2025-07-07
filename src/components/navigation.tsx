"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Database, Settings, FolderOpen } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/tools", label: "Tools", icon: Database },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <NavigationMenu className="mb-8">
      <NavigationMenuList>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <NavigationMenuItem key={item.href}>
              <Link 
                href={item.href} 
                className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-background text-foreground"
                )}
                data-active={isActive}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
} 