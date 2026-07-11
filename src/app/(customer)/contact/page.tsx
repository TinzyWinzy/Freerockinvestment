import { Phone, Mail, MapPin, MessageCircle, Play, Camera, Music2 } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { Container } from '@/components/Container'
import { getWhatsAppLink } from '@/lib/whatsapp'

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Contact Us</h1>
        <p className="text-sm text-white/80 mt-1">We&apos;re here to help</p>
      </header>

      <section className="flex-1 py-4 space-y-4"><Container>
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-freerock shrink-0" />
            <div>
              <p className="text-sm font-medium text-freerock-dark">Phone</p>
              <a href={`tel:${SITE.phone}`} className="text-sm text-freerock">{SITE.phone}</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-freerock shrink-0" />
            <div>
              <p className="text-sm font-medium text-freerock-dark">Email</p>
              <a href={`mailto:${SITE.email}`} className="text-sm text-freerock">{SITE.email}</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-freerock shrink-0" />
            <div>
              <p className="text-sm font-medium text-freerock-dark">Location</p>
              <p className="text-sm text-gray-600">123 Chinhoyi Mall, Office 12, First Floor</p>
            </div>
          </div>
        </div>

        <a
          href={getWhatsAppLink("Hi Freerock, I'd like to find out more about your solar services.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Chat on WhatsApp
        </a>

        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-freerock-dark mb-3">Follow Us</p>
          <div className="flex gap-4">
            <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500">
              <Play className="w-5 h-5" /> YouTube
            </a>
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-500">
              <Camera className="w-5 h-5" /> Instagram
            </a>
            <a href={SITE.social.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
              <Music2 className="w-5 h-5" /> TikTok
            </a>
          </div>
        </div>
      </Container></section>
    </div>
  )
}
