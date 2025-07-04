
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import NodesSidebar from '@/components/loom/nodes-sidebar';
import WorkflowCanvas from '@/components/loom/workflow-canvas';
import PropertyInspector from '@/components/loom/property-inspector';
import LoomHeader from '@/components/loom/loom-header';
import WorkflowList from '@/components/loom/workflow-list';
import WorkflowRunHistory from '@/components/loom/workflow-run-history';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { User, Workspace, UserRole } from '@prisma/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { Node, Edge, Workflow, NodeType } from '@/components/loom/types';
import LoomMobileToolbar from '@/components/loom/loom-mobile-toolbar';
import ArchitectView from '@/components/loom/ArchitectView';

const BLANK_WORKFLOW: Workflow = {
  name: 'New Contact Follow-up',
  definition: {
    nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 50, y: 150 }, data: { label: 'BEEP Command Received' } },
        { id: 'tool-crm_agent', type: 'tool-crm_agent', position: { x: 250, y: 50 }, data: { label: 'CRM: Create Contact', action: 'create', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@aevonos.com' }},
        { id: 'logic-1', type: 'logic', position: { x: 480, y: 150 }, data: { label: 'Check for Email', variable: 'newContact.email', operator: 'exists', value: '' }},
        { id: 'tool-final-answer-true', type: 'tool-final-answer', position: { x: 700, y: 50 }, data: { label: 'Final Answer: Success' } },
        { id: 'tool-final-answer-false', type: 'tool-final-answer', position: { x: 700, y: 250 }, data: { label: 'Final Answer: Needs Info' } },
    ],
    edges: [
        { id: 'e-trigger-crm', source: 'trigger-1', target: 'tool-crm_agent' },
        { id: 'e-crm-logic', source: 'tool-crm_agent', target: 'logic-1' },
        { id: 'e-logic-true', source: 'logic-1', target: 'tool-final-answer-true', condition: 'true' },
        { id: 'e-logic-false', source: 'logic-1', target: 'tool-final-answer-false', condition: 'false' },
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [conditionEdgeInfo, setConditionEdgeInfo] = useState<{ sourceId: string; targetId: string } | null>(null);
    const [isArchitectView, setIsArchitectView] = useState(false);
    
    // Mobile Sheet States
    const [isNodesSheetOpen, setIsNodesSheetOpen] = useState(false);
    const [isWorkflowsSheetOpen, setIsWorkflowsSheetOpen] = useState(false);
    const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);


    const { toast } = useToast();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const isMobile = useIsMobile();
    
    const isInspectorSheetOpen = isMobile && !!selectedNode;

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoadingUser(true);
            try {
                const [userRes, workspaceRes] = await Promise.all([
                    fetch('/api/users/me'),
                    fetch('/api/workspaces/me'),
                ]);
                if (!userRes.ok) throw new Error('Could not fetch user permissions');
                if (!workspaceRes.ok) throw new Error('Could not fetch workspace data');
                
                const userData: User = await userRes.json();
                const workspaceData: Workspace = await workspaceRes.json();
                
                setUserRole(userData.role);
                setIsOwner(userData.id === workspaceData.ownerId);

            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
            } finally {
                setIsLoadingUser(false);
            }
        };
        fetchUserData();
    }, [toast]);

    useEffect(() => {
        setNodes(activeWorkflow.definition.nodes);
        setEdges(activeWorkflow.definition.edges);
        setSelectedNode(null);
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
        if (isMobile) {
            setIsWorkflowsSheetOpen(false);
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save workflow.');
            }
            
            const savedWorkflow = await response.json();
            setActiveWorkflow(savedWorkflow);
            setActiveWorkflowId(savedWorkflow.id);

            toast({ title: 'Success', description: 'Workflow saved.' });
            setListRefreshTrigger(val => val + 1);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleRun = async () => {
        if (!activeWorkflow?.id) return;
        setIsRunning(true);
        
        const triggerPayload = {
            message: "This is a test trigger from Loom Studio.",
            firstName: "Loom",
            lastName: "User",
            email: "loom.user@aevonos.com"
        };

        try {
            const response = await fetch(`/api/workflows/${activeWorkflow.id}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(triggerPayload)
            });

            if (response.status !== 202) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to trigger workflow.');
            }
            
            const runData = await response.json();
            toast({
                title: "Workflow Triggered",
                description: `Run ID: ${runData.runId}. Check history for status updates.`
            });
            setListRefreshTrigger(val => val + 1);

        } catch (e) {
            const error = e as Error;
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not trigger workflow run.' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!activeWorkflow?.id) return;
        
        try {
            const response = await fetch(`/api/workflows/${activeWorkflow.id}`, { method: 'DELETE' });
            if (response.status !== 204) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to delete workflow.');
            }
            
            toast({ title: 'Success', description: 'Workflow deleted.' });
            handleSelectWorkflow(null);
            setListRefreshTrigger(val => val + 1);
        } catch (e) {
             toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
        } finally {
            setIsDeleteDialogOpen(false);
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
            
            if (isMobile) {
                setIsNodesSheetOpen(false);
            }
            
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
            
            const newNodeData: Node['data'] = { label };
            if (type === 'tool-crm_agent') {
                newNodeData.action = 'list';
                newNodeData.label = 'CRM: List Contacts';
            }
            if (type === 'logic') {
                newNodeData.variable = 'payload.field';
                newNodeData.operator = 'exists';
                newNodeData.value = '';
            }

            const newNode: Node = { id: `${type}-${new Date().getTime()}`, type, position, data: newNodeData };
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
    }, [connection, isMobile]);

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
        
        const sourceNode = nodes.find(n => n.id === connection.sourceId);
        
        if (sourceNode?.type === 'logic') {
            setConditionEdgeInfo({ sourceId: connection.sourceId, targetId });
        } else {
             const newEdge: Edge = { id: `e-${connection.sourceId}-${targetId}`, source: connection.sourceId, target: targetId };
             if (!edges.some(e => e.id === newEdge.id)) {
                 setEdges((eds) => [...eds, newEdge]);
             }
        }

        setConnection(null);
    }, [connection, edges, nodes]);

    const handleAddConditionalEdge = (condition: 'true' | 'false') => {
        if (!conditionEdgeInfo) return;
        const { sourceId, targetId } = conditionEdgeInfo;
        const newEdge: Edge = { id: `e-${sourceId}-${targetId}-${condition}`, source: sourceId, target: targetId, condition };
        if (!edges.some(e => e.id === newEdge.id)) {
            setEdges((eds) => [...eds, newEdge]);
        }
        setConditionEdgeInfo(null);
    }

    const handleToggleArchitectView = () => {
        if (isOwner) {
            setIsArchitectView(prev => !prev);
        } else {
            toast({
                variant: 'destructive',
                title: 'Forbidden',
                description: 'You do not have the required privileges to enter Architect View.',
            });
        }
    };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-full w-full relative">
            <div className="absolute top-0 z-[-2] h-full w-full bg-background">
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
                />
                <div 
                    className="absolute inset-0 animate-aurora bg-[linear-gradient(135deg,hsl(var(--iridescent-one)/0.2),hsl(var(--iridescent-two)/0.2)_50%,hsl(var(--iridescent-three)/0.2)_100%)] bg-[length:600%_600%]"
                />
                <div className="absolute inset-0 grain-overlay" />
            </div>
            
            <LoomHeader 
                activeWorkflow={activeWorkflow}
                onWorkflowNameChange={handleWorkflowNameChange}
                onSave={handleSave}
                onRun={handleRun}
                onDelete={() => setIsDeleteDialogOpen(true)}
                isSaving={isSaving}
                isRunning={isRunning}
                isOwner={isOwner}
                userRole={userRole}
                isLoadingUser={isLoadingUser}
                isArchitectView={isArchitectView}
                onToggleArchitectView={handleToggleArchitectView}
            />
            
             {isArchitectView ? (
                <ArchitectView />
            ) : (
                 <div className="flex-grow flex flex-row min-h-0">
                    {/* Desktop Left Panel */}
                    <div className="w-64 flex-shrink-0 flex-col min-h-0 border-r border-foreground/20 hidden md:flex">
                        <div className="h-[60%] min-h-0 border-b border-foreground/20">
                            <WorkflowList onSelectWorkflow={handleSelectWorkflow} activeWorkflowId={activeWorkflowId} triggerRefresh={listRefreshTrigger}/>
                        </div>
                        <div className="h-[40%] min-h-0">
                            <WorkflowRunHistory activeWorkflowId={activeWorkflowId} triggerRefresh={listRefreshTrigger}/>
                        </div>
                    </div>

                    {/* Main Content Area (Canvas and sidebars) */}
                    <div className="flex-grow flex gap-4 p-4 min-h-0">
                        <div className="hidden md:block">
                            <NodesSidebar />
                        </div>
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
                        <div className="hidden lg:block">
                            <PropertyInspector node={selectedNode} onUpdate={updateNodeData} />
                        </div>
                    </div>
                </div>
            )}


            {/* Mobile Toolbar */}
            {isMobile && !isArchitectView && (
                <LoomMobileToolbar 
                    onAddNodeClick={() => setIsNodesSheetOpen(true)}
                    onWorkflowsClick={() => setIsWorkflowsSheetOpen(true)}
                    onHistoryClick={() => setIsHistorySheetOpen(true)}
                />
            )}

            {/* Mobile Sheets */}
            <Sheet open={isNodesSheetOpen} onOpenChange={setIsNodesSheetOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <NodesSidebar />
                </SheetContent>
            </Sheet>
            <Sheet open={isInspectorSheetOpen} onOpenChange={(open) => { if (!open) setSelectedNode(null); }}>
                <SheetContent side="right" className="p-0 w-80">
                    <PropertyInspector node={selectedNode} onUpdate={updateNodeData} />
                </SheetContent>
            </Sheet>
            <Sheet open={isWorkflowsSheetOpen} onOpenChange={setIsWorkflowsSheetOpen}>
                <SheetContent side="left" className="p-0 w-[85%] max-w-sm">
                    <WorkflowList onSelectWorkflow={handleSelectWorkflow} activeWorkflowId={activeWorkflowId} triggerRefresh={listRefreshTrigger}/>
                </SheetContent>
            </Sheet>
            <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
                <SheetContent side="left" className="p-0 w-[85%] max-w-sm">
                    <WorkflowRunHistory activeWorkflowId={activeWorkflowId} triggerRefresh={listRefreshTrigger}/>
                </SheetContent>
            </Sheet>

            {/* Condition Dialog */}
            <AlertDialog open={!!conditionEdgeInfo} onOpenChange={() => setConditionEdgeInfo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Set Branch Condition</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select the condition for this path. The workflow will follow this branch if the logic node's evaluation is...
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogAction onClick={() => handleAddConditionalEdge('true')}>
                        True
                    </AlertDialogAction>
                    <AlertDialogAction onClick={() => handleAddConditionalEdge('false')}>
                        False
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the
                        workflow "{activeWorkflow?.name || 'this workflow'}".
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </DndContext>
  );
}
