'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { LayoutGrid, LucideProps } from 'lucide-react';
import { LoomIcon } from '@/components/icons/LoomIcon';
import { ArmoryIcon } from '@/components/icons/ArmoryIcon';
import { AegisThreatScopeIcon } from '../icons/AegisThreatScopeIcon';
import type { MicroAppType } from '@/store/app-store';

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

const navItems: NavItem[] = [
    { label: 'Canvas', href: '/', icon: LayoutGrid },
    { label: 'Loom', href: '/loom', icon: LoomIcon },
    { label: 'Armory', appType: 'armory', icon: ArmoryIcon },
    { label: 'Threats', appType: 'aegis-threatscope', icon: AegisThreatScopeIcon },
];

export default function BottomNavBar() {
    const pathname = usePathname();
    const { upsertApp } = useAppStore();

    const handleAppLaunch = (item: Extract<NavItem, { appType: MicroAppType }>) => {
        const appId = `singleton-${item.appType}`;
        upsertApp(item.appType, { id: appId });
    }
    
    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 md:hidden bg-background/80 backdrop-blur-lg border-t border-foreground/30 z-50">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const Icon = item.icon;

                    const content = (
                        <>
                            <Icon className={cn("h-6 w-6 mb-1 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')} />
                            <span className={cn("text-xs transition-colors", isActive ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                                {item.label}
                            </span>
                        </>
                    );

                    return (
                        <div key={item.label} className="flex-1">
                            {item.href ? (
                                <Link href={item.href} className="flex flex-col items-center justify-center h-full">
                                    {content}
                                </Link>
                            ) : (
                                <button onClick={() => handleAppLaunch(item as any)} className="w-full flex flex-col items-center justify-center h-full">
                                    {content}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
