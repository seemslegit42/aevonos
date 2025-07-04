
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { LayoutGrid, LucideProps } from 'lucide-react';
import { LoomIcon } from '@/components/icons/LoomIcon';
import { ArmoryIcon } from '@/components/icons/ArmoryIcon';
import { AegisThreatScopeIcon } from '../icons/AegisThreatScopeIcon';
import { BeepIcon } from '../icons/BeepIcon';
import type { MicroAppType } from '@/store/app-store';
import { Button } from '../ui/button';

type NavItem = {
    label: string;
    icon: React.ComponentType<LucideProps> | React.FC<React.SVGProps<SVGSVGElement>>;
} & ({
    href: string;
    appType?: never;
} | {
    href?: never;
    appType: MicroAppType;
});

const leftNavItems: NavItem[] = [
    { label: 'Canvas', href: '/', icon: LayoutGrid },
    { label: 'Loom', href: '/loom', icon: LoomIcon },
];

const rightNavItems: NavItem[] = [
    { label: 'Armory', appType: 'armory', icon: ArmoryIcon },
    { label: 'Threats', appType: 'aegis-threatscope', icon: AegisThreatScopeIcon },
];


const NavButton = ({ item }: { item: NavItem }) => {
    const pathname = usePathname();
    const { upsertApp } = useAppStore();
    const isActive = item.href ? pathname === item.href : false;
    const Icon = item.icon;

    const handleAppLaunch = (item: Extract<NavItem, { appType: MicroAppType }>) => {
        const appId = `singleton-${item.appType}`;
        upsertApp(item.appType, { id: appId });
    }

    const content = (
        <>
            <Icon className={cn("h-6 w-6 mb-0.5 transition-colors duration-200", isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
            <span className={cn("text-[10px] transition-colors duration-200", isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground')}>
                {item.label}
            </span>
        </>
    );

    const buttonClasses = "group flex flex-col items-center justify-center h-full w-16 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg";
    
    return (
         <div className="flex-1">
            {item.href ? (
                <Link href={item.href} className={buttonClasses}>
                    {content}
                </Link>
            ) : (
                <button onClick={() => handleAppLaunch(item as any)} className={buttonClasses}>
                    {content}
                </button>
            )}
        </div>
    )
}

export default function BottomNavBar() {
    const handleBeepFocus = () => {
        document.querySelector<HTMLInputElement>('input[name="command"]')?.focus();
    }
    
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 md:hidden z-50"
        >
            <div className="relative w-full h-full flex items-center justify-around bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg rounded-2xl">
                {leftNavItems.map((item) => <NavButton key={item.label} item={item} />)}

                <div className="relative -top-5">
                     <Button variant="summon" onClick={handleBeepFocus} className="group relative w-16 h-16 rounded-full border-4 border-background shadow-lg transition-transform duration-200 hover:scale-110 active:scale-100 focus:outline-none focus:ring-4 focus:ring-primary/50" aria-label="Summon BEEP">
                        <BeepIcon className="w-14 h-14 text-primary-foreground group-hover:animate-pulse" />
                    </Button>
                </div>
                
                {rightNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </div>
        </motion.div>
    );
}
