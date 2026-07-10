import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 text-center">
      <Zap className="w-12 h-12 text-freerock mb-4" />
      <h1 className="text-2xl font-bold text-freerock-dark">Page not found</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="mt-6 bg-freerock text-white rounded-lg px-6 py-3 font-semibold text-sm"
      >
        Back to Home
      </Link>
    </div>
  )
}
