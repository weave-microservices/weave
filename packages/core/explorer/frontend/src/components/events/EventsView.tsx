import { useState } from "react";
import { useClusterStore } from "@/stores/cluster";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Radio, Search } from "lucide-react";

export function EventsView() {
  const { events } = useClusterStore();
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter(
    (event) =>
      event.name?.toLowerCase().includes(search.toLowerCase()) ||
      event.group?.toLowerCase().includes(search.toLowerCase()),
  );

  // Group events by their service/group name
  const groupedEvents = filteredEvents.reduce(
    (acc, event) => {
      const group = event.group || "default";
      if (!acc[group]) acc[group] = [];
      acc[group].push(event);
      return acc;
    },
    {} as Record<string, typeof filteredEvents>,
  );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Badge variant="secondary">{events.length} Events</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {Object.entries(groupedEvents).map(([group, groupEvents]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{group}</span>
                <Badge variant="outline">{groupEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {groupEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{event.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={event.hasAvailable ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {event.count} listeners
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedEvents).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Radio className="mb-4 h-12 w-12 opacity-50" />
            <p>No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
