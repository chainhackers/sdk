/**
 * A reusable loading spinner component that centers itself in its container
 */
export function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-text-on-surface-variant border-t-transparent" />
    </div>
  )
}
