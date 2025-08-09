export function formatExpireAt(expiresAt: Date) {
  const dateNow = new Date()
  const diffInMs = expiresAt.getTime() - dateNow.getTime()

  if (diffInMs <= 0) {
    return "expired"
  }

  let months = 0
  const testDate = new Date(dateNow)

  while (testDate < expiresAt) {
    testDate.setMonth(testDate.getMonth() + 1)
    if (testDate <= expiresAt) {
      months++
    } else {
      break
    }
  }

  if (months >= 1) {
    return formatTimeUnit("month", months)
  }

  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diffInMs / (1000 * 60 * 60))
  const minutes = Math.floor(diffInMs / (1000 * 60))
  const seconds = Math.floor(diffInMs / 1000)

  if (days >= 1) {
    return formatTimeUnit("day", days)
  }

  if (hours >= 1) {
    return formatTimeUnit("hour", hours)
  }

  if (minutes >= 1) {
    return formatTimeUnit("minute", minutes)
  }

  return formatTimeUnit("second", seconds)
}

function formatTimeUnit(timeUnit: string, value: number): string {
  const suffix = value > 1 ? "s" : ""
  return `in ${value} ${timeUnit}${suffix}`
}
