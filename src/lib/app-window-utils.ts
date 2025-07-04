
'use client';

import type { MicroAppType, MicroApp } from '@/store/app-store';
import { artifactManifests } from '@/config/artifacts';

/**
 * Retrieves the default size for a given Micro-App type from its manifest.
 * @param type The type of the Micro-App.
 * @returns An object with the default width and height.
 */
export function getAppDefaultSize(type: MicroAppType): { width: number; height: number } {
    const manifest = artifactManifests.find(a => a.id === type);
    return manifest?.defaultSize || { width: 400, height: 500 };
}

interface CalculatePositionInput {
    appType: MicroAppType;
    lastPosition: { x: number; y: number } | null;
}

interface CalculatedPosition {
    position: { x: number; y: number };
    size: { width: number; height: number };
}

/**
 * Calculates the initial position and size for a new Micro-App window.
 * It handles cascading windows on desktop and provides a sensible default for mobile.
 * This function should only be called on the client side.
 * @param input An object containing the app type and the last known position.
 * @returns An object with the calculated position and size.
 */
export function calculateNewAppPosition(input: CalculatePositionInput): CalculatedPosition {
    const { appType, lastPosition } = input;
    
    const isMobile = window.innerWidth < 768;
    const defaultSize = getAppDefaultSize(appType);

    if (isMobile) {
        return {
            size: { width: window.innerWidth - 32, height: window.innerHeight * 0.7 },
            position: { x: 16, y: 80 }
        };
    }

    // Desktop cascading logic
    const cascadeOffset = 30;
    const topBarHeight = 80; // Approximate height of the top bar
    let newPosition: { x: number; y: number };

    if (lastPosition) {
        newPosition = {
            x: lastPosition.x + cascadeOffset,
            y: lastPosition.y + cascadeOffset,
        };
        // Reset cascade if it goes off-screen
        if (
            newPosition.x + defaultSize.width > window.innerWidth ||
            newPosition.y + defaultSize.height > window.innerHeight
        ) {
            newPosition = { x: 100, y: topBarHeight + 20 };
        }
    } else {
        // First window placement, roughly centered
        newPosition = {
            x: Math.max(50, (window.innerWidth - defaultSize.width) / 2),
            y: Math.max(topBarHeight, (window.innerHeight - defaultSize.height) / 2),
        };
    }

    return {
        position: newPosition,
        size: defaultSize
    };
}
