export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border bg-white" />
      <div className="container-unaysale py-8">
        <div className="mb-8 space-y-3">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-4 w-96" />
        </div>
        <div className="mb-6 flex gap-4">
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-4">
              <div className="skeleton mb-3 h-48 w-full rounded-lg" />
              <div className="skeleton mb-2 h-5 w-3/4" />
              <div className="skeleton mb-2 h-4 w-1/2" />
              <div className="skeleton mb-3 h-4 w-2/3" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
