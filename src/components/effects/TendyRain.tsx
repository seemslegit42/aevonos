
'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TendyRain = () => {
    const tenders = Array.from({ length: 50 }); // More tenders for a good downpour

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[9999]">
            {tenders.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -100, x: `${Math.random() * 100}vw`, opacity: 0 }}
                    animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration: Math.random() * 2 + 3, // 3-5 seconds duration
                        delay: Math.random() * 1, // staggered start
                        ease: 'linear',
                    }}
                    style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: '-50px',
                    }}
                >
                    <motion.span 
                        className="text-4xl" 
                        role="img" 
                        aria-label="chicken tender"
                        style={{display: 'inline-block'}}
                        animate={{rotate: Math.random() * 720 - 360}}
                        transition={{ duration: Math.random() * 2 + 3, ease: 'linear', repeat: Infinity}}
                    >
                        🍗
                    </motion.span>
                </motion.div>
            ))}
        </div>
    );
};

export default TendyRain;
