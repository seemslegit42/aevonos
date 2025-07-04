
'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function RegisterRedirectPage() {
    useEffect(() => {
        redirect('/login');
    }, []);

    return null;
}
