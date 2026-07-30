import { useClusterStore, PacketInfo } from "@/stores/cluster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PacketsView() {
  const { packets, clearPackets } = useClusterStore();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packet Monitor</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{packets.length} packets</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearPackets}
            disabled={packets.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {packets
            .slice()
            .reverse()
            .map((packet) => (
              <PacketCard key={packet.id} packet={packet} />
            ))}

          {packets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="mb-4 h-12 w-12 opacity-50" />
              <p>No packets captured</p>
              <p className="mt-1 text-sm">Packets will appear here when nodes communicate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PacketCard({ packet }: { packet: PacketInfo }) {
  const isOutgoing = packet.direction === "out";

  return (
    <Card className={cn("border-l-4", isOutgoing ? "border-l-blue-500" : "border-l-green-500")}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {isOutgoing ? (
            <ArrowUp className="h-4 w-4 text-blue-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-green-500" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {packet.type}
              </Badge>
              {packet.action && <span className="font-mono text-sm">{packet.action}</span>}
              {packet.event && <span className="font-mono text-sm">{packet.event}</span>}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-mono">{packet.sender}</span>
              <span className="mx-2">→</span>
              <span className="font-mono">{packet.target || "broadcast"}</span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            {new Date(packet.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
