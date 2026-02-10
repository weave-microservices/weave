import { useState } from "react";
import { Sidebar, View } from "@/components/sidebar/Sidebar";
import { ClusterView } from "@/components/cluster/ClusterView";
import { ActionsView } from "@/components/actions/ActionsView";
import { EventsView } from "@/components/events/EventsView";
import { PacketsView } from "@/components/packets/PacketsView";
import { SettingsView } from "@/components/settings/SettingsView";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  const [currentView, setCurrentView] = useState<View>("cluster");

  // Initialize WebSocket connection
  useWebSocket();

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="flex-1 overflow-hidden">
          {currentView === "cluster" && <ClusterView />}
          {currentView === "actions" && <ActionsView />}
          {currentView === "events" && <EventsView />}
          {currentView === "packets" && <PacketsView />}
          {currentView === "settings" && <SettingsView />}
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
