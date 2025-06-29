
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateDossier } from '@/ai/agents/dossier-agent';
import { DossierInputSchema } from '@/ai/agents/dossier-schemas';
import { pdf } from 'md-to-pdf';
import CryptoJS from 'crypto-js';
import { getServerActionSession } from '@/lib/auth';

const ExportRequestSchema = z.object({
  format: z.enum(['pdf', 'json']),
  encrypt: z.boolean().optional(),
  password: z.string().optional(),
  dossierInput: DossierInputSchema.omit({ workspaceId: true }),
});


export async function POST(request: NextRequest) {
    try {
        const session = await getServerActionSession();
        if (!session?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = ExportRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid export request', issues: validation.error.issues }, { status: 400 });
        }
        
        const { format, encrypt, password, dossierInput } = validation.data;

        if (encrypt && !password) {
            return NextResponse.json({ error: 'Password is required for encryption.' }, { status: 400 });
        }
        
        const fullDossierInput = {
            ...dossierInput,
            workspaceId: session.workspaceId,
        };
        
        const { markdownContent, fileName } = await generateDossier(fullDossierInput);

        if (format === 'json') {
            let content: string | CryptoJS.lib.CipherParams = JSON.stringify({
                ...dossierInput,
                markdownContent,
            }, null, 2);
            if (encrypt) {
                content = CryptoJS.AES.encrypt(content, password!).toString();
            }
            return new NextResponse(content, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${fileName.replace('.pdf', '.json')}"`,
                },
            });
        }
        
        // PDF generation
        const pdfFile = await pdf({ content: markdownContent }, {
            launch_options: { args: ['--no-sandbox'] }
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            throw new Error("Failed to generate PDF from markdown.");
        });

        if (!pdfFile || !pdfFile.content) {
            throw new Error('Failed to generate PDF content.');
        }

        let fileBuffer = pdfFile.content;

        if (encrypt) {
            const encrypted = CryptoJS.AES.encrypt(fileBuffer.toString('base64'), password!).toString();
            fileBuffer = Buffer.from(encrypted);
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        console.error('[API /export/dossier POST]', error);
        return NextResponse.json({ error: 'Failed to export dossier.' }, { status: 500 });
    }
}
