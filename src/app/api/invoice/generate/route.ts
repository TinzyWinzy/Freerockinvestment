import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()
  const { quoteId, customerName, items, total, deposit } = data

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #1F2937; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { color: #228B22; margin: 0; font-size: 24px; }
      .header p { color: #6B7280; font-size: 14px; }
      .details { margin-bottom: 20px; }
      .details table { width: 100%; border-collapse: collapse; }
      .details td { padding: 4px 0; font-size: 14px; }
      .details td:last-child { text-align: right; }
      table.items { width: 100%; border-collapse: collapse; margin: 20px 0; }
      table.items th { background: #228B22; color: white; padding: 10px; text-align: left; font-size: 13px; }
      table.items td { padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
      table.items td:last-child { text-align: right; }
      .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 10px; }
      .deposit { text-align: right; font-size: 14px; color: #228B22; margin-top: 5px; }
      .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9CA3AF; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Freerock Investments</h1>
      <p>Solar &amp; Renewable Energy Solutions</p>
    </div>
    <div class="details">
      <table>
        <tr><td><strong>Quote ID:</strong> ${quoteId}</td><td><strong>Date:</strong> ${new Date().toLocaleDateString()}</td></tr>
        <tr><td><strong>Customer:</strong> ${customerName}</td><td></td></tr>
      </table>
    </div>
    <table class="items">
      <tr><th>Item</th><th>Amount (USD)</th></tr>
      ${items.map((item: any) => `<tr><td>${item.name}</td><td>$${item.price.toLocaleString()}</td></tr>`).join('')}
    </table>
    <div class="total">Total: $${total.toLocaleString()}</div>
    <div class="deposit">Deposit Due: $${deposit.toLocaleString()}</div>
    <div class="footer">
      <p>123 Chinhoyi Mall, Office 12, First Floor | +263 77 893 1251</p>
      <p>freerockinvestments@gmail.com | www.freerock.co.zw</p>
    </div>
  </body>
  </html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
