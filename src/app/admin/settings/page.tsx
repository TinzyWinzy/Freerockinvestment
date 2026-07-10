'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'

export default function SettingsPage() {
  const [rate, setRate] = useState('350')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // TODO: Save to Supabase exchange_rates table
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F2937] mb-6" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="card-static p-6">
          <h2 className="font-semibold text-[#1F2937] mb-4">Exchange Rate</h2>
          <p className="text-sm text-gray-500 mb-3">Override the official RBZ rate for quote calculations</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">1 USD = </span>
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="flex-1 max-w-[120px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20" />
            <span className="text-sm font-medium text-gray-600">ZIG</span>
            <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">Save</button>
          </div>
          {saved && <p className="text-xs text-[#228B22] mt-2">Rate updated successfully</p>}
        </div>

        <div className="card-static p-6">
          <h2 className="font-semibold text-[#1F2937] mb-4">Business Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Business Name</label>
              <input type="text" defaultValue="Freerock Investments" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
              <input type="text" defaultValue="+263 77 893 1251" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input type="email" defaultValue="freerockinvestments@gmail.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20" />
            </div>
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="font-semibold text-[#1F2937] mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { label: 'New lead notifications', defaultChecked: true },
              { label: 'Payment confirmations', defaultChecked: true },
              { label: 'Daily summary email', defaultChecked: false },
              { label: 'SMS for install reminders', defaultChecked: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-[#228B22]" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card-static p-6 border border-red-200">
          <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-3">Irreversible actions. Proceed with caution.</p>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Export All Data</button>
        </div>
      </div>
    </div>
  )
}
