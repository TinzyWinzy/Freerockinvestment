'use client'

import { Component } from 'react'

interface Props { children: React.ReactNode; fallback?: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[200px] px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h3 className="font-semibold text-[#1F2937]">Something went wrong</h3>
          <p className="text-sm text-gray-500 mt-1">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#228B22] text-white rounded-lg text-sm font-medium hover:bg-[#228B22]/90 transition-colors">Try Again</button>
        </div>
      )
    }
    return this.props.children
  }
}
