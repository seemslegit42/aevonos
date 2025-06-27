'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import NodesSidebar, { NodeType } from '@/components/loom/nodes-sidebar';
import WorkflowCanvas from '@/components/loom/workflow-canvas';
import PropertyInspector from '@/components/loom/property-inspector';

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface Edge {
  id:string;
  source: string;
  target: string;
}

const initialNodes: Node[] = [
    { id: 'trigger-1', type: 'trigger', position: { x: 50, y: 500 }, data: { label: 'BEEP Command Received', event: 'user_command' } },
    { id: 'agent-1', type: 'agent', position: { x: 350, y: 500 }, data: { label: 'BEEP Agent Kernel', personality: 'witty, sarcastic', model: 'gemini-2.0-flash' } },
    
    { id: 'tool-drsyntax', type: 'tool-dr-syntax', position: { x: 650, y: 50 }, data: { label: 'Dr. Syntax', agent: 'dr-syntax' } },
    { id: 'tool-crm', type: 'tool-crm', position: { x: 650, y: 150 }, data: { label: 'CRM Tools', service: 'CRM' } },
    { id: 'tool-wolfe', type: 'tool-winston-wolfe', position: { x: 650, y: 250 }, data: { label: 'Winston Wolfe', service: 'Reputation' } },
    { id: 'tool-kif', type: 'tool-kif-kroker', position: { x: 650, y: 350 }, data: { label: 'Kif Kroker', service: 'Comms' } },
    { id: 'tool-vandelay', type: 'tool-vandelay', position: { x: 650, y: 450 }, data: { label: 'Vandelay', service: 'Calendar' } },
    { id: 'tool-paper-trail', type: 'tool-paper-trail', position: { x: 650, y: 550 }, data: { label: 'Paper Trail', service: 'Expenses' } },
    { id: 'tool-jroc', type: 'tool-jroc', position: { x: 650, y: 650 }, data: { label: 'J-ROC', service: 'BizDev' } },
    { id: 'tool-lahey', type: 'tool-lahey', position: { x: 650, y: 750 }, data: { label: 'Lahey', service: 'Surveillance' } },
    { id: 'tool-foremanator', type: 'tool-foremanator', position: { x: 650, y: 850 }, data: { label: 'Foremanator', service: 'Construction' } },
    { id: 'tool-sterileish', type: 'tool-sterileish', position: { x: 650, y: 950 }, data: { label: 'STERILE-ish', service: 'Compliance' } },
    
    { id: 'tool-final-answer', type: 'tool-final-answer', position: { x: 950, y: 500 }, data: { label: 'Final Answer', schema: 'UserCommandOutput' } },
];

const initialEdges: Edge[] = [
    { id: 'e-trigger-agent', source: 'trigger-1', target: 'agent-1' },
    { id: 'e-agent-drsyntax', source: 'agent-1', target: 'tool-drsyntax' },
    { id: 'e-agent-crm', source: 'agent-1', target: 'tool-crm' },
    { id: 'e-agent-wolfe', source: 'agent-1', target: 'tool-wolfe' },
    { id: 'e-agent-kif', source: 'agent-1', target: 'tool-kif' },
    { id: 'e-agent-vandelay', source: 'agent-1', target: 'tool-vandelay' },
    { id: 'e-agent-paper-trail', source: 'agent-1', target: 'tool-paper-trail' },
    { id: 'e-agent-jroc', source: 'agent-1', target: 'tool-jroc' },
    { id: 'e-agent-lahey', source: 'agent-1', target: 'tool-lahey' },
    { id: 'e-agent-foremanator', source: 'agent-1', target: 'tool-foremanator' },
    { id: 'e-agent-sterileish', source: 'agent-1', target: 'tool-sterileish' },
    { id: 'e-agent-final', source: 'agent-1', target: 'tool-final-answer' },
];


export default function LoomPage() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connection, setConnection] = useState<{ sourceId: string; } | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }));

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (connection) return; // Don't move nodes while making a connection

        const { active, delta } = event;
        const nodeId = active.id as string;
        
        if (active.data.current?.isDraggableNode) {
            const type = active.data.current.type as NodeType;
            const label = active.data.current.label as string;
            
            const newNode: Node = {
                id: `${type}-${new Date().getTime()}`,
                type,
                position: { x: 250, y: 150 },
                data: { label: label },
            };
            
            setNodes((nds) => [...nds, newNode]);
        } else {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        return { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y }};
                    }
                    return node;
                })
            );
        }
    }, [connection]);

    const updateNodeData = (nodeId: string, newData: any) => {
        const newNodes = nodes.map(n => {
            if (n.id === nodeId) {
                return { ...n, data: { ...n.data, ...newData } };
            }
            return n;
        });
        setNodes(newNodes);
        if (selectedNode?.id === nodeId) {
            setSelectedNode(newNodes.find(n => n.id === nodeId) || null);
        }
    };

    const onConnectStart = useCallback((sourceId: string) => {
        setConnection({ sourceId });
    }, []);

    const onConnectEnd = useCallback((targetId: string | null) => {
        if (!connection || !targetId || connection.sourceId === targetId) {
            setConnection(null);
            return;
        }

        const newEdge: Edge = {
            id: `e-${connection.sourceId}-${targetId}`,
            source: connection.sourceId,
            target: targetId,
        };

        if (!edges.some(e => e.id === newEdge.id)) {
            setEdges((eds) => [...eds, newEdge]);
        }
        
        setConnection(null);
    }, [connection, edges]);

  return (
    <div className="flex flex-col h-full">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex-grow flex gap-4 min-h-0">
                <NodesSidebar />
                <WorkflowCanvas 
                    nodes={nodes} 
                    edges={edges} 
                    onNodeClick={handleNodeClick} 
                    selectedNodeId={selectedNode?.id}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    connectionSourceId={connection?.sourceId}
                />
                <PropertyInspector node={selectedNode} onUpdate={updateNodeData} />
            </div>
        </DndContext>
        <footer className="text-center text-xs text-muted-foreground pt-4 flex-shrink-0">
            <p><Link href="/" className="hover:text-primary underline">Return to Canvas</Link></p>
        </footer>
    </div>
  );
}
