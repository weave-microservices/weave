import { useState } from "react";
import { useClusterStore } from "@/stores/cluster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, Play, Search, X, Zap } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export function ActionsView() {
  const { actions, calls, selectedAction, setSelectedAction } = useClusterStore();
  const { callAction } = useWebSocket();
  const [search, setSearch] = useState("");
  const [params, setParams] = useState("{}");

  const filteredActions = actions.filter((action) =>
    action.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = () => {
    if (!selectedAction) return;
    try {
      const parsedParams = JSON.parse(params);
      callAction(selectedAction, parsedParams);
    } catch {
      alert("Invalid JSON params");
    }
  };

  return (
    <div className="flex h-full">
      {/* Action List */}
      <div className="flex w-80 flex-col border-r">
        <div className="border-b p-4">
          <h2 className="mb-3 text-lg font-semibold">Actions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {filteredActions.map((action) => (
            <button
              key={action.name}
              onClick={() => setSelectedAction(action.name)}
              className={`mb-1 w-full rounded-md p-3 text-left transition-colors hover:bg-accent ${
                selectedAction === action.name ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{action.name}</span>
                <Badge
                  variant={action.hasAvailable ? "success" : "secondary"}
                  className="text-xs"
                >
                  {action.count}
                </Badge>
              </div>
              <div className="mt-1 flex gap-1">
                {action.hasLocal && (
                  <Badge variant="outline" className="text-xs">
                    Local
                  </Badge>
                )}
              </div>
            </button>
          ))}

          {filteredActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Zap className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No actions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Details & Executor */}
      <div className="flex flex-1 flex-col">
        {selectedAction ? (
          <Tabs defaultValue="execute" className="flex h-full flex-col">
            <div className="border-b px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="execute">Execute</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="execute" className="flex-1 p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">{selectedAction}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Parameters (JSON)
                    </label>
                    <textarea
                      value={params}
                      onChange={(e) => setParams(e.target.value)}
                      className="h-32 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
                      placeholder="{}"
                    />
                  </div>
                  <Button onClick={handleCall} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Execute Action
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {calls
                  .filter((c) => c.action === selectedAction)
                  .map((call) => (
                    <Card key={call.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {call.status === "pending" && (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            {call.status === "success" && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {call.status === "error" && (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {new Date(call.startedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {call.finishedAt && (
                            <span className="text-xs text-muted-foreground">
                              {call.finishedAt - call.startedAt}ms
                            </span>
                          )}
                        </div>
                        {call.status === "success" && call.result !== undefined && (
                          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                            {JSON.stringify(call.result, null, 2) as string}
                          </pre>
                        )}
                        {call.status === "error" && call.error && (
                          <p className="mt-2 text-sm text-red-500">{call.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {calls.filter((c) => c.action === selectedAction).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No call history</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <Zap className="mb-4 h-12 w-12 opacity-50" />
            <p>Select an action to execute</p>
          </div>
        )}
      </div>
    </div>
  );
}
