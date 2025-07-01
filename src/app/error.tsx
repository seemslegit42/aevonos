
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-headline text-destructive mb-4">A Disturbance in the Aether</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        The system has encountered an unexpected instability. The Architect has been notified. You may attempt to restore the connection or return to the safety of the main Canvas.
      </p>
      <div className="flex gap-4">
        <Button
            variant="outline"
            onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
            }
        >
            Try Again
        </Button>
         <Button onClick={() => window.location.href = '/'}>
            Return to Canvas
        </Button>
      </div>
    </div>
  )
}
