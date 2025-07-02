
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, Wifi, WifiOff, Settings, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';
import { IntegrationStatus } from '@prisma/client';
import { integrationManifests, type IntegrationManifest } from '@/config/integration-manifests';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '../ui/input';

type ConfiguredIntegration = {
    id: string;
    name: string;
    status: IntegrationStatus;
    manifest: IntegrationManifest;
};

const IntegrationCard = ({ integration, onDeleteSuccess }: { integration: ConfiguredIntegration, onDeleteSuccess: () => void }) => {
    const { toast } = useToast();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isActive = integration.status === 'active';

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/integrations/${integration.id}`, {
                method: 'DELETE',
            });
            if (response.status !== 204) {
                 const errorData = await response.json().catch(() => ({ error: 'Failed to delete integration.' }));
                 throw new Error(errorData.error);
            }
            toast({ title: 'Integration Removed', description: `The connection to ${integration.name} has been deleted.` });
            onDeleteSuccess();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    }

    return (
        <Card className="bg-background/50 hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-3">
                <Image src={integration.manifest.iconUrl} alt={integration.manifest.name} width={40} height={40} data-ai-hint={integration.manifest.imageHint} className="rounded-md" />
                <div className="flex-grow">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs">{integration.manifest.name}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isActive ? 'secondary' : 'destructive'} className="capitalize">
                        {isActive ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                        {integration.status}
                    </Badge>
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled><Settings className="h-4 w-4"/></Button>
                     <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the "{integration.name}" integration and revoke any associated access tokens. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting && <Loader2 className="animate-spin mr-2" />}
                                    Delete Integration
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
        </Card>
    );
};

const AddIntegrationDialog = ({ onAdd }: { onAdd: () => void }) => {
    const [selectedManifest, setSelectedManifest] = useState<IntegrationManifest | null>(null);
    const [instanceName, setInstanceName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!selectedManifest || !instanceName) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    integrationTypeId: selectedManifest.id,
                    name: instanceName,
                    configDetails: { apiKey }
                })
            });
            if (!response.ok) throw new Error('Failed to create integration.');
            toast({ title: "Integration created", description: `Successfully connected to ${selectedManifest.name}`});
            onAdd();
            setSelectedManifest(null);
            setInstanceName('');
            setApiKey('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    }

    if (selectedManifest) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                     <Image src={selectedManifest.iconUrl} alt={selectedManifest.name} width={40} height={40} data-ai-hint={selectedManifest.imageHint} className="rounded-md" />
                     <div>
                        <h4 className="font-bold">{selectedManifest.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedManifest.description}</p>
                     </div>
                </div>
                <Input placeholder="Instance Name (e.g., 'Primary Stripe Account')" value={instanceName} onChange={e => setInstanceName(e.target.value)} />
                {selectedManifest.authMethod === 'api_key' && (
                    <Input placeholder="API Key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                )}
                {selectedManifest.authMethod === 'oauth2' && (
                    <Button className="w-full">Authenticate with {selectedManifest.name}</Button>
                )}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedManifest(null)}>Back</Button>
                    <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2" />} Save Connection
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {integrationManifests.map(manifest => (
                <button key={manifest.id} onClick={() => setSelectedManifest(manifest)} className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent/50 transition-colors text-center">
                    <Image src={manifest.iconUrl} alt={manifest.name} width={48} height={48} data-ai-hint={manifest.imageHint} className="rounded-md" />
                    <p className="text-sm font-semibold mt-2">{manifest.name}</p>
                </button>
            ))}
        </div>
    )
}

export default function IntegrationNexus() {
  const [integrations, setIntegrations] = useState<ConfiguredIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations');
      if (!response.ok) throw new Error('Failed to fetch integrations.');
      const data = await response.json();
      setIntegrations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const onAddSuccess = () => {
      setIsAddDialogOpen(false);
      fetchIntegrations();
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <LinkIcon className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {integrations.length > 0 ? (
          <div className="space-y-3">
            {integrations.map(int => <IntegrationCard key={int.id} integration={int} onDeleteSuccess={fetchIntegrations} />)}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p className="font-semibold">No integrations configured.</p>
            <p className="text-sm">Connect to external services to expand the OS's capabilities.</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-2 space-y-3 h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2" />Add Integration</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect New Service</DialogTitle>
                    <DialogDescription>Select a service to integrate with your workspace.</DialogDescription>
                </DialogHeader>
                <AddIntegrationDialog onAdd={onAddSuccess} />
            </DialogContent>
        </Dialog>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {renderContent()}
      </div>
    </div>
  );
}
