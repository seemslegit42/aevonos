
export type NodeType =
  | 'trigger'
  | 'agent'
  | 'logic'
  | 'tool-final-answer'
  // Standardized tool names based on tool-registry.ts
  | 'tool-auditor'
  | 'tool-barbara'
  | 'tool-wingman'
  | 'tool-burn_bridge_protocol'
  | 'tool-crm_agent'
  | 'tool-dr_syntax'
  | 'tool-foremanator'
  | 'tool-inventory_daemon'
  | 'tool-jroc'
  | 'tool-kendra'
  | 'tool-kif_kroker'
  | 'tool-lahey_surveillance'
  | 'tool-lumbergh'
  | 'tool-lucille_bluth'
  | 'tool-orphean_oracle'
  | 'tool-pam_poovey'
  | 'tool-paper_trail'
  | 'tool-patrickt_app'
  | 'tool-reno_mode'
  | 'tool-ritual_quests'
  | 'tool-rolodex'
  | 'tool-sterileish'
  | 'tool-stonks_bot'
  | 'tool-vandelay'
  | 'tool-vault_daemon'
  | 'tool-vin_diesel'
  | 'tool-winston_wolfe';


export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  condition?: 'true' | 'false';
}

export interface Workflow {
  id?: string; // CUID from DB
  name: string;
  definition: {
    nodes: Node[];
    edges: Edge[];
  };
}
