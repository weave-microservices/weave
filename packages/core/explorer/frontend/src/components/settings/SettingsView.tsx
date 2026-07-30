import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClusterStore } from "@/stores/cluster";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export function SettingsView() {
  const { connected, nodes, actions, events } = useClusterStore();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Explorer configuration and status</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Current connection to the cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={connected ? "success" : "destructive"}>
                  {connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Nodes</span>
                <span className="font-mono">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Actions</span>
                <span className="font-mono">{actions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Events</span>
                <span className="font-mono">{events.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Weave Explorer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Weave Explorer provides a visual interface for monitoring and interacting with your
              Weave microservices cluster.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
