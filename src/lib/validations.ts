import { z } from 'zod'

// Postel's Law: accept spaces/dashes as typed (matches every placeholder in the UI),
// normalize before validating, so "+263 77 123 4567" and "+263771234567" both pass.
const zimPhone = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+263\d{9}$/, 'Enter a valid Zimbabwe number, e.g. +263 77 123 4567'))

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: zimPhone,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

export const trainingEnrollmentSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: zimPhone,
  idNumber: z.string().min(5, 'ID number required'),
  education: z.string().optional(),
  emergencyContact: z.string().min(2, 'Emergency contact required'),
  paymentOption: z.enum(['full', 'deposit', 'installment']),
})

export const auditBookingSchema = z.object({
  serviceId: z.string().min(1, 'Select a service'),
  date: z.string().min(1, 'Select a date'),
  location: z.string().min(5, 'Enter your address'),
  phone: zimPhone,
})

export const customDesignSchema = z.object({
  propertySize: z.string().min(1, 'Enter property size'),
  energyUsage: z.string().min(1, 'Enter energy usage'),
  budget: z.number().min(100, 'Minimum budget $100'),
  need3D: z.boolean(),
  needFinancialAnalysis: z.boolean(),
  name: z.string().min(2, 'Name required'),
  phone: zimPhone,
})

export const wizardStep1Schema = z.object({
  roofType: z.string().min(1, 'Select a roof type'),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  phases: z.enum(['single', 'three']),
})

export const wizardStep2Schema = z.object({
  province: z.string().min(1, 'Select a province'),
  city: z.string().min(1, 'Select a city'),
  suburb: z.string().min(1, 'Enter your suburb'),
  truckAccess: z.boolean(),
  installDate: z.string().min(1, 'Select a date'),
})

export const wizardStep4Schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: zimPhone,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  terms: z.literal(true, { error: () => ({ message: 'Accept the terms & conditions to continue' }) }),
})
