export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatUSD(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatZIG(amount: number) {
  return `ZIG ${amount.toLocaleString('en-ZW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function generateQuoteId() {
  const now = new Date()
  const yymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `FRQ-${yymm}-${seq}`
}

export function generateEnrollmentId() {
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `ENR-${seq}`
}

export function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}
