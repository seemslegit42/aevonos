
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { BeepAvatar } from "@/components/beep-avatar"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isBeepToast = title?.toString().startsWith('BEEP');
        return (
          <Toast key={id} {...props}>
            <div className="flex w-full items-start gap-3">
              {isBeepToast && <BeepAvatar className="h-8 w-8 flex-shrink-0" />}
              <div className="grid flex-grow gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
