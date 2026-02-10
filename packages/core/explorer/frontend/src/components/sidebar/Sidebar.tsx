import { cn } from "@/lib/utils";
import {
  Activity,
  Layers,
  Network,
  Radio,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClusterStore } from "@/stores/cluster";

export type View = "cluster" | "actions" | "events" | "packets" | "settings";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: () => number;
}

const navItems: NavItem[] = [
  { id: "cluster", label: "Cluster", icon: Network },
  {
    id: "actions",
    label: "Actions",
    icon: Zap,
    badge: () => useClusterStore.getState().actions.length,
  },
  {
    id: "events",
    label: "Events",
    icon: Radio,
    badge: () => useClusterStore.getState().events.length,
  },
  { id: "packets", label: "Packets", icon: Activity },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { connected, nodes } = useClusterStore();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-16 flex-col items-center border-r bg-sidebar py-4">
        {/* Logo */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-5 w-5" />
        </div>

        <Separator className="my-2 w-8" />

        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "mb-4 h-2 w-2 rounded-full",
                connected ? "bg-green-500" : "bg-red-500"
              )}
            />
          </TooltipTrigger>
          <TooltipContent side="right">
            {connected ? `Connected (${nodes.length} nodes)` : "Disconnected"}
          </TooltipContent>
        </Tooltip>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2">
          <NavButton
            item={{ id: "settings", label: "Settings", icon: Settings }}
            isActive={currentView === "settings"}
            onClick={() => onViewChange("settings")}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          className={cn("relative h-10 w-10", isActive && "bg-sidebar-accent")}
        >
          <Icon className="h-5 w-5" />
          {item.badge && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {item.badge()}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
