import type { LeaderboardItem } from "../../types/types"
import { LeaderboardCard } from "./LeaderboardCard"

interface LeaderboardListProps {
  title: string
  items: LeaderboardItem[]
  onViewOverview?: (id: string) => void
}

export function LeaderboardList({ title, items, onViewOverview }: LeaderboardListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <LeaderboardCard key={item.id} item={item} onViewOverview={onViewOverview} />
        ))}
      </div>
    </div>
  )
}
