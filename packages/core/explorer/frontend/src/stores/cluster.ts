import { create } from "zustand";

export interface ClusterNode {
  id: string;
  isLocal: boolean;
  isAvailable: boolean;
  services: string[];
  client?: {
    type: string;
    version: string;
  };
  cpu?: number;
}

export interface ClusterAction {
  name: string;
  params?: unknown;
  count: number;
  hasAvailable: boolean;
  hasLocal: boolean;
}

export interface ClusterEvent {
  name: string;
  group?: string;
  count: number;
  hasAvailable: boolean;
}

export interface PacketInfo {
  id: string;
  type: string;
  direction: "in" | "out";
  sender: string;
  target: string | null;
  action?: string;
  event?: string;
  timestamp: number;
}

export interface ActionCall {
  id: string;
  action: string;
  params: unknown;
  status: "pending" | "success" | "error";
  result?: unknown;
  error?: string;
  startedAt: number;
  finishedAt?: number;
}

interface ClusterState {
  connected: boolean;
  nodes: ClusterNode[];
  actions: ClusterAction[];
  events: ClusterEvent[];
  packets: PacketInfo[];
  calls: ActionCall[];
  selectedAction: string | null;
  selectedNode: string | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setInitialState: (nodes: ClusterNode[], actions: ClusterAction[], events: ClusterEvent[]) => void;
  addNode: (node: ClusterNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (node: ClusterNode) => void;
  updateRegistry: (actions: ClusterAction[], events: ClusterEvent[]) => void;
  addPacket: (packet: PacketInfo) => void;
  clearPackets: () => void;
  addCall: (call: ActionCall) => void;
  updateCall: (id: string, updates: Partial<ActionCall>) => void;
  setSelectedAction: (action: string | null) => void;
  setSelectedNode: (nodeId: string | null) => void;
}

const MAX_PACKETS = 100;
const MAX_CALLS = 50;

export const useClusterStore = create<ClusterState>((set) => ({
  connected: false,
  nodes: [],
  actions: [],
  events: [],
  packets: [],
  calls: [],
  selectedAction: null,
  selectedNode: null,

  setConnected: (connected) => set({ connected }),

  setInitialState: (nodes, actions, events) => set({ nodes, actions, events, connected: true }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes.filter((n) => n.id !== node.id), node],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      selectedNode: state.selectedNode === nodeId ? null : state.selectedNode,
    })),

  updateNode: (node) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === node.id ? node : n)),
    })),

  updateRegistry: (actions, events) => set({ actions, events }),

  addPacket: (packet) =>
    set((state) => ({
      packets: [...state.packets.slice(-MAX_PACKETS + 1), packet],
    })),

  clearPackets: () => set({ packets: [] }),

  addCall: (call) =>
    set((state) => ({
      calls: [call, ...state.calls.slice(0, MAX_CALLS - 1)],
    })),

  updateCall: (id, updates) =>
    set((state) => ({
      calls: state.calls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  setSelectedAction: (action) => set({ selectedAction: action }),

  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
}));
