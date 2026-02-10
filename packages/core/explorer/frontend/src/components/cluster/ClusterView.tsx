import { useClusterStore } from "@/stores/cluster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Cpu, Server } from "lucide-react";

export function ClusterView() {
  const { nodes, selectedNode, setSelectedNode } = useClusterStore();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cluster Overview</h1>
        <Badge variant="secondary">{nodes.length} Nodes</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Total Nodes"
          value={nodes.length}
          icon={Server}
          description="Connected to cluster"
        />
        <StatsCard
          title="Local Nodes"
          value={nodes.filter((n) => n.isLocal).length}
          icon={Box}
          description="Running locally"
        />
        <StatsCard
          title="Avg CPU"
          value={`${Math.round(nodes.reduce((sum, n) => sum + (n.cpu || 0), 0) / nodes.length || 0)}%`}
          icon={Cpu}
          description="Average CPU usage"
        />
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-3">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                selectedNode === node.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    node.isAvailable ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {node.id}
                    </span>
                    {node.isLocal && (
                      <Badge variant="outline" className="text-xs">
                        Local
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {node.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                {node.cpu !== undefined && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">CPU</div>
                    <div className="font-mono text-lg font-bold">
                      {Math.round(node.cpu)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {nodes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Server className="mb-4 h-12 w-12 opacity-50" />
              <p>No nodes connected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
