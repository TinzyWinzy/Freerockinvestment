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
  rate: {
    get: () => fetch('/api/rate').then((r) => r.json()),
  },
}
