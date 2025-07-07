import { Globe, HelpCircle, BarChart3 } from "lucide-react"

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  lastUsed: string;
  usage: 'High' | 'Medium' | 'Low';
  icon: any;
  command: string;
  shortcut: string;
}

export const tools: Tool[] = [
  {
    id: "datashark",
    name: "DataShark",
    description: "Smart web scraper that intelligently extracts data from websites with advanced parsing capabilities",
    type: "Web Scraping",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'High',
    icon: Globe,
    command: "datashark scrape <url>",
    shortcut: "⌘1"
  },
  {
    id: "queryhammerhead",
    name: "QueryHammerhead",
    description: "LLM-powered data Q&A tool that answers questions about your datasets using natural language",
    type: "Data Analysis",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'Medium',
    icon: HelpCircle,
    command: "queryhammerhead ask <question>",
    shortcut: "⌘2"
  },
  {
    id: "vizfin",
    name: "VizFin",
    description: "Advanced data visualizer that creates beautiful charts and dashboards from your data",
    type: "Data Visualization",
    status: 'active',
    lastUsed: "Not Available",
    usage: 'High',
    icon: BarChart3,
    command: "vizfin create <chart-type>",
    shortcut: "⌘3"
  }
]; 