import { SOLAR_PACKAGES, DEPOSIT_RATES, TV_BUNDLE_PRICES, AUDIT_SERVICES } from '@/lib/constants'

export interface QuoteAddons {
  tvBundle?: boolean
  installation?: boolean
  extraPanels?: number
  auditIds?: string[]
}

export interface QuotePricing {
  packagePrice: number
  tvBundlePrice: number
  installationPrice: number
  extraPanelPrice: number
  auditPrice: number
  subtotal: number
  depositRate: number
  depositAmount: number
  balance: number
}

/** Single source of truth for solar-package pricing math — used by the quote
 *  API, the admin leads normalizer, and anywhere else pricing needs recomputing
 *  from a stored config instead of trusting client-supplied numbers. */
export function calculateSolarPricing(serviceId: string, addons: QuoteAddons = {}): QuotePricing | null {
  const pkg = SOLAR_PACKAGES.find((p) => p.id === serviceId)
  if (!pkg) return null

  const depositRate = DEPOSIT_RATES[serviceId] ?? 0.5
  const tvBundlePrice = addons.tvBundle ? (TV_BUNDLE_PRICES[serviceId] ?? 0) : 0
  const installationPrice = addons.installation ? 0 : 0
  const extraPanelPrice = (addons.extraPanels ?? 0) * 150
  const auditPrice = (addons.auditIds ?? []).reduce((sum, id) => {
    const audit = AUDIT_SERVICES.find((a) => a.id === id)
    return sum + (audit?.priceUSD ?? 0)
  }, 0)

  const subtotal = pkg.priceUSD + tvBundlePrice + installationPrice + extraPanelPrice + auditPrice
  const depositAmount = Math.round(subtotal * depositRate * 100) / 100

  return {
    packagePrice: pkg.priceUSD,
    tvBundlePrice,
    installationPrice,
    extraPanelPrice,
    auditPrice,
    subtotal,
    depositRate,
    depositAmount,
    balance: subtotal - depositAmount,
  }
}
