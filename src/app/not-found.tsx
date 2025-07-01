
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-headline mb-4">404</h2>
      <p className="text-xl text-muted-foreground mb-8">This Sanctum is not on the star-chart.</p>
      <Link href="/">
        <Button>Return to Canvas</Button>
      </Link>
    </div>
  )
}
