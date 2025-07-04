
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateDossier } from '@/ai/agents/dossier-agent';
import { DossierInputSchema } from '@/ai/agents/dossier-schemas';
import { pdf } from 'md-to-pdf';
import { createCipheriv, scryptSync, randomBytes } from 'crypto';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

const ExportRequestSchema = z.object({
  format: z.enum(['pdf', 'json']),
  encrypt: z.boolean().optional(),
  password: z.string().optional(),
  dossierInput: DossierInputSchema.omit({ workspaceId: true, userId: true }),
});

const ALGORITHM = 'aes-256-cbc';
const SALT = 'aevon-salt-is-not-for-eating'; // Should be unique and stored securely


export async function POST(request: NextRequest) {
    try {
        const { user: sessionUser, workspace } = await getAuthenticatedUser();
        
        if (!sessionUser || !workspace) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const body = await request.json();
        const validation = ExportRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid export request', issues: validation.error.issues }, { status: 400 });
        }
        
        const { format, encrypt, password, dossierInput } = validation.data;

        if (encrypt && (!password || password.length < 8)) {
            return NextResponse.json({ error: 'A password of at least 8 characters is required for encryption.' }, { status: 400 });
        }
        
        const fullDossierInput = {
            ...dossierInput,
            workspaceId: workspace.id,
            userId: sessionUser.id,
        };
        
        const { markdownContent, fileName } = await generateDossier(fullDossierInput);

        const encryptData = (data: string | Buffer): Buffer => {
            const key = scryptSync(password!, SALT, 32);
            const iv = randomBytes(16);
            const cipher = createCipheriv(ALGORITHM, key, iv);
            const encryptedBuffer = Buffer.concat([cipher.update(data), cipher.final()]);
            // Prepend IV for decryption
            return Buffer.concat([iv, encryptedBuffer]);
        };


        if (format === 'json') {
            const jsonData = JSON.stringify({
                ...dossierInput,
                markdownContent,
            }, null, 2);
            
            const content = encrypt ? encryptData(jsonData) : Buffer.from(jsonData);
            
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
            fileBuffer = encryptData(fileBuffer);
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('[API /export/dossier POST]', error);
        return NextResponse.json({ error: 'Failed to export dossier.' }, { status: 500 });
    }
}
