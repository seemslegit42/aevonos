
export type NodeType = 
    | 'trigger' 
    | 'agent' 
    | 'logic' 
    | 'tool-winston-wolfe'
    | 'tool-kif-kroker'
    | 'tool-vandelay'
    | 'tool-rolodex'
    | 'tool-dr-syntax'
    | 'tool-crm'
    | 'tool-paper-trail'
    | 'tool-jroc'
    | 'tool-lahey'
    | 'tool-foremanator'
    | 'tool-sterileish'
    | 'tool-barbara'
    | 'tool-auditor-generalissimo'
    | 'tool-beep-wingman'
    | 'tool-kendra'
    | 'tool-lumbergh'
    | 'tool-lucille-bluth'
    | 'tool-pam-poovey-onboarding'
    | 'tool-stonks-bot'
    | 'tool-reno-mode'
    | 'tool-patrickt-app'
    | 'tool-vin-diesel'
    | 'tool-inventory-daemon'
    | 'tool-orphean-oracle'
    | 'tool-ritual-quests'
    | 'tool-burn-bridge-protocol'
    | 'tool-vault-daemon'
    | 'tool-final-answer';


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
