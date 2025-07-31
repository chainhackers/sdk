import { cn } from "../../lib/utils"
import type { LeaderboardItem } from "../../types/types"
import { LeaderboardCard } from "./LeaderboardCard"

interface LeaderboardListProps {
  title: string
  items: LeaderboardItem[]
}

export function LeaderboardList({ title, items }: LeaderboardListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <LeaderboardCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
