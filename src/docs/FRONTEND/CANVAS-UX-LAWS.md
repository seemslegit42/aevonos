# ΛΞVON OS: Frontend - Canvas UX Laws

## 1. The Canvas: The Sacred Stage of ΛΞVON OS

The Canvas is the persistent, living core of the ΛΞVON OS user interface. It is not a tabbed interface, a dashboard, or a traditional web page. It is the **"sacred stage"** where all work unfolds, orchestrating context-aware Micro-Apps and always reflecting the current thread of work.

### 1.1. Nature of the Canvas

*   **A Live Workspace**: The Canvas is a dynamic, interactive environment where users engage directly with their data and automated processes.
*   **Hosting Context-Aware Micro-Apps**: All core functionality is delivered through Micro-Apps that dynamically populate and interact within the Canvas.
*   **Orchestrated by BEEP**: BEEP, the agentic brain, plays the central role in managing, suggesting, and responding to activity within the Canvas, guiding the user's experience.
*   **Reflecting the Current Thread of Work**: The content and arrangement of Micro-Apps on the Canvas should intuitively guide the user through their ongoing tasks and automated workflows, minimizing distraction and cognitive load.

## 2. Canvas UX Laws: The Absolute Non-Negotiables

These laws define the unique interaction model of ΛΞVON OS and MUST be adhered to by all frontend development.

### Law 1: No Global Navbars. Context Defines View.
**Principle**: Unlike traditional applications with persistent left or top global navigation menus, ΛΞVON OS relies solely on context and BEEP's intelligence to guide the user. On desktop, there are no global navigation elements beyond the single persistent TopBar.
**Implication**: The appearance of Micro-Apps, their content, and BEEP's suggestions will implicitly guide the user through different functional areas based on their current task or query. Navigation is conversational and contextual, not menu-driven.
**Mobile Caveat**: The mobile experience, as per the Prime Directive, is a native-first reimagination. It employs a dedicated, persistent `BottomNavBar` for core actions, acknowledging the ergonomic constraints of the small screen.

### Law 2: Only One Persistent TopBar.
**Principle**: The TopBar is the only truly permanent global interface element in ΛΞVON OS. It is fixed at the top and never disappears or scrolls.
**Implication**: All other UI elements within the Canvas (Micro-Apps, notifications, temporary panels) are designed to be dynamic and flexible, ensuring they do not compete with the TopBar's global constancy.

### Law 3: Micro-Apps are Draggable, Resizable, and Stackable.
**Principle**: Micro-Apps within the Canvas must behave like flexible desktop windows, allowing users full control over their spatial arrangement.
**Implication**: Developers must implement robust drag-and-drop functionality, resizing handles, and stacking/layering capabilities (z-index management) for every Micro-App. This enables spatial memory and user customization of their workspace.

### Law 4: No Modal Chaos. Use Spatial Memory.
**Principle**: Avoid the proliferation of disruptive modal windows that break user flow and hide underlying context.
**Implication**: For secondary interactions or detail views (e.g., editing a contact, viewing usage details), prioritize opening new Micro-App instances or expanding existing ones. The system should rely on the spatial arrangement of Micro-Apps to maintain workflow context, rather than hiding it behind overlapping modals.

### Law 5: Agent Outputs and User Tasks Coexist, Not Compete.
**Principle**: The Canvas must seamlessly integrate output from AI agents and user-assigned tasks without overwhelming the user.
**Implication**: Agent responses, workflow progress updates, and task lists are presented within dedicated Micro-Apps or subtly integrated elements that are easily digestible and do not clutter the primary workspace, aligning with the "digital Zen garden" philosophy.

## 3. The "Ancient Roman Glass" Aesthetic Directive

All floating UI elements (Cards, Popovers, Dialogs, Menus) MUST adhere to a unified glassmorphism style to maintain visual harmony and a sense of tangible, layered reality. This is not optional.

### 3.1. Canonical Styling
The standard implementation for any glassmorphic surface in ΛΞVON OS is a precise combination of background color, blur, border, and shadow. The canonical Tailwind CSS classes for this effect are:

`bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg`

-   **`bg-background/70`**: A semi-transparent background using the current theme's `--background` color. This ensures adaptability across all Covenant themes.
-   **`backdrop-blur-xl`**: A significant blur effect on the content behind the element, creating the frosted glass look.
-   **`border border-border/20`**: A very subtle, semi-transparent border using the theme's `--border` color, which gives the glass a defined edge.
-   **`shadow-lg`**: A soft shadow to lift the element off the Canvas, enhancing the sense of depth and layer.

### 3.2. Implementation
This styling MUST be implemented in the base UI components (`ui/card.tsx`, `ui/dialog.tsx`, `ui/popover.tsx`, etc.). All other components, such as `MicroAppCard`, MUST inherit this styling by using the base components, not by reimplementing the style with hardcoded values. This ensures a consistent, maintainable, and doctrinally-aligned visual language across the entire OS.
```
- src/components/layout/bottom-nav-bar.tsx</file>
    <content><![CDATA[
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
                    <button onClick={handleBeepFocus} className="group relative w-16 h-16 flex items-center justify-center bg-gradient-to-r from-primary to-roman-aqua rounded-full border-4 border-background shadow-lg transition-transform duration-200 hover:scale-110 active:scale-100 focus:outline-none focus:ring-4 focus:ring-primary/50">
                        <BeepIcon className="w-14 h-14 text-primary-foreground group-hover:animate-pulse" />
                    </button>
                </div>
                
                {rightNavItems.map((item) => <NavButton key={item.label} item={item} />)}
            </div>
        </motion.div>
    );
}
```
- src/components/layout/top-bar.tsx</file>
    <content><![CDATA[
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { User, Workspace } from '@prisma/client';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type UserProp = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'agentAlias'> | null;

interface TopBarProps {
  user: UserProp;
  workspace: Workspace | null;
}

const CurrentTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    // This logic ensures the time is only rendered on the client, avoiding hydration mismatches.
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timerId = setInterval(() => {
        setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000 * 60); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  return <span className="hidden lg:inline">{time}</span>;
}

export default function TopBar({ user, workspace }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();
  const { handleCommandSubmit, isLoading, upsertApp } = useAppStore();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    handleCommandSubmit(command);
    formRef.current?.reset();
  };
  
  const handleProfileClick = () => {
    if (user) {
        upsertApp('user-profile-settings', {
            id: 'singleton-user-profile',
            title: `Profile: ${user.firstName || user.email}`,
            contentProps: { user }
        });
    }
  };
  
  const handleBillingClick = () => {
      upsertApp('usage-monitor', { id: 'singleton-usage-monitor' });
  }

  const displayName = user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email) : "Operator";
  const roleText = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Operator';
  
  const agentName = user?.agentAlias || 'BEEP';
  const placeholderText = isMobile ? `${agentName} Command...` : `Ask ${agentName} to...`;

  return (
    <header className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg rounded-lg gap-2 sm:gap-4">
      <div className="flex items-center gap-3">
        <Link href="/">
            <Image src="/logo-neutral.svg" alt="Aevon OS Logo" width={32} height={32} />
        </Link>
      </div>

      <div className="flex-1 max-w-xl">
        <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
          <Input
            name="command"
            type="text"
            placeholder={placeholderText}
            className={cn(
              "w-full bg-background/80 text-foreground placeholder:text-muted-foreground border-border/50 h-10",
              "focus-visible:ring-1 focus-visible:ring-roman-aqua",
              isLoading && "ring-1 ring-inset ring-roman-aqua animate-pulse"
            )}
            disabled={isLoading}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-sm text-foreground">
        <div className="hidden md:flex items-center gap-4 text-sm font-lexend">
          <CurrentTime />
          <div className="h-6 w-px bg-border/30" />
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleProfileClick}>
            <span>{displayName} | {roleText}</span>
          </Button>
           <div className="h-6 w-px bg-border/30" />
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground" onClick={handleBillingClick}>
            <span>
              Ξ <span className="text-gilded-accent font-bold">{workspace?.credits?.toFixed(2) ?? '0.00'}</span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
```
- src/components/micro-app-card.tsx</file>
    <content><![CDATA[
'use client';

import React from 'react';
import 'react-resizable/css/styles.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { cn } from '@/lib/utils';
import { ResizableBox } from 'react-resizable';

interface MicroAppCardProps {
  app: MicroApp;
}

export default function MicroAppCard({ app }: MicroAppCardProps) {
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const bringToFront = useAppStore((state) => state.bringToFront);
  const handleResize = useAppStore((state) => state.handleResize);
  const Icon = getAppIcon(app.type);
  const ContentComponent = getAppContent(app.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: app.id });

  const style = {
    position: 'absolute' as const,
    top: app.position.y,
    left: app.position.x,
    zIndex: app.zIndex,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
  };

  const hasContent = !!ContentComponent;
  const isActionable = ['echo-recall', 'aegis-control', 'ai-suggestion'].includes(app.type) && !hasContent;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Stop propagation to prevent card's listeners from firing when clicking on content
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button, a, input, textarea, select')) {
        return;
    }
    bringToFront(app.id);
  }

  const handleCardClick = () => {
    if (isDragging) return;
    if (isActionable) {
      triggerAppAction(app.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group" onPointerDown={handlePointerDown}>
        <ResizableBox
            width={app.size.width}
            height={app.size.height}
            onResizeStop={(e, data) => {
                e.stopPropagation();
                handleResize(app.id, data.size);
            }}
            draggableOpts={{ disabled: true }}
            minConstraints={[320, 240]}
            maxConstraints={[1000, 800]}
            className="relative shadow-lg rounded-lg"
            handle={<span className="absolute bottom-2 right-2 box-border w-5 h-5 cursor-se-resize border-2 border-solid border-muted-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20" />}
        >
            <Card
                className={cn(
                    "hover:border-primary transition-all duration-300 flex flex-col w-full h-full",
                    isActionable && "cursor-pointer"
                )}
                onClick={handleCardClick}
            >
                <CardHeader
                    {...attributes}
                    {...listeners}
                    className="flex flex-row items-center space-x-4 p-4 cursor-grab active:cursor-grabbing flex-shrink-0"
                >
                    <div className="w-12 h-12 flex-shrink-0 items-center justify-center">
                    <Icon className="w-full h-full text-primary" />
                    </div>
                    <div className="text-left overflow-hidden">
                    <CardTitle className="font-headline text-lg text-foreground truncate">{app.title}</CardTitle>
                    {!hasContent && (
                        <CardDescription className="text-left text-muted-foreground text-sm">
                        {app.description}
                        </CardDescription>
                    )}
                    </div>
                </CardHeader>
                {ContentComponent && (
                    <CardContent className="flex-grow p-0 overflow-hidden min-h-0">
                        <div className="w-full h-full overflow-y-auto">
                            <ContentComponent id={app.id} {...app.contentProps} />
                        </div>
                    </CardContent>
                )}
            </Card>
      </ResizableBox>
    </div>
  );
}
```
- src/components/ui/alert-dialog.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg",
        "rounded-lg text-card-foreground",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```
- src/components/ui/card.tsx</file>
    <content><![CDATA[
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg text-card-foreground",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```
- src/components/ui/dialog.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg",
        "rounded-lg text-card-foreground",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```
- src/components/ui/dropdown-menu.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
       "bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```
- src/components/ui/popover.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 p-4 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "rounded-lg bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
```
- src/components/ui/select.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "bg-background/70 backdrop-blur-xl border border-border/20",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```
- src/components/ui/sheet.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 p-0 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        sheetVariants({ side }), 
        "bg-background/70 backdrop-blur-xl border-border/20 text-card-foreground shadow-lg",
        className
        )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left p-4 border-b",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 border-t",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```
- src/components/ui/input.tsx</file>
    <content><![CDATA[
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
