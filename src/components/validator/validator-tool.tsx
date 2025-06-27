
'use client';

import React, { useState, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileCheck, FileX, Loader2, Upload, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type VerificationStatus = 'idle' | 'success' | 'error';

export default function ValidatorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [inputHash, setInputHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultStatus, setResultStatus] = useState<VerificationStatus>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultStatus('idle');
    }
  };

  const handleVerify = () => {
    if (!file || !inputHash) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both a file and its SHA256 hash.',
      });
      return;
    }

    setIsVerifying(true);
    setResultStatus('idle');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const calculatedHash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

        if (calculatedHash === inputHash.toLowerCase().trim()) {
          setResultStatus('success');
          setResultMessage(`Hash match confirmed. Document integrity is intact. Computed hash: ${calculatedHash}`);
        } else {
          setResultStatus('error');
          setResultMessage(`Hash mismatch. Document may have been altered. Computed hash: ${calculatedHash}`);
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

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2" />
          {file ? `Selected: ${file.name}` : 'Select Dossier File (.pdf, .json)'}
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.json"
        />
      </div>
      <div className="relative">
        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Paste SHA256 integrity hash here..."
          value={inputHash}
          onChange={(e) => setInputHash(e.target.value)}
          className="pl-10 font-mono"
          disabled={isVerifying}
        />
      </div>
      <Button onClick={handleVerify} disabled={isVerifying || !file || !inputHash} className="w-full">
        {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify Integrity'}
      </Button>

      {resultStatus !== 'idle' && (
        <Alert variant={resultStatus === 'success' ? 'default' : 'destructive'} className={cn(resultStatus === 'success' && 'border-accent')}>
          {resultStatus === 'success' ? <FileCheck className="h-4 w-4" /> : <FileX className="h-4 w-4" />}
          <AlertTitle>{resultStatus === 'success' ? 'Verification Successful' : 'Verification Failed'}</AlertTitle>
          <AlertDescription className="text-xs break-all">{resultMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
