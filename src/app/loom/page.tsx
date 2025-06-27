
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
    { id: 'trigger-1', type: 'trigger', position: { x: 50, y: 250 }, data: { label: 'BEEP Command Received', event: 'user_command' } },
    { id: 'agent-1', type: 'agent', position: { x: 300, y: 250 }, data: { label: 'BEEP Agent Kernel', personality: 'witty, sarcastic', model: 'gemini-2.0-flash' } },
    { id: 'tool-drsyntax', type: 'tool', position: { x: 600, y: 50 }, data: { label: 'Tool: critiqueContent', agent: 'Dr. Syntax' } },
    { id: 'tool-crm-list', type: 'tool', position: { x: 600, y: 150 }, data: { label: 'Tool: listContacts', service: 'CRM' } },
    { id: 'tool-crm-create', type: 'tool', position: { x: 600, y: 250 }, data: { label: 'Tool: createContact', service: 'CRM' } },
    { id: 'tool-billing', type: 'tool', position: { x: 600, y: 350 }, data: { label: 'Tool: getUsageDetails', service: 'Billing' } },
    { id: 'tool-final-answer', type: 'tool', position: { x: 900, y: 250 }, data: { label: 'Output: Final Answer', schema: 'UserCommandOutput' } },
];

const initialEdges: Edge[] = [
    { id: 'e-trigger-agent', source: 'trigger-1', target: 'agent-1' },
    { id: 'e-agent-drsyntax', source: 'agent-1', target: 'tool-drsyntax' },
    { id: 'e-agent-crm-list', source: 'agent-1', target: 'tool-crm-list' },
    { id: 'e-agent-crm-create', source: 'agent-1', target: 'tool-crm-create' },
    { id: 'e-agent-billing', source: 'agent-1', target: 'tool-billing' },
    { id: 'e-agent-final', source: 'agent-1', target: 'tool-final-answer' },
];


export default function LoomPage() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }));

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node);
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, delta } = event;
        const nodeId = active.id as string;
        
        if (active.data.current?.isDraggableNode) {
            // A new node was dropped from the sidebar
            const type = active.data.current.type as NodeType;
            const label = active.data.current.label as string;
            
            const newNode: Node = {
                id: `${type}-${new Date().getTime()}`, // Simple unique ID
                type,
                position: { x: 250, y: 150 }, // Default position, user can move it
                data: { label: label },
            };
            
            setNodes((nds) => [...nds, newNode]);
        } else {
            // An existing node was moved
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        return { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y }};
                    }
                    return node;
                })
            );
        }
    }, []);

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


  return (
    <div className="flex flex-col h-full">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex-grow flex gap-4 min-h-0">
                <NodesSidebar />
                <WorkflowCanvas nodes={nodes} edges={edges} onNodeClick={handleNodeClick} selectedNodeId={selectedNode?.id} />
                <PropertyInspector node={selectedNode} onUpdate={updateNodeData} />
            </div>
        </DndContext>
        <footer className="text-center text-xs text-muted-foreground pt-4 flex-shrink-0">
            <p><Link href="/" className="hover:text-primary underline">Return to Canvas</Link></p>
        </footer>
    </div>
  );
}
