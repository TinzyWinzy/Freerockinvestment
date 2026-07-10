const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const PHONE = '+263778931251'

interface MessageData {
  name: string
  quoteId?: string
  packageName?: string
  totalUsd?: number
  depositUsd?: number
  installDate?: string
  installerName?: string
  installerPhone?: string
  enrollmentId?: string
  intakeDate?: string
}

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export function quoteReadyMessage(data: MessageData): string {
  return `Hi ${data.name}, your Freerock solar quote is ready!
Quote ID: ${data.quoteId}
Package: ${data.packageName}
Total: $${data.totalUsd}
Deposit: $${data.depositUsd}
Pay securely: ${SITE_URL}/solar/payment?quoteId=${data.quoteId}

Questions? Reply here or call ${PHONE}`
}

export function paymentConfirmedMessage(data: MessageData): string {
  return `Payment received, ${data.name}!
Quote: ${data.quoteId}
Deposit paid: $${data.depositUsd}
Balance due: $${(data.totalUsd || 0) - (data.depositUsd || 0)}
Install scheduled: ${data.installDate || 'TBD'}
Installer: ${data.installerName || 'TBD'} (${data.installerPhone || PHONE})

Track your install: ${SITE_URL}/solar/quote/${data.quoteId}`
}

export function trainingEnrolledMessage(data: MessageData): string {
  return `Welcome to Freerock Solar Training, ${data.name}!
Enrollment ID: ${data.enrollmentId}
Intake date: ${data.intakeDate}
Venue: 123 Chinhoyi Mall, Office 12, First Floor

Please bring:
- National ID
- Notebook and pen
- Safety boots (if you have them)

See you there!`
}
