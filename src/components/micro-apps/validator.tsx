
'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, Fingerprint, ShieldCheck, ShieldAlert, FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type VerificationStatus = 'idle' | 'success' | 'error';

// Helper function for SHA256 hashing using Web Crypto API
async function calculateSha256(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export default function Validator() {
  const [file, setFile] = useState<File | null>(null);
  const [inputHash, setInputHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultStatus, setResultStatus] = useState<VerificationStatus>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResultStatus('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  };
  
  const handleDragEvents = (e: DragEvent<HTMLDivElement>, isEntering: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isEntering);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelect(e.dataTransfer.files[0]);
      }
  };


  const handleVerify = () => {
    if (!file || !inputHash) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Provide both the file and its SHA256 hash.',
      });
      return;
    }

    setIsVerifying(true);
    setResultStatus('idle');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const calculatedHash = await calculateSha256(arrayBuffer);

        if (calculatedHash === inputHash.toLowerCase().trim()) {
          setResultStatus('success');
          setResultMessage(`INTEGRITY CONFIRMED. This artifact is pure, uncut truth.`);
        } else {
          setResultStatus('error');
          setResultMessage(`TAMPERING DETECTED. The hash does not match. This artifact is compromised.`);
        }
      } catch (error) {
        setResultStatus('error');
        setResultMessage('An error occurred while hashing the file.');
        console.error("Hashing error:", error);
      } finally {
        setIsVerifying(false);
      }
    };
    reader.onerror = () => {
        setResultStatus('error');
        setResultMessage('Failed to read the file.');
        setIsVerifying(false);
    }
    reader.readAsArrayBuffer(file);
  };

  const ResultAlert = () => {
      if (resultStatus === 'idle') return null;
      const isSuccess = resultStatus === 'success';
      const Icon = isSuccess ? ShieldCheck : ShieldAlert;
      const variant = isSuccess ? 'default' : 'destructive';
      const className = isSuccess ? "border-accent text-accent" : "border-destructive text-destructive";

      return (
           <Alert variant={variant} className={cn('bg-background/80', className)}>
              <Icon className="h-4 w-4" />
              <AlertTitle className="font-bold">{title}</AlertTitle>
              <AlertDescription className="text-foreground/80 text-xs">
                  {resultMessage}
              </AlertDescription>
           </Alert>
      )
  };

  return (
    <div className="p-2 h-full flex flex-col space-y-4">
       <div 
          className={cn(
              "relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 flex-grow flex flex-col items-center justify-center",
              isDragging && "border-primary bg-primary/10"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
       >
          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              {file ? (
                  <>
                    <FileIcon className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  </>
              ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <p className="text-sm">Drag & drop file or <span className="font-bold text-primary">browse</span></p>
                    <p className="text-xs">Supports .pdf, .json, etc.</p>
                  </>
              )}
          </div>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.json,.txt"
          />
       </div>

      <div className="relative">
        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Paste SHA256 integrity hash here..."
          value={inputHash}
          onChange={(e) => setInputHash(e.target.value)}
          className="pl-10 font-mono bg-background/80"
          disabled={isVerifying}
        />
      </div>
      <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={handleVerify} disabled={isVerifying || !file || !inputHash} className="w-full">
                    {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify Integrity'}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Compare the file's hash against the expected value.</p>
            </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {resultStatus !== 'idle' && <ResultAlert />}
    </div>
  );
}
