import Link from "next/link";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Database, Settings } from "lucide-react";

export function Navigation() {
  return (
    <NavigationMenu className="mb-8">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/dashboard" className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          )}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/analytics" className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          )}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/tools" className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          )}>
            <Database className="mr-2 h-4 w-4" />
            Tools
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/settings" className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          )}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
} 