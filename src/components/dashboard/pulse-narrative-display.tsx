'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PulseNarrativeDisplay() {
    const [narrative, setNarrative] = useState<string | null>(null);

    useEffect(() => {
        const fetchNarrative = async () => {
            try {
                const res = await fetch('/api/user/pulse');
                if (res.ok) {
                    const data = await res.json();
                    setNarrative(data.narrative);
                }
            } catch (error) {
                // Silently fail, this is a non-critical feature
                console.error("Failed to fetch pulse narrative:", error);
            }
        };

        // Fetch immediately and then set an interval to refresh
        fetchNarrative();
        const interval = setInterval(fetchNarrative, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-10 text-center px-4 md:bottom-12">
            <AnimatePresence>
                {narrative && (
                    <motion.p
                        key={narrative} // Animate on text change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.7 }}
                        className="text-sm font-medium text-muted-foreground italic"
                        style={{textShadow: '0 0 5px hsl(var(--background))'}}
                    >
                        {`" ${narrative} "`}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
