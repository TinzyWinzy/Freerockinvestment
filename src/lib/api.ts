export const API = {
  services: {
    list: () => fetch('/api/services').then((r) => r.json()),
    get: (id: string) => fetch(`/api/services/${id}`).then((r) => r.json()),
  },
  quote: {
    create: (data: unknown) =>
      fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    get: (id: string) => fetch(`/api/quote/${id}`).then((r) => r.json()),
    update: (id: string, data: unknown) =>
      fetch(`/api/quote/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    remove: (id: string) => fetch(`/api/quote/${id}`, { method: 'DELETE' }).then((r) => r.json()),
  },
  payment: {
    initiate: (data: unknown) =>
      fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  training: {
    intakes: () => fetch('/api/training/intakes').then((r) => r.json()),
    enroll: (data: unknown) =>
      fetch('/api/training/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  customDesign: {
    create: (data: unknown) =>
      fetch('/api/custom-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  auditRepair: {
    create: (data: unknown) =>
      fetch('/api/audit-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  },
  rate: {
    get: () => fetch('/api/rate').then((r) => r.json()),
    update: (rate: number) =>
      fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate }),
      }).then((r) => r.json()),
  },
  admin: {
    leads: (params?: Record<string, string>) =>
      fetch(`/api/admin/leads${params ? '?' + new URLSearchParams(params).toString() : ''}`).then((r) => r.json()),
    analytics: () => fetch('/api/admin/analytics').then((r) => r.json()),
  },
}
