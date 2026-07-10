const rateMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateMap.get(key)

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateMap) {
      if (now > record.resetAt) rateMap.delete(key)
    }
  }, 300000)
}
