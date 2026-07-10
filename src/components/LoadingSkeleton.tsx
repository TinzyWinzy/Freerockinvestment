export function CardSkeleton() {
  return (
    <div className="card !rounded-2xl p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-32 skeleton rounded-md" />
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-14 skeleton rounded-xl" />
        <div className="h-14 skeleton rounded-xl" />
        <div className="h-14 skeleton rounded-xl" />
      </div>
      <div className="h-10 skeleton rounded-xl" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-12 skeleton rounded-xl" />
      <div className="h-12 skeleton rounded-xl" />
      <div className="h-12 skeleton rounded-xl" />
      <div className="h-12 skeleton rounded-xl" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 skeleton rounded-2xl" />
      ))}
    </div>
  )
}
