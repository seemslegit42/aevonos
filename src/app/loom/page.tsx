
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import NodesSidebar, { NodeType } from '@/components/loom/nodes-sidebar';
import WorkflowCanvas from '@/components/loom/workflow-canvas';
import PropertyInspector from '@/components/loom/property-inspector';
import LoomHeader from '@/components/loom/loom-header';
import WorkflowList from '@/components/loom/workflow-list';
import { useToast } from '@/hooks/use-toast';

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
  id?: string; // Now CUID from DB
  name: string;
  definition: {
    nodes: Node[];
    edges: Edge[];
  };
}

const BLANK_WORKFLOW: Workflow = {
  name: 'Untitled Workflow',
  definition: {
    nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'BEEP Command Received' } },
        { id: 'agent-1', type: 'agent', position: { x: 350, y: 150 }, data: { label: 'BEEP Agent Kernel' } },
        { id: 'tool-final-answer', type: 'tool-final-answer', position: { x: 650, y: 150 }, data: { label: 'Final Answer' } },
    ],
    edges: [
        { id: 'e-trigger-agent', source: 'trigger-1', target: 'agent-1' },
        { id: 'e-agent-final', source: 'agent-1', target: 'tool-final-answer' },
    ],
  },
};


export default function LoomPage() {
    const [activeWorkflow, setActiveWorkflow] = useState<Workflow>(BLANK_WORKFLOW);
    const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

    const [nodes, setNodes] = useState<Node[]>(activeWorkflow.definition.nodes);
    const [edges, setEdges] = useState<Edge[]>(activeWorkflow.definition.edges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connection, setConnection] = useState<{ sourceId: string; } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [listRefreshTrigger, setListRefreshTrigger] = useState(0);

    const { toast } = useToast();

    useEffect(() => {
        setNodes(activeWorkflow.definition.nodes);
        setEdges(activeWorkflow.definition.edges);
    }, [activeWorkflow]);
    
    const handleSelectWorkflow = async (id: string | null) => {
        setSelectedNode(null);
        setActiveWorkflowId(id);
        if (id) {
            try {
                const response = await fetch(`/api/workflows/${id}`);
                const data = await response.json();
                setActiveWorkflow(data);
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load workflow.' });
                setActiveWorkflow(BLANK_WORKFLOW);
            }
        } else {
            setActiveWorkflow(BLANK_WORKFLOW);
        }
    };
    
    const handleWorkflowNameChange = (name: string) => {
        setActiveWorkflow(prev => ({ ...prev, name }));
    };

    const handleSave = async () => {
        if (!activeWorkflow) return;
        setIsSaving(true);
        
        const workflowToSave = {
            ...activeWorkflow,
            definition: { nodes, edges }
        };

        try {
            const url = activeWorkflow.id ? `/api/workflows/${activeWorkflow.id}` : '/api/workflows';
            const method = activeWorkflow.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workflowToSave.name,
                    definition: workflowToSave.definition,
                })
            });

            if (!response.ok) throw new Error('Failed to save workflow.');
            
            const savedWorkflow = await response.json();
            setActiveWorkflow(savedWorkflow);
            setActiveWorkflowId(savedWorkflow.id);

            toast({ title: 'Success', description: 'Workflow saved.' });
            setListRefreshTrigger(val => val + 1);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save workflow.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleRun = async () => {
        if (!activeWorkflow?.id) return;
        setIsRunning(true);
        toast({ title: 'Executing...', description: `Triggering workflow: ${activeWorkflow.name}` });
        
        try {
             const response = await fetch(`/api/workflows/${activeWorkflow.id}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggeredBy: 'LoomUI' }) // Example payload
            });
            if (response.status !== 202) throw new Error('Failed to trigger workflow run.');
            const runSummary = await response.json();
            toast({ title: 'Workflow Run Initiated', description: `Run ID: ${runSummary.runId}` });
        } catch(e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not trigger workflow.' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleDelete = async () => {
        if (!activeWorkflow?.id) return;
        if (!confirm(`Are you sure you want to delete "${activeWorkflow.name}"? This cannot be undone.`)) return;

        try {
            const response = await fetch(`/api/workflows/${activeWorkflow.id}`, { method: 'DELETE' });
            if (response.status !== 204) throw new Error('Failed to delete workflow.');
            
            toast({ title: 'Success', description: 'Workflow deleted.' });
            handleSelectWorkflow(null); // Reset to new workflow
            setListRefreshTrigger(val => val + 1);
        } catch (e) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not delete workflow.' });
        }
    }


    const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }));

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (connection) return;

        const { active, delta, over } = event;
        
        if (active.data.current?.isDraggableNode && over?.id === 'canvas') {
            const type = active.data.current.type as NodeType;
            const label = active.data.current.label as string;
            
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            let position = { x: 100, y: 100 };

            if (canvasRect && event.active.rect.current.translated) {
                const nodeWidth = 192;
                const nodeHeight = 68;
                position = {
                    x: event.active.rect.current.translated.left - canvasRect.left - (nodeWidth / 2),
                    y: event.active.rect.current.translated.top - canvasRect.top - (nodeHeight / 2),
                };
            }
            
            const newNode: Node = { id: `${type}-${new Date().getTime()}`, type, position, data: { label } };
            setNodes((nds) => [...nds, newNode]);
            setSelectedNode(newNode);
        } else if (over) {
            setNodes((nds) =>
                nds.map((node) => node.id === active.id 
                    ? { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y } }
                    : node
                )
            );
        }
    }, [connection]);

    const updateNodeData = (nodeId: string, newData: any) => {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n));
        if (selectedNode?.id === nodeId) {
            setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
        }
    };

    const onConnectStart = useCallback((sourceId: string) => setConnection({ sourceId }), []);

    const onConnectEnd = useCallback((targetId: string | null) => {
        if (!connection || !targetId || connection.sourceId === targetId) {
            setConnection(null);
            return;
        }

        const newEdge: Edge = { id: `e-${connection.sourceId}-${targetId}`, source: connection.sourceId, target: targetId };
        if (!edges.some(e => e.id === newEdge.id)) {
            setEdges((eds) => [...eds, newEdge]);
        }
        setConnection(null);
    }, [connection, edges]);

  return (
    <div className="flex flex-col h-full bg-background">
        <LoomHeader 
            activeWorkflow={activeWorkflow}
            onWorkflowNameChange={handleWorkflowNameChange}
            onSave={handleSave}
            onRun={handleRun}
            onDelete={handleDelete}
            isSaving={isSaving}
            isRunning={isRunning}
        />
        <div className="flex-grow flex min-h-0">
            <WorkflowList onSelectWorkflow={handleSelectWorkflow} activeWorkflowId={activeWorkflowId} triggerRefresh={listRefreshTrigger}/>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex-grow flex gap-4 p-4 min-h-0">
                    <NodesSidebar />
                    <WorkflowCanvas 
                        ref={canvasRef}
                        nodes={nodes} 
                        edges={edges} 
                        onNodeClick={setSelectedNode} 
                        selectedNodeId={selectedNode?.id}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        connectionSourceId={connection?.sourceId}
                    />
                    <PropertyInspector node={selectedNode} onUpdate={updateNodeData} />
                </div>
            </DndContext>
        </div>
    </div>
  );
}
