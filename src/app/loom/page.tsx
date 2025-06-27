
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
    { id: '1', type: 'trigger', position: { x: 100, y: 200 }, data: { label: 'Webhook Received' } },
    { id: '2', type: 'agent', position: { x: 400, y: 100 }, data: { label: 'Analyze Sentiment', model: 'gemini-2.0-flash' } },
    { id: '3', type: 'logic', position: { x: 400, y: 300 }, data: { label: 'Check if Positive' } },
    { id: '4', type: 'tool', position: { x: 700, y: 100 }, data: { label: 'Add to CRM' } },
    { id: '5', type: 'tool', position: { x: 700, y: 300 }, data: { label: 'Notify Slack' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
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
