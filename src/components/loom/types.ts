
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
}

export interface Workflow {
  id?: string; // CUID from DB
  name: string;
  definition: {
    nodes: Node[];
    edges: Edge[];
  };
}
