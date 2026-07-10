export const SITE = {
  name: 'Freerock Solar & Energy',
  shortName: 'Freerock',
  description: 'Instant solar quotes, professional installation, and certified training in Zimbabwe.',
  url: 'https://freerock.co.zw',
  phone: '+263 77 893 1251',
  email: 'freerockinvestments@gmail.com',
  social: {
    youtube: 'https://youtube.com/@freerock_investments_zw',
    instagram: 'https://instagram.com/freerock_investments_zw',
    tiktok: 'https://tiktok.com/@freerock_investments_zw',
  },
  youtubeSubs: 25000,
  currency: 'USD',
  secondaryCurrency: 'ZIG',
}

export const SOLAR_PACKAGES = [
  {
    id: '3.2kva',
    kva: 3.2,
    name: '3.2kVA Solar System',
    priceUSD: 1800,
    specs: { inverter: 'Felicity Hybrid 3.2kVA', battery: '48V 100Ah Lithium', panels: '550W x 4' },
    popular: false,
  },
  {
    id: '5.5kva',
    kva: 5.5,
    name: '5.5kVA Solar System',
    priceUSD: 3200,
    specs: { inverter: 'Felicity Hybrid 5.5kVA', battery: '48V 200Ah Lithium', panels: '550W x 6' },
    popular: true,
  },
  {
    id: '8kva',
    kva: 8,
    name: '8kVA Solar System',
    priceUSD: 4800,
    specs: { inverter: 'Felicity Hybrid 8kVA', battery: '48V 200Ah Lithium x2', panels: '550W x 8' },
    popular: false,
  },
  {
    id: '10kva',
    kva: 10,
    name: '10kVA Solar System',
    priceUSD: 6200,
    specs: { inverter: 'Felicity Hybrid 10kVA', battery: '48V 200Ah Lithium x3', panels: '550W x 10' },
    popular: false,
  },
  {
    id: '12kva',
    kva: 12,
    name: '12kVA Solar System',
    priceUSD: 7800,
    specs: { inverter: 'Felicity Hybrid 12kVA', battery: '48V 200Ah Lithium x4', panels: '550W x 12' },
    popular: false,
  },
] as const

export const ROOF_TYPES = [
  { id: 'tile', label: 'Tile' },
  { id: 'corrugated', label: 'Corrugated' },
  { id: 'flat', label: 'Flat' },
  { id: 'ground', label: 'Ground Mount' },
] as const

export const PROPERTY_TYPES = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'industrial', label: 'Industrial' },
] as const

export const PROVINCES = [
  'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central',
  'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North',
  'Matabeleland South', 'Midlands',
] as const

export const DEPOSIT_RATES: Record<string, number> = {
  '3.2kva': 0.3,
  '5.5kva': 0.4,
  '8kva': 0.5,
  '10kva': 0.5,
  '12kva': 0.5,
}

export const TV_BUNDLE_PRICES: Record<string, number> = {
  '3.2kva': 150,
  '5.5kva': 200,
  '8kva': 250,
  '10kva': 300,
  '12kva': 300,
}

export const AUDIT_SERVICES = [
  { id: 'energy-audit', name: 'Energy Audit', priceUSD: 100 },
  { id: 'financial-audit', name: 'Financial Audit / ROI Analysis', priceUSD: 150 },
  { id: 'system-diagnosis', name: 'System Diagnosis', priceUSD: 80, callOutRate: 50 },
  { id: 'fault-repair', name: 'Fault Finding & Repair', priceUSD: null },
] as const

export const TRAINING = {
  priceUSD: 300,
  duration: '2 weeks',
  location: '123 Chinhoyi Mall, Office 12, First Floor',
  curriculum: {
    week1: ['Foundation & Safety', 'Tools & Equipment', 'System Components', 'Protection Devices', 'System Design'],
    week2: ['Installation Planning', 'Panel Mounting & Wiring', 'Inverter & Battery Setup', 'Testing & Commissioning', 'Startup & Handover'],
  },
  requirements: ['Literacy (ability to read and write)', 'Electrical background advantageous'],
}

export const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'My Quotes', href: '/quotes', icon: 'FileText' },
  { label: 'Contact', href: '/contact', icon: 'Phone' },
] as const
