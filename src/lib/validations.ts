import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+263\d{9}$/, 'Phone must be in format +263XXXXXXXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

export const locationSchema = z.object({
  province: z.string().min(1, 'Select a province'),
  city: z.string().min(1, 'Select a city'),
  suburb: z.string().min(1, 'Enter your suburb'),
  truckAccess: z.boolean(),
  installDate: z.string().min(1, 'Select a date'),
})

export const quoteWizardSchema = z.object({
  packageId: z.string().min(1, 'Select a package'),
  roofType: z.string().min(1, 'Select roof type'),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  phases: z.enum(['single', 'three']),
  province: z.string().min(1, 'Select province'),
  city: z.string().min(1, 'Select city'),
  suburb: z.string().min(1, 'Enter suburb'),
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(5, 'Phone required'),
  terms: z.literal(true, { error: () => ({ message: 'Accept terms to continue' }) }),
})

export const trainingEnrollmentSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^\+263\d{9}$/, 'Valid Zimbabwe phone required'),
  idNumber: z.string().min(5, 'ID number required'),
  education: z.string().optional(),
  emergencyContact: z.string().min(2, 'Emergency contact required'),
  paymentOption: z.enum(['full', 'deposit', 'installment']),
})

export const auditBookingSchema = z.object({
  serviceId: z.string().min(1, 'Select a service'),
  date: z.string().min(1, 'Select a date'),
  location: z.string().min(5, 'Enter your address'),
  phone: z.string().regex(/^\+263\d{9}$/, 'Valid Zimbabwe phone required'),
})

export const customDesignSchema = z.object({
  propertySize: z.string().min(1, 'Enter property size'),
  energyUsage: z.string().min(1, 'Enter energy usage'),
  budget: z.number().min(100, 'Minimum budget $100'),
  need3D: z.boolean(),
  needFinancialAnalysis: z.boolean(),
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(5, 'Phone required'),
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
